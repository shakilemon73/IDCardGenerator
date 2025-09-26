// This file previously contained static template data that has been moved to the database.
// Templates are now seeded via the API endpoint: POST /api/templates/seed
// and retrieved via: GET /api/templates

import { TemplateDesign } from "@/types";

// Legacy static templates - now moved to database via seeding system
// This export is kept for backwards compatibility but is no longer used
export const defaultTemplates: Array<{
  id: string;
  name: string;
  description: string;
  design: TemplateDesign;
  isPopular: boolean;
}> = [
  {
    id: "bangladesh-heritage",
    name: "Bangladesh Heritage",
    description: "Patriotic design with flag colors",
    isPopular: true,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(45deg, #006a4e 0%, #f42a41 50%, #006a4e 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "school-name",
          type: "text",
          position: { x: 5, y: 5 },
          size: { width: 75.6, height: 8 },
          content: "{{schoolName}}",
          style: {
            fontSize: 8,
            fontFamily: "Inter",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "center"
          }
        },
        {
          id: "school-name-bengali",
          type: "text",
          position: { x: 5, y: 12 },
          size: { width: 75.6, height: 6 },
          content: "{{schoolNameBengali}}",
          style: {
            fontSize: 6,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "center"
          }
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 20 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-name",
          type: "text",
          position: { x: 25, y: 20 },
          size: { width: 55, height: 5 },
          content: "{{studentName}}",
          style: {
            fontSize: 7,
            fontFamily: "Inter",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "left"
          }
        },
        {
          id: "student-name-bengali",
          type: "text",
          position: { x: 25, y: 26 },
          size: { width: 55, height: 4 },
          content: "{{studentNameBengali}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        },
        {
          id: "id-number",
          type: "text",
          position: { x: 25, y: 32 },
          size: { width: 55, height: 4 },
          content: "ID: {{idNumber}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        },
        {
          id: "class",
          type: "text",
          position: { x: 25, y: 36 },
          size: { width: 55, height: 4 },
          content: "Class: {{class}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        },
        {
          id: "validity",
          type: "text",
          position: { x: 5, y: 45 },
          size: { width: 75.6, height: 4 },
          content: "Valid Till: {{validTill}}",
          style: {
            fontSize: 4,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "center"
          }
        }
      ]
    }
  },
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Clean blue gradient design",
    isPopular: true,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "logo",
          type: "image",
          position: { x: 5, y: 5 },
          size: { width: 8, height: 8 },
          content: "{{schoolLogo}}",
          style: {}
        },
        {
          id: "id-badge",
          type: "text",
          position: { x: 70, y: 5 },
          size: { width: 10, height: 8 },
          content: "ID",
          style: {
            fontSize: 6,
            fontFamily: "Inter",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "center"
          }
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 16 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-name",
          type: "text",
          position: { x: 25, y: 16 },
          size: { width: 55, height: 6 },
          content: "{{studentName}}",
          style: {
            fontSize: 8,
            fontFamily: "Inter",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "left"
          }
        },
        {
          id: "student-details",
          type: "text",
          position: { x: 25, y: 24 },
          size: { width: 55, height: 12 },
          content: "{{studentDetails}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        }
      ]
    }
  },
  {
    id: "academic-green",
    name: "Academic Green",
    description: "Traditional academic style",
    isPopular: false,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #059669 0%, #047857 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "header-line",
          type: "text",
          position: { x: 5, y: 5 },
          size: { width: 75.6, height: 3 },
          content: "STUDENT IDENTIFICATION CARD",
          style: {
            fontSize: 4,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "center"
          }
        },
        {
          id: "school-logo",
          type: "image",
          position: { x: 35, y: 8 },
          size: { width: 15, height: 8 },
          content: "{{schoolLogo}}",
          style: {}
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 18 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-info",
          type: "text",
          position: { x: 25, y: 18 },
          size: { width: 55, height: 20 },
          content: "{{studentInfo}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        }
      ]
    }
  },
  {
    id: "vibrant-orange",
    name: "Vibrant Orange",
    description: "Energetic orange design",
    isPopular: false,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "school-badge",
          type: "image",
          position: { x: 5, y: 5 },
          size: { width: 8, height: 8 },
          content: "{{schoolLogo}}",
          style: {}
        },
        {
          id: "year",
          type: "text",
          position: { x: 70, y: 5 },
          size: { width: 10, height: 8 },
          content: "{{year}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "center"
          }
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 16 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-details",
          type: "text",
          position: { x: 25, y: 16 },
          size: { width: 55, height: 20 },
          content: "{{studentDetails}}",
          style: {
            fontSize: 6,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        }
      ]
    }
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Elegant purple theme",
    isPopular: true,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "header-border",
          type: "text",
          position: { x: 5, y: 5 },
          size: { width: 75.6, height: 2 },
          content: "",
          style: {
            fontSize: 1,
            fontFamily: "Inter",
            color: "#ffffff"
          }
        },
        {
          id: "school-name",
          type: "text",
          position: { x: 5, y: 8 },
          size: { width: 75.6, height: 6 },
          content: "{{schoolName}}",
          style: {
            fontSize: 6,
            fontFamily: "Inter",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "center"
          }
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 16 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-info",
          type: "text",
          position: { x: 25, y: 16 },
          size: { width: 55, height: 20 },
          content: "{{studentInfo}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        }
      ]
    }
  },
  {
    id: "minimalist-dark",
    name: "Minimalist Dark",
    description: "Clean dark professional",
    isPopular: false,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #374151 0%, #111827 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "top-line",
          type: "text",
          position: { x: 5, y: 8 },
          size: { width: 75.6, height: 1 },
          content: "",
          style: {
            fontSize: 1,
            fontFamily: "Inter",
            color: "#ffffff"
          }
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 14 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-details",
          type: "text",
          position: { x: 25, y: 14 },
          size: { width: 55, height: 20 },
          content: "{{studentDetails}}",
          style: {
            fontSize: 6,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        }
      ]
    }
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    description: "Fresh teal gradient",
    isPopular: false,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "grid-pattern",
          type: "text",
          position: { x: 5, y: 5 },
          size: { width: 20, height: 8 },
          content: "",
          style: {
            fontSize: 4,
            fontFamily: "Inter",
            color: "#ffffff"
          }
        },
        {
          id: "school-header",
          type: "text",
          position: { x: 25, y: 5 },
          size: { width: 55, height: 8 },
          content: "{{schoolName}}",
          style: {
            fontSize: 6,
            fontFamily: "Inter",
            color: "#ffffff",
            fontWeight: "bold",
            textAlign: "left"
          }
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 15 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-info",
          type: "text",
          position: { x: 25, y: 15 },
          size: { width: 55, height: 20 },
          content: "{{studentInfo}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        }
      ]
    }
  },
  {
    id: "golden-elite",
    name: "Golden Elite",
    description: "Luxury golden design",
    isPopular: false,
    design: {
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #d97706 0%, #92400e 100%)"
      },
      dimensions: { width: 85.6, height: 54 },
      elements: [
        {
          id: "crown-logo",
          type: "image",
          position: { x: 5, y: 5 },
          size: { width: 8, height: 8 },
          content: "{{schoolLogo}}",
          style: {}
        },
        {
          id: "elite-badge",
          type: "text",
          position: { x: 60, y: 5 },
          size: { width: 20, height: 8 },
          content: "ELITE",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#fbbf24",
            fontWeight: "bold",
            textAlign: "center"
          }
        },
        {
          id: "student-photo",
          type: "image",
          position: { x: 8, y: 15 },
          size: { width: 15, height: 20 },
          content: "{{studentPhoto}}",
          style: {}
        },
        {
          id: "student-details",
          type: "text",
          position: { x: 25, y: 15 },
          size: { width: 55, height: 20 },
          content: "{{studentDetails}}",
          style: {
            fontSize: 5,
            fontFamily: "Inter",
            color: "#ffffff",
            textAlign: "left"
          }
        }
      ]
    }
  }
];
