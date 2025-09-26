import { Template } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, Eye, Download } from "lucide-react";

interface TemplateCardProps {
  template: Template & { design?: any };
  isSelected?: boolean;
  onSelect?: () => void;
  onUse?: () => void;
}

export default function TemplateCard({ template, isSelected, onSelect, onUse }: TemplateCardProps) {
  const getBackgroundClass = (templateId: string) => {
    const backgroundMap: { [key: string]: string } = {
      'bangladesh-heritage': 'template-bg-bangladesh',
      'modern-professional': 'template-bg-blue',
      'academic-green': 'template-bg-green',
      'vibrant-orange': 'template-bg-orange',
      'royal-purple': 'template-bg-purple',
      'minimalist-dark': 'template-bg-dark',
      'ocean-teal': 'template-bg-teal',
      'golden-elite': 'template-bg-golden',
    };
    return backgroundMap[templateId] || 'template-bg-blue';
  };

  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all duration-200 cursor-pointer",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onSelect}
      data-testid={`template-card-${template.id}`}
    >
      <CardContent className="p-4">
        <div className="relative mb-4">
          {/* Template Preview */}
          <div className={cn(
            "w-full aspect-[1.6/1] rounded-lg overflow-hidden relative",
            getBackgroundClass(template.id)
          )}>
            <div className="absolute inset-0 p-3 text-white">
              {/* Mock card elements */}
              <div className="flex items-center justify-center mb-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white/60 rounded"></div>
                </div>
              </div>
              
              {/* Student photo placeholder */}
              <div className="w-10 h-10 bg-white/30 rounded-lg mx-auto mb-2 border border-white/40"></div>
              
              {/* Text lines */}
              <div className="space-y-1">
                <div className="w-full h-1 bg-white/60 rounded"></div>
                <div className="w-3/4 h-1 bg-white/40 rounded mx-auto"></div>
                <div className="w-1/2 h-1 bg-white/40 rounded mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Popular badge */}
          {template.isPopular && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Star className="h-3 w-3" />
              <span>Popular</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
            <Button size="sm" variant="secondary" data-testid={`button-preview-${template.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button size="sm" onClick={onUse} data-testid={`button-use-${template.id}`}>
              <Download className="h-3 w-3 mr-1" />
              Use
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-foreground text-sm">{template.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {template.usageCount} uses
              </span>
              {template.category && (
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-primary hover:text-primary/80 text-xs font-medium h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onUse?.();
              }}
              data-testid={`button-quick-use-${template.id}`}
            >
              Use Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
