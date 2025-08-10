"use client";

import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download, ExternalLink } from "lucide-react";

export type InternshipRow = {
  email: string;
  passed: boolean | null;
  domain:
    | "Web Development"
    | "Python"
    | "Artificial Intelligence"
    | "Machine Learning"
    | "Java";
  start_date: string; // date
  end_date: string; // date
  certificate_url: string | null;
  certificate_issued_at: string | null; // timestamptz
  project_name: string | null;
  project_url: string | null;
};

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function isImageUrl(url: string): boolean {
  return /(\.png|\.jpg|\.jpeg|\.webp|\.gif)(\?.*)?$/i.test(url);
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url);
}

type Props = {
  internships: InternshipRow[];
};

export default function InternshipsTable({ internships }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const open = useMemo(() => Boolean(previewUrl), [previewUrl]);

  return (
    <div className="overflow-x-auto border rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Project Name</TableHead>
            <TableHead className="min-w-[160px]">Domain</TableHead>
            <TableHead className="min-w-[160px]">Project Link</TableHead>
            <TableHead className="min-w-[120px]">Start Date</TableHead>
            <TableHead className="min-w-[120px]">End Date</TableHead>
            <TableHead className="min-w-[160px]">Preview Certificate</TableHead>
            <TableHead className="min-w-[180px]">Download Certificate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {internships.map((intern, idx) => {
            const hasCert = Boolean(intern.certificate_url);
            return (
              <TableRow key={`${intern.email}-${idx}`} className="align-middle">
                <TableCell className="text-sm font-medium">
                  {intern.project_name || "—"}
                </TableCell>
                <TableCell className="text-sm">{intern.domain}</TableCell>
                <TableCell className="text-sm">
                  {intern.project_url ? (
                    <a
                      href={intern.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary underline break-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="truncate max-w-[220px] inline-block align-middle">{intern.project_url}</span>
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-sm">{formatDate(intern.start_date)}</TableCell>
                <TableCell className="text-sm">{formatDate(intern.end_date)}</TableCell>
                <TableCell>
                  {hasCert ? (
                    <button
                      onClick={() => setPreviewUrl(intern.certificate_url as string)}
                      className="group relative w-28 h-16 rounded-md overflow-hidden border bg-background hover:ring-2 hover:ring-primary/40 focus:outline-none"
                      aria-label="Preview certificate"
                    >
                      {/* Thumbnail */}
                      {intern.certificate_url && isImageUrl(intern.certificate_url) ? (
                        // Image thumbnail
                        <img
                          src={intern.certificate_url}
                          alt="Certificate thumbnail"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        // PDF or unknown: use iframe snapshot
                        <iframe
                          src={intern.certificate_url || undefined}
                          className="absolute inset-0 w-full h-full"
                          title="Certificate thumbnail"
                        />
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not available</span>
                  )}
                </TableCell>
                <TableCell>
                  {hasCert ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={intern.certificate_url!} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Preview Modal */}
      <Dialog open={open} onOpenChange={(v) => !v && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
            <DialogDescription>Preview your internship certificate.</DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {previewUrl && isImageUrl(previewUrl) ? (
              <img src={previewUrl} alt="Certificate preview" className="w-full h-auto rounded-md border" />
            ) : previewUrl && isPdfUrl(previewUrl) ? (
              <iframe src={previewUrl} className="w-full h-[70vh] rounded-md border" title="Certificate preview" />
            ) : previewUrl ? (
              <iframe src={previewUrl} className="w-full h-[70vh] rounded-md border" title="Certificate preview" />
            ) : null}
          </div>
          {previewUrl && (
            <div className="flex justify-end">
              <Button asChild>
                <a href={previewUrl} download>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
