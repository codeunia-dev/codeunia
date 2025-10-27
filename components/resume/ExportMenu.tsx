'use client';

import { useState } from 'react';
import { useResume } from '@/contexts/ResumeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileJson, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LazyResumeExportService } from '@/lib/services/resume-export-lazy';
import { ExportFormat } from '@/types/resume';

// Export format options with icons and descriptions
const EXPORT_FORMATS = [
  {
    id: 'pdf' as ExportFormat,
    name: 'PDF',
    description: 'Portable Document Format',
    icon: FileText,
  },
  {
    id: 'docx' as ExportFormat,
    name: 'DOCX',
    description: 'Microsoft Word Document',
    icon: FileText,
  },
  {
    id: 'json' as ExportFormat,
    name: 'JSON',
    description: 'Data format for backup',
    icon: FileJson,
  },
];

interface ExportMenuProps {
  compact?: boolean;
}

export function ExportMenu({ compact = false }: ExportMenuProps) {
  const { resume, updateMetadata } = useResume();
  const [exporting, setExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    if (!resume) {
      toast.error('No resume to export', {
        description: 'Please create or load a resume first.',
      });
      return;
    }

    setExporting(true);
    setExportingFormat(format);

    try {
      // Show progress toast with estimated time
      const progressToast = toast.loading(`Exporting as ${format.toUpperCase()}...`, {
        description: 'Generating your resume. This may take a few seconds.',
        duration: Infinity, // Keep showing until dismissed
      });

      let result;

      // Call appropriate export method based on format (lazy loaded)
      switch (format) {
        case 'pdf':
          result = await LazyResumeExportService.exportToPDF(resume);
          break;
        case 'docx':
          result = await LazyResumeExportService.exportToDOCX(resume);
          break;
        case 'json':
          result = await LazyResumeExportService.exportToJSON(resume);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Dismiss progress toast
      toast.dismiss(progressToast);

      if (result.success && result.blob) {
        // Trigger download
        LazyResumeExportService.triggerDownload(result.blob, result.filename);

        // Update metadata
        updateMetadata({
          last_exported: new Date().toISOString(),
          export_count: resume.metadata.export_count + 1,
        });

        // Show success toast with checkmark animation
        toast.success('Export complete! ✓', {
          description: `Your resume has been downloaded as ${result.filename}`,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />,
          duration: 4000,
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Failed to export your resume. Please try again.',
        icon: <XCircle className="h-4 w-4" />,
      });
    } finally {
      setExporting(false);
      setExportingFormat(null);
    }
  };

  // If compact mode, render as nested menu items
  if (compact) {
    return (
      <>
        {EXPORT_FORMATS.map((format) => {
          const Icon = format.icon;
          const isExportingThis = exporting && exportingFormat === format.id;

          return (
            <DropdownMenuItem
              key={format.id}
              onClick={(e) => {
                e.stopPropagation();
                handleExport(format.id);
              }}
              disabled={exporting}
              className="cursor-pointer pl-8"
            >
              {isExportingThis ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icon className="h-4 w-4 mr-2" />
              )}
              <span>{format.name}</span>
            </DropdownMenuItem>
          );
        })}
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!resume || exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {exporting && exportingFormat
              ? `Exporting ${exportingFormat.toUpperCase()}...`
              : 'Export'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {EXPORT_FORMATS.map((format) => {
          const Icon = format.icon;
          const isExportingThis = exporting && exportingFormat === format.id;

          return (
            <DropdownMenuItem
              key={format.id}
              onClick={() => handleExport(format.id)}
              disabled={exporting}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full">
                {isExportingThis ? (
                  <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 flex-shrink-0" />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium">{format.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {format.description}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
