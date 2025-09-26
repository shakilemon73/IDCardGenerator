import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertStudentSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@shared/schema";
import { StudentFormData } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera } from "lucide-react";
import { z } from "zod";

interface StudentFormProps {
  onSuccess: () => void;
  initialData?: Student;
}

export default function StudentForm({ onSuccess, initialData }: StudentFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string>(initialData?.photoUrl || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(insertStudentSchema.extend({
      photo: z.any().optional()
    })),
    defaultValues: {
      nameEnglish: initialData?.nameEnglish || "",
      nameBengali: initialData?.nameBengali || "",
      idNumber: initialData?.idNumber || "",
      class: initialData?.class || "",
      section: initialData?.section || "",
      rollNumber: initialData?.rollNumber || "",
      fatherName: initialData?.fatherName || "",
      motherName: initialData?.motherName || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      address: initialData?.address || "",
      phoneNumber: initialData?.phoneNumber || "",
      bloodGroup: initialData?.bloodGroup || "",
      session: initialData?.session || new Date().getFullYear().toString(),
      admissionDate: initialData?.admissionDate || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photo' && value) {
          formData.append(key, value);
        }
      });

      // Append photo if selected
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const url = initialData ? `/api/students/${initialData.id}` : "/api/students";
      const method = initialData ? "PUT" : "POST";
      
      return apiRequest(method, url, formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Student ${initialData ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${initialData ? 'update' : 'create'} student`,
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Student Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => document.getElementById('photo-input')?.click()}
                      data-testid="button-change-photo"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => document.getElementById('photo-input')?.click()}
                    data-testid="photo-upload-area"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload photo</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                  </div>
                )}
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  data-testid="input-photo"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nameEnglish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (English) *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter student name in English" 
                            {...field} 
                            data-testid="input-name-english"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nameBengali"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (Bengali) *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ছাত্রের নাম বাংলায় লিখুন" 
                            {...field} 
                            data-testid="input-name-bengali"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 2024001" 
                            {...field} 
                            data-testid="input-id-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-class">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="VI">Class VI</SelectItem>
                            <SelectItem value="VII">Class VII</SelectItem>
                            <SelectItem value="VIII">Class VIII</SelectItem>
                            <SelectItem value="IX">Class IX</SelectItem>
                            <SelectItem value="X">Class X</SelectItem>
                            <SelectItem value="XI">Class XI</SelectItem>
                            <SelectItem value="XII">Class XII</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., A, B, C" 
                            {...field} 
                            data-testid="input-section"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter roll number" 
                            {...field} 
                            data-testid="input-roll-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-blood-group">
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Family Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Family Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter father's name" 
                            {...field} 
                            data-testid="input-father-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter mother's name" 
                            {...field} 
                            data-testid="input-mother-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-date-of-birth"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter phone number" 
                            {...field} 
                            data-testid="input-phone-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter student address" 
                          {...field} 
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="session"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Session</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 2024" 
                            {...field} 
                            data-testid="input-session"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="admissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-admission-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            data-testid="button-reset-form"
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            data-testid="button-save-student"
          >
            {mutation.isPending ? "Saving..." : initialData ? "Update Student" : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
