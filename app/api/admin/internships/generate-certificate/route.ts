import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import qrcode from 'qrcode';

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, domain, start_date } = await request.json();
    if (!email || !domain || !start_date) {
      return NextResponse.json({ error: "Email, domain, and start date are required" }, { status: 400 });
    }

    // 1. Fetch profile to get the name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found for the given email." }, { status: 404 });
    }

    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    if (!fullName) {
        return NextResponse.json({ error: "First name and last name are missing from the profile." }, { status: 400 });
    }

    // 2. Generate verification code and update the database
    const verification_code = uuidv4();
    const { error: updateError } = await supabase
      .from('interns')
      .update({ verification_code })
      .eq('email', email)
      .eq('domain', domain)
      .eq('start_date', start_date);

    if (updateError) {
        throw new Error(`Failed to update internship with verification code: ${updateError.message}`);
    }

    // 3. Load the certificate template image
    const templatePath = path.resolve("./public/images/certificate-template.png");
    const templateImageBytes = await fs.readFile(templatePath);

    // 4. Create a new PDF document and embed the template
    const pdfDoc = await PDFDocument.create();
    const templateImage = await pdfDoc.embedPng(templateImageBytes);
    const { width, height } = templateImage.scale(1);

    const page = pdfDoc.addPage([width, height]);
    page.drawImage(templateImage, { x: 0, y: 0, width, height });

    // 5. Add the text to the PDF
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    page.drawText(fullName, {
      x: (width - font.widthOfTextAtSize(fullName, 60)) / 2,
      y: height / 2 - 20,
      size: 60,
      font: font,
      color: rgb(1, 1, 1),
    });

    // 6. Generate and embed the QR code
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify?code=${verification_code}`;
    const qrImageBytes = await qrcode.toBuffer(verificationUrl, { type: 'png' });
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
        x: width - qrImage.width * 0.5 - 60, // position bottom right
        y: 20,
        width: qrImage.width * 0.7,
        height: qrImage.height * 0.7,
    });

    // 7. Save the PDF to a buffer
    const pdfBytes = await pdfDoc.save();

    // 8. Upload the generated PDF to Supabase Storage
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9-._]/g, "_");
    const uniqueId = uuidv4().slice(0, 8);
    const filePath = `public/${sanitizedEmail}_${uniqueId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("internship-certificates")
      .upload(filePath, pdfBytes, { 
        contentType: "application/pdf",
        upsert: true 
      });

    if (uploadError) {
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }

    // 9. Get the public URL and return it with the verification code
    const { data: publicUrlData } = supabase.storage
      .from("internship-certificates")
      .getPublicUrl(filePath);

    return NextResponse.json({ 
        publicUrl: publicUrlData.publicUrl,
        verification_code: verification_code
    });

  } catch (e) {
    console.error("Certificate Generation Error:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
