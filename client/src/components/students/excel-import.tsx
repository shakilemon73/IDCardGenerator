import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ExcelImportProps {
  onSuccess: () => void;
}

interface ImportResult {
  imported: number;
  errors: number;
  students: any[];
  errorDetails: Array<{
    row: any;
    error: string;
  }>;
}

export default function ExcelImport({ onSuccess }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("excel", file);
      
      const response = await apiRequest("POST", "/api/students/import", formData);
      return response.json();
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      if (result.imported > 0) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.imported} students`,
        });
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import students",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select an Excel (.xlsx, .xls) or CSV file",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleImport = () => {
    if (file) {
      importMutation.mutate(file);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = [
      "nameEnglish,nameBengali,idNumber,class,section,rollNumber,fatherName,motherName,dateOfBirth,address,phoneNumber,bloodGroup",
      "John Doe,জন ডো,2024001,IX,A,01,Mr. John Smith,Mrs. Jane Smith,2008-01-15,123 Main St,01712345678,A+",
      "Jane Smith,জেইন স্মিথ,2024002,X,B,02,Mr. Bob Johnson,Mrs. Alice Johnson,2007-05-20,456 Oak Ave,01798765432,B+"
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="excel-import">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Step 1: Download Template</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Download our Excel template to ensure your data is formatted correctly.
          </p>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            data-testid="button-download-template"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Step 2: Upload Your File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="file-upload-area"
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {file ? (
              <div>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your Excel file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports .xlsx, .xls, and .csv files up to 10MB
                </p>
              </div>
            )}
          </div>
          
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInput}
            className="hidden"
            data-testid="input-file-upload"
          />

          {file && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setImportResult(null);
                }}
                data-testid="button-clear-file"
              >
                Clear File
              </Button>
              
              <Button 
                onClick={handleImport}
                disabled={importMutation.isPending}
                data-testid="button-start-import"
              >
                {importMutation.isPending ? "Importing..." : "Start Import"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Progress */}
      {importMutation.isPending && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
              <p className="text-sm text-muted-foreground">Processing your file...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                <p className="text-sm text-green-700">Successfully Imported</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{importResult.errors}</p>
                <p className="text-sm text-red-700">Errors</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {importResult.imported + importResult.errors}
                </p>
                <p className="text-sm text-blue-700">Total Processed</p>
              </div>
            </div>

            {importResult.errors > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Error Details:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importResult.errorDetails.slice(0, 10).map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Row {index + 2}:</strong> {error.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {importResult.errorDetails.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... and {importResult.errorDetails.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
