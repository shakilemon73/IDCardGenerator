import { 
  students, 
  templates, 
  printJobs, 
  settings,
  type Student, 
  type InsertStudent,
  type Template,
  type InsertTemplate,
  type PrintJob,
  type InsertPrintJob,
  type Setting,
  type InsertSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, count, and, sql } from "drizzle-orm";

export interface IStorage {
  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudents(page?: number, limit?: number, search?: string): Promise<{ students: Student[], total: number }>;
  getStudentByIdNumber(idNumber: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  
  // Templates
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplates(category?: string): Promise<Template[]>;
  getPopularTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: string, template: Partial<InsertTemplate>): Promise<Template>;
  incrementTemplateUsage(id: string): Promise<void>;
  deleteTemplate(id: string): Promise<void>;
  
  // Print Jobs
  getPrintJob(id: string): Promise<PrintJob | undefined>;
  getPrintJobs(status?: string): Promise<PrintJob[]>;
  getPrintJobsWithDetails(): Promise<(PrintJob & { student: Student; template: Template })[]>;
  createPrintJob(printJob: InsertPrintJob): Promise<PrintJob>;
  updatePrintJob(id: string, printJob: Partial<InsertPrintJob>): Promise<PrintJob>;
  deletePrintJob(id: string): Promise<void>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(category?: string): Promise<Setting[]>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  
  // Statistics
  getStats(): Promise<{
    totalStudents: number;
    cardsPrinted: number;
    templatesCount: number;
    printQueue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudents(page = 1, limit = 10, search = ""): Promise<{ students: Student[], total: number }> {
    const offset = (page - 1) * limit;
    const searchCondition = search 
      ? like(students.nameEnglish, `%${search}%`)
      : undefined;

    const [studentsResult, totalResult] = await Promise.all([
      db.select()
        .from(students)
        .where(searchCondition)
        .orderBy(desc(students.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(students)
        .where(searchCondition)
    ]);

    return {
      students: studentsResult,
      total: totalResult[0]?.count || 0
    };
  }

  async getStudentByIdNumber(idNumber: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.idNumber, idNumber));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudent(id: string, insertStudent: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set({ ...insertStudent, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getTemplates(category?: string): Promise<Template[]> {
    const condition = category ? eq(templates.category, category) : undefined;
    return await db.select()
      .from(templates)
      .where(condition)
      .orderBy(desc(templates.usageCount), desc(templates.createdAt));
  }

  async getPopularTemplates(): Promise<Template[]> {
    return await db.select()
      .from(templates)
      .where(eq(templates.isPopular, true))
      .orderBy(desc(templates.usageCount))
      .limit(10);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateTemplate(id: string, insertTemplate: Partial<InsertTemplate>): Promise<Template> {
    const [template] = await db
      .update(templates)
      .set({ ...insertTemplate, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return template;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await db
      .update(templates)
      .set({ usageCount: sql`${templates.usageCount} + 1` })
      .where(eq(templates.id, id));
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Print Jobs
  async getPrintJob(id: string): Promise<PrintJob | undefined> {
    const [printJob] = await db.select().from(printJobs).where(eq(printJobs.id, id));
    return printJob || undefined;
  }

  async getPrintJobs(status?: string): Promise<PrintJob[]> {
    const condition = status ? eq(printJobs.status, status) : undefined;
    return await db.select()
      .from(printJobs)
      .where(condition)
      .orderBy(asc(printJobs.priority), desc(printJobs.createdAt));
  }

  async getPrintJobsWithDetails(): Promise<(PrintJob & { student: Student; template: Template })[]> {
    return await db.select({
      id: printJobs.id,
      studentId: printJobs.studentId,
      templateId: printJobs.templateId,
      status: printJobs.status,
      priority: printJobs.priority,
      printerSettings: printJobs.printerSettings,
      pdfUrl: printJobs.pdfUrl,
      errorMessage: printJobs.errorMessage,
      createdAt: printJobs.createdAt,
      updatedAt: printJobs.updatedAt,
      student: students,
      template: templates,
    })
    .from(printJobs)
    .leftJoin(students, eq(printJobs.studentId, students.id))
    .leftJoin(templates, eq(printJobs.templateId, templates.id))
    .orderBy(asc(printJobs.priority), desc(printJobs.createdAt));
  }

  async createPrintJob(insertPrintJob: InsertPrintJob): Promise<PrintJob> {
    const [printJob] = await db
      .insert(printJobs)
      .values(insertPrintJob)
      .returning();
    return printJob;
  }

  async updatePrintJob(id: string, insertPrintJob: Partial<InsertPrintJob>): Promise<PrintJob> {
    const [printJob] = await db
      .update(printJobs)
      .set({ ...insertPrintJob, updatedAt: new Date() })
      .where(eq(printJobs.id, id))
      .returning();
    return printJob;
  }

  async deletePrintJob(id: string): Promise<void> {
    await db.delete(printJobs).where(eq(printJobs.id, id));
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async getSettings(category?: string): Promise<Setting[]> {
    const condition = category ? eq(settings.category, category) : undefined;
    return await db.select()
      .from(settings)
      .where(condition)
      .orderBy(asc(settings.key));
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(insertSetting.key);
    
    if (existing) {
      const [setting] = await db
        .update(settings)
        .set({ ...insertSetting, updatedAt: new Date() })
        .where(eq(settings.key, insertSetting.key))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(settings)
        .values(insertSetting)
        .returning();
      return setting;
    }
  }

  // Statistics
  async getStats(): Promise<{
    totalStudents: number;
    cardsPrinted: number;
    templatesCount: number;
    printQueue: number;
  }> {
    const [studentsCount, printedCount, templatesCount, queueCount] = await Promise.all([
      db.select({ count: count() }).from(students),
      db.select({ count: count() }).from(printJobs).where(eq(printJobs.status, "completed")),
      db.select({ count: count() }).from(templates),
      db.select({ count: count() }).from(printJobs).where(eq(printJobs.status, "queued"))
    ]);

    return {
      totalStudents: studentsCount[0]?.count || 0,
      cardsPrinted: printedCount[0]?.count || 0,
      templatesCount: templatesCount[0]?.count || 0,
      printQueue: queueCount[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
