import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet } from "lucide-react";

const pageNames: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Dashboard",
    description: "Manage student ID cards and printing"
  },
  "/students": {
    title: "Students",
    description: "Manage student database and information"
  },
  "/templates": {
    title: "Templates",
    description: "Browse and manage ID card templates"
  },
  "/designer": {
    title: "Card Designer",
    description: "Design and customize student ID cards"
  },
  "/print-manager": {
    title: "Print Manager",
    description: "Manage printing queue and printer settings"
  },
  "/settings": {
    title: "Settings",
    description: "Configure application settings"
  }
};

export default function Header() {
  const [location] = useLocation();
  const currentPage = pageNames[location] || { title: "Page", description: "" };

  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{currentPage.title}</h2>
          <p className="text-muted-foreground">{currentPage.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="flex items-center space-x-2"
            data-testid="button-add-student"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </Button>
          <Button 
            variant="secondary" 
            className="flex items-center space-x-2"
            data-testid="button-import-excel"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Import Excel</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
