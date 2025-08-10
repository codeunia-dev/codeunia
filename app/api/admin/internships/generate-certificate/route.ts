
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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

    // 2. Load the certificate template image
    const templatePath = path.resolve("./public/images/certificate-template.png");
    const templateImageBytes = await fs.readFile(templatePath);

    // 3. Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const templateImage = await pdfDoc.embedPng(templateImageBytes);
    const { width, height } = templateImage.scale(1);

    const page = pdfDoc.addPage([width, height]);
    page.drawImage(templateImage, { x: 0, y: 0, width, height });

    // 4. Add the text to the PDF
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const textSize = 60;
    const textWidth = font.widthOfTextAtSize(fullName, textSize);
    
    page.drawText(fullName, {
      x: (width - textWidth) / 2,
      y: height / 2 - 20, // Adjust this Y-coordinate as needed
      size: textSize,
      font: font,
      color: rgb(0.1, 0.2, 0.3), // A dark navy color
    });

    // 5. Save the PDF to a buffer
    const pdfBytes = await pdfDoc.save();

    // 6. Upload the generated PDF to Supabase Storage
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

    // 7. Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("internship-certificates")
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: publicUrlData.publicUrl });

  } catch (e) {
    console.error("Certificate Generation Error:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
