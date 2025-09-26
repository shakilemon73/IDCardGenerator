import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import CardDesigner from "@/components/designer/card-designer";
import DesignTools from "@/components/designer/design-tools";
import CardPreview from "@/components/designer/card-preview";
import { Button } from "@/components/ui/button";
import { Student, Template } from "@shared/schema";
import { TemplateDesign } from "@/types";
import { Save, Eye, Printer, Undo, Redo } from "lucide-react";

export default function Designer() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentDesign, setCurrentDesign] = useState<TemplateDesign | null>(null);
  const [designHistory, setDesignHistory] = useState<TemplateDesign[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { data: students } = useQuery({
    queryKey: ["/api/students", { limit: 100 }],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Initialize with first template and student
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0]);
      setCurrentDesign(templates[0].design as TemplateDesign);
    }
    if (students?.students && students.students.length > 0 && !selectedStudent) {
      setSelectedStudent(students.students[0]);
    }
  }, [templates, students, selectedTemplate, selectedStudent]);

  const handleDesignChange = (newDesign: TemplateDesign) => {
    if (currentDesign) {
      // Add current design to history
      const newHistory = designHistory.slice(0, historyIndex + 1);
      newHistory.push(currentDesign);
      setDesignHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    setCurrentDesign(newDesign);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentDesign(designHistory[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < designHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentDesign(designHistory[historyIndex + 1]);
    }
  };

  const handleSaveTemplate = () => {
    // TODO: Implement template saving
    console.log("Saving template:", currentDesign);
  };

  const handlePreview = () => {
    // TODO: Implement preview modal
    console.log("Opening preview");
  };

  const handlePrint = () => {
    // TODO: Implement print functionality
    console.log("Printing card");
  };

  return (
    <div className="p-6 h-full" data-testid="designer-page">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Card Designer</h2>
            <p className="text-muted-foreground">
              Design and customize student ID cards with our advanced editor
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              data-testid="button-undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= designHistory.length - 1}
              data-testid="button-redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePreview}
              data-testid="button-preview-card"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              variant="secondary"
              onClick={handleSaveTemplate}
              data-testid="button-save-template"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button 
              onClick={handlePrint}
              data-testid="button-print-card"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Card
            </Button>
          </div>
        </div>

        {/* Main Designer Interface */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Design Tools Panel */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardContent className="p-0">
                <DesignTools
                  students={students?.students || []}
                  templates={templates || []}
                  selectedStudent={selectedStudent}
                  selectedTemplate={selectedTemplate}
                  currentDesign={currentDesign}
                  onStudentChange={setSelectedStudent}
                  onTemplateChange={(template) => {
                    setSelectedTemplate(template);
                    setCurrentDesign(template.design as TemplateDesign);
                  }}
                  onDesignChange={handleDesignChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="col-span-6">
            <Card className="h-full">
              <CardContent className="p-6 h-full">
                <CardDesigner
                  design={currentDesign}
                  student={selectedStudent}
                  onDesignChange={handleDesignChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardContent className="p-4">
                <CardPreview
                  design={currentDesign}
                  student={selectedStudent}
                  template={selectedTemplate}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
