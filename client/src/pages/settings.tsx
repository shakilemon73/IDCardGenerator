import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSchoolSettings, useBulkUpdateSchoolSettings } from "@/hooks/use-settings";
import { Loader2, Save, Settings2, School, Calendar, Globe } from "lucide-react";

const schoolSettingsSchema = z.object({
  schoolNameEnglish: z.string().min(1, "School name (English) is required"),
  schoolNameBengali: z.string().min(1, "School name (Bengali) is required"),
  validTill: z.string().min(1, "Valid till date is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  sessionYear: z.string().min(1, "Session year is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

type SchoolSettingsForm = z.infer<typeof schoolSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { settings, isLoading, error } = useSchoolSettings();
  const updateSettings = useBulkUpdateSchoolSettings();

  const form = useForm<SchoolSettingsForm>({
    resolver: zodResolver(schoolSettingsSchema),
    defaultValues: {
      schoolNameEnglish: "",
      schoolNameBengali: "",
      validTill: "",
      academicYear: "",
      sessionYear: "",
      address: "",
      phone: "",
      email: "",
      website: "",
    },
    values: settings, // This will update form when settings are loaded
  });

  const onSubmit = async (data: SchoolSettingsForm) => {
    try {
      await updateSettings.mutateAsync(data);
      toast({
        title: "Settings Updated",
        description: "School settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: "Update Failed", 
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Failed to load settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              There was an error loading the settings. Please refresh the page and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" data-testid="settings-page">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Settings2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">System Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your school's configuration and card generation settings.
        </p>
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="school" className="flex items-center space-x-2">
            <School className="h-4 w-4" />
            <span>School Info</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Academic</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Contact</span>
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="school" className="space-y-6">
              <Card data-testid="school-info-card">
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                  <CardDescription>
                    Basic school information that appears on student ID cards.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="schoolNameEnglish"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name (English)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter school name in English"
                            {...field}
                            data-testid="input-school-name-english"
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on ID cards as the main school name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="schoolNameBengali"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name (Bengali)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="বাংলায় স্কুলের নাম লিখুন"
                            {...field}
                            data-testid="input-school-name-bengali"
                            className="bengali-text"
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on ID cards in Bengali script.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <Card data-testid="academic-info-card">
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                  <CardDescription>
                    Academic year and session information for ID cards.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="academicYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic Year</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="2024-2025"
                              {...field}
                              data-testid="input-academic-year"
                            />
                          </FormControl>
                          <FormDescription>Current academic year</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sessionYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Year</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="2024"
                              {...field}
                              data-testid="input-session-year"
                            />
                          </FormControl>
                          <FormDescription>Current session year</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="validTill"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Card Valid Till</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dec 2024"
                            {...field}
                            data-testid="input-valid-till"
                          />
                        </FormControl>
                        <FormDescription>
                          When the ID cards expire (e.g., "Dec 2024", "June 2025")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card data-testid="contact-info-card">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Optional contact information for ID cards and communications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter complete school address"
                            {...field}
                            data-testid="input-address"
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Complete postal address of the school
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+880 1XXXXXXXXX"
                              {...field}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormDescription>Primary contact number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="admin@school.edu.bd"
                              type="email"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormDescription>Official email address</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.school.edu.bd"
                            type="url"
                            {...field}
                            data-testid="input-website"
                          />
                        </FormControl>
                        <FormDescription>School's official website</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={updateSettings.isPending}
                data-testid="button-reset"
              >
                Reset Changes
              </Button>
              <Button
                type="submit"
                disabled={updateSettings.isPending}
                data-testid="button-save-settings"
              >
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}