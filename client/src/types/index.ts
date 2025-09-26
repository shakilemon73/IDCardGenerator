export interface TemplateDesign {
  background: {
    type: 'gradient' | 'solid' | 'image';
    value: string;
  };
  elements: TemplateElement[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'logo' | 'qr' | 'barcode';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface PrinterSettings {
  printer: string;
  cardSize: string;
  quality: string;
  colorMode: 'color' | 'grayscale';
  copies: number;
}

export interface StudentFormData {
  nameEnglish: string;
  nameBengali: string;
  idNumber: string;
  class: string;
  section?: string;
  rollNumber?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  address?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  session?: string;
  admissionDate?: string;
  photo?: File;
}
