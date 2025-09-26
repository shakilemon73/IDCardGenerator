import { Student, Template } from "@shared/schema";
import { TemplateDesign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Share2 } from "lucide-react";
import { useSchoolSettings } from "@/hooks/use-settings";

interface CardPreviewProps {
  design: TemplateDesign | null;
  student: Student | null;
  template: Template | null;
}

export default function CardPreview({ design, student, template }: CardPreviewProps) {
  const { settings: schoolSettings } = useSchoolSettings();

  if (!design || !student || !template) {
    return (
      <div className="h-full flex items-center justify-center" data-testid="card-preview-empty">
        <p className="text-muted-foreground text-sm text-center">
          Select a template and student to see preview
        </p>
      </div>
    );
  }

  const processTemplateContent = (content: string): string => {
    return content
      .replace(/\{\{studentName\}\}/g, student.nameEnglish)
      .replace(/\{\{studentNameBengali\}\}/g, student.nameBengali || '')
      .replace(/\{\{idNumber\}\}/g, student.idNumber)
      .replace(/\{\{class\}\}/g, student.class)
      .replace(/\{\{section\}\}/g, student.section || '')
      .replace(/\{\{rollNumber\}\}/g, student.rollNumber || '')
      .replace(/\{\{schoolName\}\}/g, schoolSettings.schoolNameEnglish)
      .replace(/\{\{schoolNameBengali\}\}/g, schoolSettings.schoolNameBengali)
      .replace(/\{\{validTill\}\}/g, schoolSettings.validTill)
      .replace(/\{\{year\}\}/g, schoolSettings.academicYear);
  };

  return (
    <div className="h-full flex flex-col" data-testid="card-preview">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">Preview</h3>
      </div>

      <div className="flex-1 p-4">
        {/* Template Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">{template.name}</h4>
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>

        {/* Card Preview */}
        <div className="mb-6 flex items-center justify-center bg-muted rounded-lg p-6">
          <div 
            className="relative overflow-hidden rounded-lg shadow-lg"
            style={{
              width: '170px',
              height: '108px',
              background: design.background.value,
            }}
          >
            {/* Render design elements */}
            {design.elements.map((element) => (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: `${(element.position.x / design.dimensions.width) * 100}%`,
                  top: `${(element.position.y / design.dimensions.height) * 100}%`,
                  width: `${(element.size.width / design.dimensions.width) * 100}%`,
                  height: `${(element.size.height / design.dimensions.height) * 100}%`,
                }}
              >
                {element.type === 'text' && (
                  <div
                    className="text-white"
                    style={{
                      fontSize: `${(element.style.fontSize || 10) * 0.5}px`,
                      fontFamily: element.style.fontFamily || 'Inter',
                      fontWeight: element.style.fontWeight || 'normal',
                      textAlign: element.style.textAlign || 'left',
                      color: element.style.color || '#ffffff',
                      lineHeight: '1.2',
                    }}
                  >
                    {processTemplateContent(element.content)}
                  </div>
                )}
                
                {element.type === 'image' && (
                  <div className="w-full h-full">
                    {element.content === '{{studentPhoto}}' && student.photoUrl ? (
                      <img 
                        src={student.photoUrl} 
                        alt="Student" 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/20 rounded flex items-center justify-center text-white text-xs">
                        Photo
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Student Info */}
        <div className="mb-6 space-y-2">
          <h4 className="text-sm font-medium text-foreground">Student Details</h4>
          <div className="text-xs space-y-1">
            <p><strong>Name:</strong> {student.nameEnglish}</p>
            {student.nameBengali && (
              <p className="bengali-text"><strong>নাম:</strong> {student.nameBengali}</p>
            )}
            <p><strong>ID:</strong> {student.idNumber}</p>
            <p><strong>Class:</strong> {student.class}{student.section ? `-${student.section}` : ''}</p>
            {student.rollNumber && (
              <p><strong>Roll:</strong> {student.rollNumber}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            data-testid="button-full-preview"
          >
            <Eye className="h-4 w-4 mr-2" />
            Full Preview
          </Button>
          
          <Button 
            size="sm" 
            className="w-full"
            data-testid="button-download-pdf"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full"
            data-testid="button-share-design"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Design
          </Button>
        </div>
      </div>
    </div>
  );
}
