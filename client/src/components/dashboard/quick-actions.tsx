import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Edit3, Printer, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PrinterStatusData {
  name: string;
  status: string;
  isOnline: boolean;
  paperLevel: number;
  inkLevel: number;
  lastUpdate: Date;
}

export default function QuickActions() {
  const { data: printerStatus, isLoading: printerLoading } = useQuery<PrinterStatusData>({
    queryKey: ["/api/printer-status"],
  });
  return (
    <div className="space-y-6" data-testid="quick-actions">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/designer">
            <Button 
              className="w-full flex items-center space-x-3"
              data-testid="button-open-designer"
            >
              <Edit3 className="h-4 w-4" />
              <span>Open Card Designer</span>
            </Button>
          </Link>
          <Link href="/print-manager">
            <Button 
              variant="secondary"
              className="w-full flex items-center space-x-3"
              data-testid="button-bulk-print"
            >
              <Printer className="h-4 w-4" />
              <span>Bulk Print Cards</span>
            </Button>
          </Link>
          <Button 
            variant="outline"
            className="w-full flex items-center space-x-3"
            data-testid="button-export-data"
          >
            <Download className="h-4 w-4" />
            <span>Export Student Data</span>
          </Button>
        </CardContent>
      </Card>

      {/* Printer Status */}
      <Card>
        <CardHeader>
          <CardTitle>Printer Status</CardTitle>
        </CardHeader>
        <CardContent>
          {printerLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    printerStatus?.isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-foreground" data-testid="printer-name">
                    {printerStatus?.name || 'Unknown Printer'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground" data-testid="printer-status">
                  {printerStatus?.status || 'Unknown'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">Paper Level</span>
                    <span className="text-muted-foreground" data-testid="paper-level">
                      {printerStatus?.paperLevel || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={printerStatus?.paperLevel || 0} 
                    className="h-2" 
                    data-testid="paper-progress"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">Ink Level</span>
                    <span className="text-muted-foreground" data-testid="ink-level">
                      {printerStatus?.inkLevel || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={printerStatus?.inkLevel || 0} 
                    className="h-2" 
                    data-testid="ink-progress"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
