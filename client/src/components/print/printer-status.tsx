import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, Wifi, WifiOff, Settings, AlertTriangle, CheckCircle } from "lucide-react";

export default function PrinterStatus() {
  // Mock printer status - in real app this would come from printer API
  const printerStatus = {
    connected: true,
    name: "Canon PIXMA ID Printer",
    model: "PIXMA G3270",
    status: "online", // online, offline, error, busy
    paperLevel: 89,
    inkLevel: 76,
    lastJob: "2024-01-15 14:30:00",
    jobsToday: 23,
    totalJobs: 2847,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      case "offline":
        return (
          <Badge variant="secondary">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case "busy":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Printer className="h-3 w-3 mr-1" />
            Busy
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (printerStatus.connected) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6" data-testid="printer-status">
      {/* Printer Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Printer Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {printerStatus.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {printerStatus.model}
                </p>
              </div>
            </div>
            {getStatusBadge(printerStatus.status)}
          </div>

          <div className="flex items-center justify-end">
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-printer-settings"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Supply Levels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Supply Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground">Paper Level</span>
              <span className="text-muted-foreground">{printerStatus.paperLevel}%</span>
            </div>
            <Progress value={printerStatus.paperLevel} className="h-2" />
            {printerStatus.paperLevel < 20 && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Paper level is low. Please refill soon.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground">Ink Level</span>
              <span className="text-muted-foreground">{printerStatus.inkLevel}%</span>
            </div>
            <Progress value={printerStatus.inkLevel} className="h-2" />
            {printerStatus.inkLevel < 25 && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Ink level is getting low. Consider replacing cartridge.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Print Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Print Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jobs Today</span>
            <span className="font-medium text-foreground">{printerStatus.jobsToday}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Jobs</span>
            <span className="font-medium text-foreground">{printerStatus.totalJobs.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Job</span>
            <span className="font-medium text-foreground text-xs">
              {new Date(printerStatus.lastJob).toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-600 font-medium">Ready to Print</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            data-testid="button-clean-printhead"
          >
            Clean Print Head
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            data-testid="button-align-cartridge"
          >
            Align Cartridge
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            data-testid="button-test-print"
          >
            Test Print
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
