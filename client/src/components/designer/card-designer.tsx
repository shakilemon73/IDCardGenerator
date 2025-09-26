import { useRef, useEffect } from "react";
import { Student } from "@shared/schema";
import { TemplateDesign } from "@/types";

interface CardDesignerProps {
  design: TemplateDesign | null;
  student: Student | null;
  onDesignChange: (design: TemplateDesign) => void;
}

export default function CardDesigner({ design, student, onDesignChange }: CardDesignerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!design || !canvasRef.current) return;

    // Initialize the design canvas
    const canvas = canvasRef.current;
    canvas.innerHTML = '';

    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'relative w-full h-full overflow-hidden rounded-lg';
    cardContainer.style.width = `${design.dimensions.width}mm`;
    cardContainer.style.height = `${design.dimensions.height}mm`;
    cardContainer.style.transform = 'scale(3)';
    cardContainer.style.transformOrigin = 'top left';
    cardContainer.style.margin = '0 auto';

    // Set background
    if (design.background.type === 'gradient') {
      cardContainer.style.background = design.background.value;
    } else if (design.background.type === 'solid') {
      cardContainer.style.backgroundColor = design.background.value;
    }

    // Add elements
    design.elements.forEach((element) => {
      const elementDiv = document.createElement('div');
      elementDiv.className = 'absolute select-none';
      elementDiv.style.left = `${element.position.x}mm`;
      elementDiv.style.top = `${element.position.y}mm`;
      elementDiv.style.width = `${element.size.width}mm`;
      elementDiv.style.height = `${element.size.height}mm`;

      if (element.type === 'text') {
        elementDiv.textContent = processTemplateContent(element.content, student);
        if (element.style.fontSize) {
          elementDiv.style.fontSize = `${element.style.fontSize}mm`;
        }
        if (element.style.color) {
          elementDiv.style.color = element.style.color;
        }
        if (element.style.fontFamily) {
          elementDiv.style.fontFamily = element.style.fontFamily;
        }
        if (element.style.fontWeight) {
          elementDiv.style.fontWeight = element.style.fontWeight;
        }
        if (element.style.textAlign) {
          elementDiv.style.textAlign = element.style.textAlign;
        }
      } else if (element.type === 'image') {
        const img = document.createElement('img');
        let imageSrc = element.content;
        
        // Process template variables
        if (element.content === '{{studentPhoto}}' && student?.photoUrl) {
          imageSrc = student.photoUrl;
        }
        
        if (imageSrc && imageSrc !== element.content) {
          img.src = imageSrc;
          img.className = 'w-full h-full object-cover';
          elementDiv.appendChild(img);
        } else {
          // Placeholder for missing image
          elementDiv.className += ' bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500';
          elementDiv.style.fontSize = '2mm';
          elementDiv.textContent = 'Photo';
        }
      }

      // Make elements draggable and editable (basic implementation)
      elementDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        // TODO: Implement element selection and editing
      });

      cardContainer.appendChild(elementDiv);
    });

    canvas.appendChild(cardContainer);
  }, [design, student]);

  const processTemplateContent = (content: string, student: Student | null): string => {
    if (!student) return content;

    return content
      .replace(/\{\{studentName\}\}/g, student.nameEnglish)
      .replace(/\{\{studentNameBengali\}\}/g, student.nameBengali || '')
      .replace(/\{\{idNumber\}\}/g, student.idNumber)
      .replace(/\{\{class\}\}/g, student.class)
      .replace(/\{\{section\}\}/g, student.section || '')
      .replace(/\{\{rollNumber\}\}/g, student.rollNumber || '')
      .replace(/\{\{schoolName\}\}/g, 'DHAKA INTERNATIONAL SCHOOL')
      .replace(/\{\{schoolNameBengali\}\}/g, 'ঢাকা আন্তর্জাতিক বিদ্যালয়')
      .replace(/\{\{validTill\}\}/g, 'Dec 2024')
      .replace(/\{\{year\}\}/g, new Date().getFullYear().toString());
  };

  if (!design) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg" data-testid="card-designer-empty">
        <p className="text-muted-foreground">Select a template to start designing</p>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-muted rounded-lg p-8 overflow-auto" data-testid="card-designer">
      <div ref={canvasRef} className="flex items-center justify-center" />
    </div>
  );
}
