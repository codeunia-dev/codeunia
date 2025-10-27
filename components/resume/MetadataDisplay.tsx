'use client';

import { useResume } from '@/contexts/ResumeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Download, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function MetadataDisplay() {
  const { resume } = useResume();

  if (!resume) {
    return null;
  }

  const { word_count, page_count, last_exported, export_count } = resume.metadata;

  // Format last exported date
  const formatLastExported = () => {
    if (!last_exported) return 'Never';
    try {
      return formatDistanceToNow(new Date(last_exported), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resume Statistics</CardTitle>
        <CardDescription>Metadata and usage information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Word Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Word Count</span>
          </div>
          <Badge variant="secondary">{word_count || 0}</Badge>
        </div>

        {/* Page Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Page Count</span>
          </div>
          <Badge variant="secondary">
            {page_count || 1} {page_count === 1 ? 'page' : 'pages'}
          </Badge>
        </div>

        {/* Export Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Times Exported</span>
          </div>
          <Badge variant="secondary">{export_count || 0}</Badge>
        </div>

        {/* Last Exported */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last Exported</span>
          </div>
          <span className="text-sm text-muted-foreground">{formatLastExported()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
