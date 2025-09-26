import { jsPDF } from "jspdf";
import { Student, Template } from "@shared/schema";

export interface CardData {
  student: Student;
  template: Template;
  schoolName?: string;
  schoolNameBengali?: string;
  schoolLogo?: string;
  validTill?: string;
}

export class PDFGenerator {
  private pdf: jsPDF;
  
  constructor() {
    // CR80 card dimensions in mm
    this.pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 54]
    });
  }

  async generateCard(cardData: CardData): Promise<Blob> {
    const { student, template } = cardData;
    
    // Set background
    if (template.design?.background) {
      await this.setBackground(template.design.background);
    }

    // Render elements
    if (template.design?.elements) {
      for (const element of template.design.elements) {
        await this.renderElement(element, cardData);
      }
    }

    return this.pdf.output("blob");
  }

  private async setBackground(background: any): Promise<void> {
    if (background.type === "gradient") {
      // For PDF generation, convert gradients to solid colors for now
      // In a real implementation, you might use canvas to create gradient images
      this.pdf.setFillColor("#2563eb");
      this.pdf.rect(0, 0, 85.6, 54, "F");
    } else if (background.type === "solid") {
      const color = this.hexToRgb(background.value);
      if (color) {
        this.pdf.setFillColor(color.r, color.g, color.b);
        this.pdf.rect(0, 0, 85.6, 54, "F");
      }
    }
  }

  private async renderElement(element: any, cardData: CardData): Promise<void> {
    const { position, size, content, style, type } = element;

    switch (type) {
      case "text":
        await this.renderText(position, size, content, style, cardData);
        break;
      case "image":
        await this.renderImage(position, size, content, cardData);
        break;
      default:
        break;
    }
  }

  private async renderText(
    position: { x: number; y: number },
    size: { width: number; height: number },
    content: string,
    style: any,
    cardData: CardData
  ): Promise<void> {
    // Process template variables
    const processedContent = this.processTemplateContent(content, cardData);
    
    // Set text properties
    this.pdf.setFontSize(style.fontSize || 10);
    
    const color = this.hexToRgb(style.color || "#000000");
    if (color) {
      this.pdf.setTextColor(color.r, color.g, color.b);
    }

    // Set text alignment
    const align = style.textAlign || "left";
    
    // Add text
    this.pdf.text(processedContent, position.x, position.y + (style.fontSize || 10) * 0.35, {
      align: align as any,
      maxWidth: size.width
    });
  }

  private async renderImage(
    position: { x: number; y: number },
    size: { width: number; height: number },
    content: string,
    cardData: CardData
  ): Promise<void> {
    let imageUrl = content;

    // Process template variables for images
    if (content === "{{studentPhoto}}" && cardData.student.photoUrl) {
      imageUrl = cardData.student.photoUrl;
    } else if (content === "{{schoolLogo}}" && cardData.schoolLogo) {
      imageUrl = cardData.schoolLogo;
    }

    if (imageUrl && imageUrl !== content) {
      try {
        // In a real implementation, you would load and add the image
        // For now, we'll add a placeholder rectangle
        this.pdf.setFillColor(200, 200, 200);
        this.pdf.rect(position.x, position.y, size.width, size.height, "F");
        
        // Add placeholder text
        this.pdf.setFontSize(6);
        this.pdf.setTextColor(100, 100, 100);
        this.pdf.text("Photo", position.x + size.width/2, position.y + size.height/2, {
          align: "center"
        });
      } catch (error) {
        console.error("Error loading image:", error);
      }
    }
  }

  private processTemplateContent(content: string, cardData: CardData): string {
    const { student } = cardData;
    
    return content
      .replace(/\{\{studentName\}\}/g, student.nameEnglish)
      .replace(/\{\{studentNameBengali\}\}/g, student.nameBengali || "")
      .replace(/\{\{idNumber\}\}/g, student.idNumber)
      .replace(/\{\{class\}\}/g, student.class)
      .replace(/\{\{section\}\}/g, student.section || "")
      .replace(/\{\{rollNumber\}\}/g, student.rollNumber || "")
      .replace(/\{\{fatherName\}\}/g, student.fatherName || "")
      .replace(/\{\{motherName\}\}/g, student.motherName || "")
      .replace(/\{\{dateOfBirth\}\}/g, student.dateOfBirth || "")
      .replace(/\{\{address\}\}/g, student.address || "")
      .replace(/\{\{phoneNumber\}\}/g, student.phoneNumber || "")
      .replace(/\{\{bloodGroup\}\}/g, student.bloodGroup || "")
      .replace(/\{\{schoolName\}\}/g, cardData.schoolName || "SCHOOL NAME")
      .replace(/\{\{schoolNameBengali\}\}/g, cardData.schoolNameBengali || "বিদ্যালয়ের নাম")
      .replace(/\{\{validTill\}\}/g, cardData.validTill || "Dec 2024")
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString())
      .replace(/\{\{studentDetails\}\}/g, this.formatStudentDetails(student))
      .replace(/\{\{studentInfo\}\}/g, this.formatStudentInfo(student));
  }

  private formatStudentDetails(student: Student): string {
    return [
      student.nameEnglish,
      student.nameBengali,
      `ID: ${student.idNumber}`,
      `Class: ${student.class}${student.section ? `-${student.section}` : ''}`,
      student.rollNumber ? `Roll: ${student.rollNumber}` : '',
    ].filter(Boolean).join('\n');
  }

  private formatStudentInfo(student: Student): string {
    return [
      student.nameEnglish,
      `ID: ${student.idNumber}`,
      `Class: ${student.class}`,
      student.section ? `Section: ${student.section}` : '',
    ].filter(Boolean).join('\n');
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  async generateBulkCards(cardDataArray: CardData[]): Promise<Blob> {
    // Reset PDF for bulk generation
    this.pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 54]
    });

    for (let i = 0; i < cardDataArray.length; i++) {
      if (i > 0) {
        this.pdf.addPage();
      }
      
      const cardData = cardDataArray[i];
      const { template } = cardData;
      
      // Set background
      if (template.design?.background) {
        await this.setBackground(template.design.background);
      }

      // Render elements
      if (template.design?.elements) {
        for (const element of template.design.elements) {
          await this.renderElement(element, cardData);
        }
      }
    }

    return this.pdf.output("blob");
  }
}

export const pdfGenerator = new PDFGenerator();
