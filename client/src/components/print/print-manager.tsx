import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Settings, Play, Pause, Square } from "lucide-react";

export default function PrintManagerComponent() {
  const [printerSettings, setPrinterSettings] = useState({
    printer: "canon-pixma-id",
    cardSize: "cr80",
    quality: "high",
    colorMode: "color",
    copies: 1,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(33);

  return (
    <Card data-testid="print-manager-component">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Printer Configuration
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="secondary" 
              size="sm"
              data-testid="button-printer-settings"
            >
              <Settings className="h-4 w-4 mr-2" />
              Advanced Settings
            </Button>
            <Button 
              onClick={() => setIsProcessing(!isProcessing)}
              data-testid="button-start-print"
            >
              {isProcessing ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Queue
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Print Queue
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Printer Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="printer-select">Selected Printer</Label>
              <Select 
                value={printerSettings.printer} 
                onValueChange={(value) => 
                  setPrinterSettings(prev => ({ ...prev, printer: value }))
                }
              >
                <SelectTrigger id="printer-select" data-testid="select-printer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canon-pixma-id">Canon PIXMA ID Printer</SelectItem>
                  <SelectItem value="epson-workforce-pro">Epson WorkForce Pro</SelectItem>
                  <SelectItem value="hp-officejet-pro">HP OfficeJet Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="card-size-select">Card Size</Label>
              <Select 
                value={printerSettings.cardSize} 
                onValueChange={(value) => 
                  setPrinterSettings(prev => ({ ...prev, cardSize: value }))
                }
              >
                <SelectTrigger id="card-size-select" data-testid="select-card-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cr80">CR80 (85.6 × 54 mm)</SelectItem>
                  <SelectItem value="cr79">CR79 (85.6 × 54 mm)</SelectItem>
                  <SelectItem value="custom">Custom Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="print-quality-select">Print Quality</Label>
              <Select 
                value={printerSettings.quality} 
                onValueChange={(value) => 
                  setPrinterSettings(prev => ({ ...prev, quality: value }))
                }
              >
                <SelectTrigger id="print-quality-select" data-testid="select-print-quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Quality (300 DPI)</SelectItem>
                  <SelectItem value="standard">Standard (150 DPI)</SelectItem>
                  <SelectItem value="draft">Draft (75 DPI)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Color Mode</Label>
              <RadioGroup 
                value={printerSettings.colorMode} 
                onValueChange={(value) => 
                  setPrinterSettings(prev => ({ ...prev, colorMode: value as "color" | "grayscale" }))
                }
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="color" id="color" data-testid="radio-color-mode-color" />
                  <Label htmlFor="color">Full Color</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grayscale" id="grayscale" data-testid="radio-color-mode-grayscale" />
                  <Label htmlFor="grayscale">Grayscale</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="copies-input">Number of Copies</Label>
              <Input
                id="copies-input"
                type="number"
                min="1"
                max="100"
                value={printerSettings.copies}
                onChange={(e) => 
                  setPrinterSettings(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))
                }
                data-testid="input-copies"
              />
            </div>
          </div>

          {/* Print Preview */}
          <div className="space-y-4">
            <div>
              <Label>Print Preview</Label>
              <div className="mt-2 p-4 border rounded-lg bg-muted flex items-center justify-center min-h-32">
                <div className="text-center">
                  <div className="w-16 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded mx-auto mb-2 shadow-sm"></div>
                  <p className="text-xs text-muted-foreground">Sample ID Card</p>
                  <p className="text-xs text-muted-foreground">85.6 × 54 mm</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Print Settings Summary</Label>
              <div className="text-xs space-y-1 p-3 bg-muted rounded">
                <p><strong>Printer:</strong> {printerSettings.printer.replace(/-/g, ' ').toUpperCase()}</p>
                <p><strong>Size:</strong> {printerSettings.cardSize.toUpperCase()}</p>
                <p><strong>Quality:</strong> {printerSettings.quality}</p>
                <p><strong>Color:</strong> {printerSettings.colorMode}</p>
                <p><strong>Copies:</strong> {printerSettings.copies}</p>
              </div>
            </div>
          </div>

          {/* Print Status */}
          <div className="space-y-4">
            <div>
              <Label>Current Print Job</Label>
              <div className="mt-2 p-4 border rounded-lg space-y-3">
                {isProcessing ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Processing...</span>
                      <span className="text-xs text-muted-foreground">Job 1 of 3</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Arif Rahman (2024001)</span>
                      <span>33% complete</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" data-testid="button-pause-job">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-cancel-job">
                        <Square className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No active print jobs</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add students to queue to start printing
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Print Statistics</Label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Today</span>
                  <span className="font-medium">23 cards</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>This Week</span>
                  <span className="font-medium">156 cards</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>This Month</span>
                  <span className="font-medium">542 cards</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total</span>
                  <span className="font-medium">2,847 cards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
