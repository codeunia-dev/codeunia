"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, Type } from "lucide-react";
import html2canvas from "html2canvas";

type Props = {
  fullName: string;
  backgroundSrc: string; // e.g. /images/certificatesample.png
};

// Simple text overlay on top of a background image, export as PNG
export default function InternshipCertificate({ fullName, backgroundSrc }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Positioning and text style can be tuned to match the template
  const textStyle = useMemo(
    () => ({
      top: "48%", // adjust to line up on template
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "42px",
      fontWeight: 700,
      letterSpacing: "0.5px",
      color: "#222222",
      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
      fontFamily: "Georgia, 'Times New Roman', serif",
      textAlign: "center" as const,
      width: "80%",
      lineHeight: 1.2,
    }),
    []
  );

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${fullName || "intern"}-certificate.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl border bg-white"
        style={{ aspectRatio: "3 / 2" }}
      >
        {/* Background image */}
        <img
          src={backgroundSrc}
          alt="Certificate background"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />

        {/* Name overlay */}
        <div
          className="absolute mx-auto"
          style={textStyle}
        >
          {fullName}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleDownload} disabled={downloading} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          {downloading ? "Preparing..." : "Download"}
        </Button>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <Type className="w-4 h-4" />
          <span>Auto-placed name on template</span>
        </div>
      </div>
    </div>
  );
}
