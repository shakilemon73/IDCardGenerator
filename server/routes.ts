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
        cb(new Error("Only image files are allowed for photos"), false);
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
        cb(new Error("Only Excel and CSV files are allowed"), false);
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
      if (req.file) {
        fs.unlinkSync(req.file.path); // Clean up uploaded file on error
      }
      res.status(400).json({ message: error.message || "Failed to create student" });
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
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error.message || "Failed to update student" });
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

      const results = [];
      const errors = [];
      
      // Parse CSV/Excel file
      const fileContent = fs.readFileSync(req.file.path, "utf8");
      
      csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      }, async (err, records) => {
        if (err) {
          fs.unlinkSync(req.file.path);
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
            errors.push({
              row: record,
              error: error.message || "Invalid data",
            });
          }
        }

        // Clean up file
        fs.unlinkSync(req.file.path);

        res.json({
          imported: results.length,
          errors: errors.length,
          students: results,
          errorDetails: errors,
        });
      });
    } catch (error) {
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
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/popular", async (req, res) => {
    try {
      const templates = await storage.getPopularTemplates();
      res.json(templates);
    } catch (error) {
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
      res.status(400).json({ message: error.message || "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.partial().parse(req.body);
      const template = await storage.updateTemplate(req.params.id, validatedData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to update template" });
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
      res.status(400).json({ message: error.message || "Failed to create print job" });
    }
  });

  app.put("/api/print-jobs/:id", async (req, res) => {
    try {
      const validatedData = insertPrintJobSchema.partial().parse(req.body);
      const printJob = await storage.updatePrintJob(req.params.id, validatedData);
      res.json(printJob);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to update print job" });
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

  // Statistics API
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
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

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value, category } = req.body;
      const setting = await storage.setSetting({ key, value, category });
      res.json(setting);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to save setting" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
