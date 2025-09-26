import { useState } from "react";
import { Template } from "@shared/schema";
import TemplateCard from "./template-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface TemplateGalleryProps {
  templates: Template[];
  isLoading: boolean;
  showAll?: boolean;
}

export default function TemplateGallery({ templates, isLoading, showAll = false }: TemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Use only database templates
  const allTemplates = templates;
  const displayTemplates = showAll ? allTemplates : allTemplates.slice(0, 8);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="template-gallery-loading">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayTemplates.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-templates">
        <p className="text-muted-foreground text-lg">No templates found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Create your first template to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="template-gallery">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={() => setSelectedTemplate(template.id)}
            onUse={() => {
              console.log("Using template:", template.name);
              // TODO: Navigate to designer with this template
            }}
          />
        ))}
      </div>

      {!showAll && allTemplates.length > 8 && (
        <div className="text-center pt-6">
          <Button variant="outline" data-testid="button-view-all-templates">
            View All Templates ({allTemplates.length - 8} more)
          </Button>
        </div>
      )}
    </div>
  );
}
