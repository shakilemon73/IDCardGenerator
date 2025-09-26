import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TemplateGallery from "@/components/templates/template-gallery";
import { Plus, Search } from "lucide-react";

export default function Templates() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates", { category: category === "all" ? undefined : category }],
  });

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6" data-testid="templates-page">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Template Gallery</CardTitle>
              <p className="text-muted-foreground">
                Browse and manage professional ID card templates
              </p>
            </div>
            <Button data-testid="button-create-template">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-templates"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-48" data-testid="select-template-category">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="student">Student Cards</SelectItem>
                <SelectItem value="staff">Staff Cards</SelectItem>
                <SelectItem value="visitor">Visitor Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TemplateGallery
            templates={filteredTemplates}
            isLoading={isLoading}
            showAll={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
