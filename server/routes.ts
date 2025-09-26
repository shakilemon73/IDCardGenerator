import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertTemplateSchema, insertPrintJobSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "photo") {
      // Accept images only
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for photos"));
      }
    } else if (file.fieldname === "excel") {
      // Accept Excel and CSV files
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv"
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only Excel and CSV files are allowed"));
      }
    } else {
      cb(null, true);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
  }

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  // Students API
  app.get("/api/students", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      
      const result = await storage.getStudents(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error('Failed to fetch student:', error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", upload.single("photo"), async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      // Handle photo upload
      if (req.file) {
        const photoPath = `uploads/photos/${uuidv4()}${path.extname(req.file.originalname)}`;
        fs.renameSync(req.file.path, photoPath);
        validatedData.photoUrl = `/${photoPath}`;
      }
      
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      console.error('Failed to create student:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path); // Clean up uploaded file on error
      }
      const message = error instanceof Error ? error.message : "Failed to create student";
      res.status(400).json({ message });
    }
  });

  app.put("/api/students/:id", upload.single("photo"), async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      
      // Handle photo upload
      if (req.file) {
        const photoPath = `uploads/photos/${uuidv4()}${path.extname(req.file.originalname)}`;
        fs.renameSync(req.file.path, photoPath);
        validatedData.photoUrl = `/${photoPath}`;
      }
      
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      console.error('Failed to update student:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      const message = error instanceof Error ? error.message : "Failed to update student";
      res.status(400).json({ message });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Excel import
  app.post("/api/students/import", upload.single("excel"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Excel file is required" });
      }

      const results: any[] = [];
      const errors: any[] = [];
      
      // Parse CSV/Excel file
      const fileContent = fs.readFileSync(req.file.path, "utf8");
      
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      }, async (err: any, records: any) => {
        if (err) {
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({ message: "Failed to parse file" });
        }

        for (const record of records) {
          try {
            const studentData = {
              nameEnglish: record.nameEnglish || record["Name (English)"] || "",
              nameBengali: record.nameBengali || record["Name (Bengali)"] || "",
              idNumber: record.idNumber || record["ID Number"] || "",
              class: record.class || record["Class"] || "",
              section: record.section || record["Section"] || "",
              rollNumber: record.rollNumber || record["Roll Number"] || "",
              fatherName: record.fatherName || record["Father's Name"] || "",
              motherName: record.motherName || record["Mother's Name"] || "",
              dateOfBirth: record.dateOfBirth || record["Date of Birth"] || "",
              address: record.address || record["Address"] || "",
              phoneNumber: record.phoneNumber || record["Phone Number"] || "",
              bloodGroup: record.bloodGroup || record["Blood Group"] || "",
            };

            const validatedData = insertStudentSchema.parse(studentData);
            const student = await storage.createStudent(validatedData);
            results.push(student);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Invalid data";
            errors.push({
              row: record,
              error: message,
            });
          }
        }

        // Clean up file
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        res.json({
          imported: results.length,
          errors: errors.length,
          students: results,
          errorDetails: errors,
        });
      });
    } catch (error) {
      console.error('Failed to import students:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: "Failed to import students" });
    }
  });

  // Templates API
  app.get("/api/templates", async (req, res) => {
    try {
      const category = req.query.category as string;
      const templates = await storage.getTemplates(category);
      res.json(templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/popular", async (req, res) => {
    try {
      const templates = await storage.getPopularTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Failed to fetch popular templates:', error);
      res.status(500).json({ message: "Failed to fetch popular templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error('Failed to create template:', error);
      const message = error instanceof Error ? error.message : "Failed to create template";
      res.status(400).json({ message });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTemplate(req.params.id, validatedData);
      res.json(template);
    } catch (error) {
      console.error('Failed to update template:', error);
      const message = error instanceof Error ? error.message : "Failed to update template";
      res.status(400).json({ message });
    }
  });

  app.post("/api/templates/:id/use", async (req, res) => {
    try {
      await storage.incrementTemplateUsage(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to update template usage" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  app.post("/api/templates/seed", async (req, res) => {
    try {
      // Define the default templates to seed
      const defaultTemplatesData = [
        {
          id: "bangladesh-heritage",
          name: "Bangladesh Heritage",
          description: "Patriotic design with flag colors",
          category: "student",
          isDefault: true,
          isPopular: true,
          usageCount: 145,
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
          category: "student",
          isDefault: true,
          isPopular: true,
          usageCount: 203,
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
          category: "student",
          isDefault: true,
          isPopular: false,
          usageCount: 87,
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
          category: "student",
          isDefault: true,
          isPopular: false,
          usageCount: 124,
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
          category: "student",
          isDefault: true,
          isPopular: true,
          usageCount: 178,
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
          category: "student",
          isDefault: true,
          isPopular: false,
          usageCount: 93,
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
          category: "student",
          isDefault: true,
          isPopular: false,
          usageCount: 76,
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
          category: "student",
          isDefault: true,
          isPopular: false,
          usageCount: 156,
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

      // Check if force seed is requested (clears existing templates)
      const forceSeed = req.body.force === true;
      
      if (forceSeed) {
        await storage.clearAllTemplates();
        console.log('Cleared existing templates');
      }

      // Check if templates already exist
      const existingTemplates = await storage.getTemplates();
      if (existingTemplates.length > 0 && !forceSeed) {
        return res.json({
          message: "Templates already exist. Use 'force: true' in request body to re-seed.",
          existing: existingTemplates.length,
          seeded: 0
        });
      }

      // Seed templates
      const seededTemplates = await storage.seedTemplates(defaultTemplatesData);
      
      console.log(`Successfully seeded ${seededTemplates.length} templates`);
      
      res.json({
        message: "Templates seeded successfully",
        seeded: seededTemplates.length,
        templates: seededTemplates.map(t => ({ id: t.id, name: t.name }))
      });

    } catch (error) {
      console.error('Failed to seed templates:', error);
      res.status(500).json({ 
        message: "Failed to seed templates",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Print Jobs API
  app.get("/api/print-jobs", async (req, res) => {
    try {
      const status = req.query.status as string;
      const printJobs = await storage.getPrintJobs(status);
      res.json(printJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch print jobs" });
    }
  });

  app.get("/api/print-jobs/detailed", async (req, res) => {
    try {
      const printJobs = await storage.getPrintJobsWithDetails();
      res.json(printJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch detailed print jobs" });
    }
  });

  app.post("/api/print-jobs", async (req, res) => {
    try {
      const validatedData = insertPrintJobSchema.parse(req.body);
      const printJob = await storage.createPrintJob(validatedData);
      res.status(201).json(printJob);
    } catch (error) {
      console.error('Failed to create print job:', error);
      const message = error instanceof Error ? error.message : "Failed to create print job";
      res.status(400).json({ message });
    }
  });

  app.put("/api/print-jobs/:id", async (req, res) => {
    try {
      const validatedData = insertPrintJobSchema.partial().parse(req.body);
      const printJob = await storage.updatePrintJob(req.params.id, validatedData);
      res.json(printJob);
    } catch (error) {
      console.error('Failed to update print job:', error);
      const message = error instanceof Error ? error.message : "Failed to update print job";
      res.status(400).json({ message });
    }
  });

  app.delete("/api/print-jobs/:id", async (req, res) => {
    try {
      await storage.deletePrintJob(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete print job" });
    }
  });


  // Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const category = req.query.category as string;
      const settings = await storage.getSettings(category);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value, category } = req.body;
      const setting = await storage.setSetting({ key, value, category });
      res.json(setting);
    } catch (error) {
      console.error('Failed to save setting:', error);
      const message = error instanceof Error ? error.message : "Failed to save setting";
      res.status(400).json({ message });
    }
  });

  // Initialize default settings
  app.post("/api/settings/initialize", async (req, res) => {
    try {
      const defaultSettings = [
        { key: "school_name_english", value: "School Name", category: "school" },
        { key: "school_name_bengali", value: "স্কুলের নাম", category: "school" },
        { key: "valid_till", value: "Dec 2024", category: "school" },
        { key: "academic_year", value: new Date().getFullYear().toString(), category: "school" },
        { key: "session_year", value: new Date().getFullYear().toString(), category: "school" },
        { key: "address", value: "", category: "school" },
        { key: "phone", value: "", category: "school" },
        { key: "email", value: "", category: "school" },
        { key: "website", value: "", category: "school" },
      ];

      const results = [];
      for (const setting of defaultSettings) {
        const existing = await storage.getSetting(setting.key);
        if (!existing) {
          const created = await storage.setSetting(setting);
          results.push(created);
        }
      }

      res.json({ 
        message: "Default settings initialized", 
        created: results.length,
        settings: results 
      });
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      res.status(500).json({ message: "Failed to initialize settings" });
    }
  });

  // Stats API - Advanced Analytics
  app.get("/api/stats", async (req, res) => {
    try {
      console.log('Calling getAdvancedAnalytics...');
      const analytics = await storage.getAdvancedAnalytics();
      console.log('Analytics result:', JSON.stringify(analytics, null, 2));
      res.json(analytics);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback to basic stats for debugging
      console.log('Falling back to basic stats...');
      const basicStats = await storage.getStats();
      console.log('Basic stats:', basicStats);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to fetch stats", error: message });
    }
  });

  // Printer Status API
  app.get("/api/printer-status", async (req, res) => {
    try {
      const printerStatus = await storage.getPrinterStatus();
      res.json(printerStatus);
    } catch (error) {
      console.error('Failed to fetch printer status:', error);
      const message = error instanceof Error ? error.message : "Failed to fetch printer status";
      res.status(500).json({ message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
