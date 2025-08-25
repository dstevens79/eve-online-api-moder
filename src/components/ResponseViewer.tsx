import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download } from '@phosphor-icons/react';
import { ApiResponse } from '@/lib/types';
import { toast } from 'sonner';

interface ResponseViewerProps {
  response: ApiResponse;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'destructive';
    if (status >= 500) return 'destructive';
    return 'secondary';
  };

  const getStatusVariant = (status: number) => {
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400) return 'destructive';
    return 'secondary';
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    toast.success('Response copied to clipboard');
  };

  const downloadResponse = () => {
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eve-api-response-${response.timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Response downloaded');
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderJsonValue = (value: any, depth = 0): React.ReactElement => {
    const indent = '  '.repeat(depth);
    
    if (value === null) {
      return <span className="text-muted-foreground">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-accent">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-primary">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-emerald-600">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span>[]</span>;
      }
      
      return (
        <div>
          <span>[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderJsonValue(item, depth + 1)}
              {index < value.length - 1 && <span>,</span>}
            </div>
          ))}
          <span>]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span>{'{}'}</span>;
      }
      
      return (
        <div>
          <span>{'{'}</span>
          {keys.map((key, index) => (
            <div key={key} className="ml-4">
              <span className="text-blue-600">"{key}"</span>
              <span>: </span>
              {renderJsonValue(value[key], depth + 1)}
              {index < keys.length - 1 && <span>,</span>}
            </div>
          ))}
          <span>{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Response
            <Badge variant={getStatusVariant(response.status)}>
              {response.status}
            </Badge>
            <span className="text-sm font-normal text-muted-foreground">
              {formatTimestamp(response.timestamp || Date.now())}
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyResponse}>
              <Copy size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadResponse}>
              <Download size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Headers */}
          {Object.keys(response.headers || {}).length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Headers</h4>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-sm font-mono">
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-primary min-w-[200px]">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Body */}
          <div>
            <h4 className="font-medium mb-2">Response Body</h4>
            <ScrollArea className="h-[400px] w-full rounded-lg border">
              <div className="p-4 font-mono text-sm">
                {renderJsonValue(response.data)}
              </div>
            </ScrollArea>
          </div>

          {/* Response Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={getStatusVariant(response.status)} className="mt-1">
                {response.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Content Type</p>
              <p className="text-sm font-mono">{response.headers?.['content-type'] || 'application/json'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Content Length</p>
              <p className="text-sm font-mono">{response.headers?.['content-length'] || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm">{formatTimestamp(response.timestamp || Date.now())}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}