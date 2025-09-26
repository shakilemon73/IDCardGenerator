import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrintManagerComponent from "@/components/print/print-manager";
import PrintQueue from "@/components/print/print-queue";
import PrinterStatus from "@/components/print/printer-status";

export default function PrintManager() {
  return (
    <div className="p-6 space-y-6" data-testid="print-manager-page">
      <Card>
        <CardHeader>
          <CardTitle>Print Manager</CardTitle>
          <p className="text-muted-foreground">
            Advanced printing controls and queue management for ID cards
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Printer Configuration & Status */}
            <div className="space-y-6">
              <PrinterStatus />
            </div>
            
            {/* Print Queue */}
            <div className="lg:col-span-2">
              <PrintQueue />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Manager Controls */}
      <PrintManagerComponent />
    </div>
  );
}
