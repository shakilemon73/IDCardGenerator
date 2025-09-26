import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameEnglish: text("name_english").notNull(),
  nameBengali: text("name_bengali").notNull(),
  idNumber: text("id_number").notNull().unique(),
  class: text("class").notNull(),
  section: text("section"),
  rollNumber: text("roll_number"),
  fatherName: text("father_name"),
  motherName: text("mother_name"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  phoneNumber: text("phone_number"),
  photoUrl: text("photo_url"),
  bloodGroup: text("blood_group"),
  session: text("session"),
  admissionDate: text("admission_date"),
  status: text("status").default("active"), // active, inactive, graduated
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").default("student"), // student, staff, visitor
  isDefault: boolean("is_default").default(false),
  isPopular: boolean("is_popular").default(false),
  usageCount: integer("usage_count").default(0),
  design: json("design").notNull(), // JSON containing design configuration
  preview: text("preview"), // Base64 preview image
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const printJobs = pgTable("print_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id).notNull(),
  templateId: varchar("template_id").references(() => templates.id).notNull(),
  status: text("status").default("queued"), // queued, processing, completed, failed
  priority: integer("priority").default(1),
  printerSettings: json("printer_settings"), // Printer configuration
  pdfUrl: text("pdf_url"), // Generated PDF URL
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: json("value").notNull(),
  category: text("category").default("general"), // general, printer, template
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  printJobs: many(printJobs),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  printJobs: many(printJobs),
}));

export const printJobsRelations = relations(printJobs, ({ one }) => ({
  student: one(students, {
    fields: [printJobs.studentId],
    references: [students.id],
  }),
  template: one(templates, {
    fields: [printJobs.templateId],
    references: [templates.id],
  }),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrintJobSchema = createInsertSchema(printJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type PrintJob = typeof printJobs.$inferSelect;
export type InsertPrintJob = z.infer<typeof insertPrintJobSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Template design interface
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
