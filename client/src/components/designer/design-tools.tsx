import { useState } from "react";
import { Student, Template } from "@shared/schema";
import { TemplateDesign } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Upload, Palette, Type, Image, Move } from "lucide-react";

interface DesignToolsProps {
  students: Student[];
  templates: Template[];
  selectedStudent: Student | null;
  selectedTemplate: Template | null;
  currentDesign: TemplateDesign | null;
  onStudentChange: (student: Student) => void;
  onTemplateChange: (template: Template) => void;
  onDesignChange: (design: TemplateDesign) => void;
}

export default function DesignTools({
  students,
  templates,
  selectedStudent,
  selectedTemplate,
  currentDesign,
  onStudentChange,
  onTemplateChange,
  onDesignChange,
}: DesignToolsProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="design-tools">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">Design Tools</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="content" className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="p-4 space-y-4">
            {/* Template Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Template</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedTemplate?.id || ""} 
                  onValueChange={(value) => {
                    const template = templates.find(t => t.id === value);
                    if (template) onTemplateChange(template);
                  }}
                >
                  <SelectTrigger data-testid="select-template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Student Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Student</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select 
                  value={selectedStudent?.id || ""} 
                  onValueChange={(value) => {
                    const student = students.find(s => s.id === value);
                    if (student) onStudentChange(student);
                  }}
                >
                  <SelectTrigger data-testid="select-student">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.nameEnglish} ({student.idNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedStudent && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <Label>Name (English)</Label>
                      <p className="text-muted-foreground">{selectedStudent.nameEnglish}</p>
                    </div>
                    <div>
                      <Label>Name (Bengali)</Label>
                      <p className="text-muted-foreground bengali-text">{selectedStudent.nameBengali}</p>
                    </div>
                    <div>
                      <Label>ID Number</Label>
                      <p className="text-muted-foreground font-mono">{selectedStudent.idNumber}</p>
                    </div>
                    <div>
                      <Label>Class</Label>
                      <p className="text-muted-foreground">
                        {selectedStudent.class}{selectedStudent.section ? `-${selectedStudent.section}` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Student Photo</CardTitle>
              </CardHeader>
              <CardContent>
                {photoPreview || selectedStudent?.photoUrl ? (
                  <div className="space-y-3">
                    <img 
                      src={photoPreview || selectedStudent?.photoUrl} 
                      alt="Student photo" 
                      className="w-20 h-20 object-cover rounded-lg mx-auto border-2 border-border"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => document.getElementById('photo-input')?.click()}
                      data-testid="button-change-photo"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => document.getElementById('photo-input')?.click()}
                    data-testid="photo-upload-area"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload photo</p>
                  </div>
                )}
                
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="input-photo"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="p-4 space-y-4">
            {/* Background Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Background Type</Label>
                  <Select defaultValue="gradient">
                    <SelectTrigger data-testid="select-background-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(45deg, #006a4e 0%, #f42a41 50%, #006a4e 100%)',
                    'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                    'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                    'linear-gradient(135deg, #374151 0%, #111827 100%)',
                    'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  ].map((gradient, index) => (
                    <button
                      key={index}
                      className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
                      style={{ background: gradient }}
                      data-testid={`button-gradient-${index}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card Dimensions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Move className="h-4 w-4 mr-2" />
                  Card Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Width (mm)</Label>
                    <Input 
                      type="number" 
                      defaultValue={85.6} 
                      step={0.1}
                      data-testid="input-card-width"
                    />
                  </div>
                  <div>
                    <Label>Height (mm)</Label>
                    <Input 
                      type="number" 
                      defaultValue={54} 
                      step={0.1}
                      data-testid="input-card-height"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Preset Sizes</Label>
                  <Select defaultValue="cr80">
                    <SelectTrigger data-testid="select-card-size-preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cr80">CR80 (85.6 × 54 mm)</SelectItem>
                      <SelectItem value="cr79">CR79 (85.6 × 54 mm)</SelectItem>
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elements" className="p-4 space-y-4">
            {/* Add Elements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  data-testid="button-add-text"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  data-testid="button-add-image"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  data-testid="button-add-logo"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Logo
                </Button>
              </CardContent>
            </Card>

            {/* Element Properties */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Element Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Select an element on the canvas to edit its properties
                </p>
                
                <Separator />
                
                <div className="space-y-3 opacity-50">
                  <div>
                    <Label>Font Family</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Font Size</Label>
                      <Input type="number" disabled />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <Input type="color" disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
