import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Edit3, Printer, Download } from "lucide-react";

export default function QuickActions() {
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-foreground">Canon PIXMA ID</span>
              </div>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">Paper Level</span>
                  <span className="text-muted-foreground">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">Ink Level</span>
                  <span className="text-muted-foreground">76%</span>
                </div>
                <Progress value={76} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
