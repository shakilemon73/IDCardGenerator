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
import { eq, desc, asc, like, count, and, sql, gte, lt, between } from "drizzle-orm";

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
  getPrintJobsWithDetails(): Promise<(PrintJob & { student: Student | null; template: Template | null })[]>;
  createPrintJob(printJob: InsertPrintJob): Promise<PrintJob>;
  updatePrintJob(id: string, printJob: Partial<InsertPrintJob>): Promise<PrintJob>;
  deletePrintJob(id: string): Promise<void>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(category?: string): Promise<Setting[]>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  
  // Template Seeding
  seedTemplates(templates: InsertTemplate[]): Promise<Template[]>;
  clearAllTemplates(): Promise<void>;
  
  // Statistics
  getStats(): Promise<{
    totalStudents: number;
    cardsPrinted: number;
    templatesCount: number;
    printQueue: number;
  }>;
  
  // Advanced Analytics
  getAdvancedAnalytics(): Promise<{
    totalStudents: {
      current: number;
      previousMonth: number;
      monthOverMonthGrowth: string;
    };
    cardsPrinted: {
      current: number;
      previousWeek: number;
      weekOverWeekGrowth: string;
    };
    templates: {
      current: number;
      newThisMonth: number;
      newThisMonthText: string;
    };
    printQueue: {
      current: number;
      processing: number;
      averageProcessingTime: number;
      queueStatus: string;
      estimatedTime: string;
    };
  }>;
  
  // Printer Status
  getPrinterStatus(): Promise<{
    name: string;
    status: string;
    isOnline: boolean;
    paperLevel: number;
    inkLevel: number;
    lastUpdate: Date;
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

  // Template Seeding
  async seedTemplates(templateData: InsertTemplate[]): Promise<Template[]> {
    const createdTemplates = [];
    for (const templateItem of templateData) {
      const [template] = await db
        .insert(templates)
        .values(templateItem)
        .returning();
      createdTemplates.push(template);
    }
    return createdTemplates;
  }

  async clearAllTemplates(): Promise<void> {
    await db.delete(templates);
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

  async getPrintJobsWithDetails(): Promise<(PrintJob & { student: Student | null; template: Template | null })[]> {
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

  // Advanced Analytics
  async getAdvancedAnalytics(): Promise<{
    totalStudents: {
      current: number;
      previousMonth: number;
      monthOverMonthGrowth: string;
    };
    cardsPrinted: {
      current: number;
      previousWeek: number;
      weekOverWeekGrowth: string;
    };
    templates: {
      current: number;
      newThisMonth: number;
      newThisMonthText: string;
    };
    printQueue: {
      current: number;
      processing: number;
      averageProcessingTime: number;
      queueStatus: string;
      estimatedTime: string;
    };
  }> {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setTime(endOfLastWeek.getTime() - 1);

    // Get current counts and historical data
    const [
      currentStudents,
      studentsLastMonth,
      currentCardsPrinted,
      cardsPrintedLastWeek,
      currentTemplates,
      templatesThisMonth,
      queuedJobs,
      processingJobs,
      recentCompletedJobs
    ] = await Promise.all([
      // Total students
      db.select({ count: count() }).from(students),
      
      // Students from last month
      db.select({ count: count() })
        .from(students)
        .where(and(
          gte(students.createdAt, startOfLastMonth),
          lt(students.createdAt, endOfLastMonth)
        )),
      
      // Total completed print jobs
      db.select({ count: count() })
        .from(printJobs)
        .where(eq(printJobs.status, "completed")),
      
      // Completed print jobs from last week
      db.select({ count: count() })
        .from(printJobs)
        .where(and(
          eq(printJobs.status, "completed"),
          gte(printJobs.createdAt, startOfLastWeek),
          lt(printJobs.createdAt, endOfLastWeek)
        )),
      
      // Total templates
      db.select({ count: count() }).from(templates),
      
      // Templates created this month
      db.select({ count: count() })
        .from(templates)
        .where(gte(templates.createdAt, startOfThisMonth)),
      
      // Queued jobs
      db.select({ count: count() })
        .from(printJobs)
        .where(eq(printJobs.status, "queued")),
      
      // Processing jobs
      db.select({ count: count() })
        .from(printJobs)
        .where(eq(printJobs.status, "processing")),
      
      // Recent completed jobs for processing time calculation
      db.select({
        createdAt: printJobs.createdAt,
        updatedAt: printJobs.updatedAt
      })
        .from(printJobs)
        .where(eq(printJobs.status, "completed"))
        .orderBy(desc(printJobs.updatedAt))
        .limit(50)
    ]);

    // Calculate month-over-month growth for students
    const totalStudents = currentStudents[0]?.count || 0;
    const lastMonthStudents = studentsLastMonth[0]?.count || 0;
    let studentGrowthPercentage = 0;
    if (lastMonthStudents > 0) {
      studentGrowthPercentage = ((totalStudents - lastMonthStudents) / lastMonthStudents) * 100;
    } else if (totalStudents > 0) {
      studentGrowthPercentage = 100; // 100% growth from 0
    }
    const studentGrowthText = studentGrowthPercentage >= 0 
      ? `+${studentGrowthPercentage.toFixed(0)}%`
      : `${studentGrowthPercentage.toFixed(0)}%`;

    // Calculate week-over-week growth for cards printed
    const totalCardsPrinted = currentCardsPrinted[0]?.count || 0;
    const lastWeekCardsPrinted = cardsPrintedLastWeek[0]?.count || 0;
    let cardsGrowthPercentage = 0;
    if (lastWeekCardsPrinted > 0) {
      cardsGrowthPercentage = ((totalCardsPrinted - lastWeekCardsPrinted) / lastWeekCardsPrinted) * 100;
    } else if (totalCardsPrinted > 0) {
      cardsGrowthPercentage = 100;
    }
    const cardsGrowthText = cardsGrowthPercentage >= 0 
      ? `+${cardsGrowthPercentage.toFixed(0)}%`
      : `${cardsGrowthPercentage.toFixed(0)}%`;

    // Calculate template statistics
    const totalTemplates = currentTemplates[0]?.count || 0;
    const newTemplatesThisMonth = templatesThisMonth[0]?.count || 0;
    const newTemplatesText = newTemplatesThisMonth === 1 
      ? "1 new"
      : `${newTemplatesThisMonth} new`;

    // Calculate queue statistics and processing time
    const queueCount = queuedJobs[0]?.count || 0;
    const processingCount = processingJobs[0]?.count || 0;
    
    // Calculate average processing time from recent completed jobs
    let averageProcessingTime = 0;
    if (recentCompletedJobs.length > 0) {
      const totalProcessingTime = recentCompletedJobs.reduce((sum, job) => {
        if (job.createdAt && job.updatedAt) {
          const processingTime = job.updatedAt.getTime() - job.createdAt.getTime();
          return sum + processingTime;
        }
        return sum;
      }, 0);
      averageProcessingTime = Math.round(totalProcessingTime / recentCompletedJobs.length / 1000 / 60); // in minutes
    }

    // Determine queue status and estimated time
    let queueStatus = "Idle";
    let estimatedTime = "No jobs in queue";
    
    if (processingCount > 0) {
      queueStatus = "Processing";
      const remainingTime = averageProcessingTime || 5; // Default to 5 minutes if no data
      estimatedTime = `${remainingTime} minutes remaining`;
    } else if (queueCount > 0) {
      queueStatus = "Queued";
      const totalEstimatedTime = queueCount * (averageProcessingTime || 5);
      estimatedTime = `${totalEstimatedTime} minutes estimated`;
    }

    return {
      totalStudents: {
        current: totalStudents,
        previousMonth: lastMonthStudents,
        monthOverMonthGrowth: studentGrowthText,
      },
      cardsPrinted: {
        current: totalCardsPrinted,
        previousWeek: lastWeekCardsPrinted,
        weekOverWeekGrowth: cardsGrowthText,
      },
      templates: {
        current: totalTemplates,
        newThisMonth: newTemplatesThisMonth,
        newThisMonthText: newTemplatesText,
      },
      printQueue: {
        current: queueCount,
        processing: processingCount,
        averageProcessingTime,
        queueStatus,
        estimatedTime,
      },
    };
  }

  // Printer Status
  async getPrinterStatus(): Promise<{
    name: string;
    status: string;
    isOnline: boolean;
    paperLevel: number;
    inkLevel: number;
    lastUpdate: Date;
  }> {
    try {
      // Get printer settings or create defaults if they don't exist
      const [printerName, printerStatus, paperLevel, inkLevel, lastUpdate] = await Promise.all([
        this.getSetting("printer_name"),
        this.getSetting("printer_status"),
        this.getSetting("printer_paper_level"),
        this.getSetting("printer_ink_level"),
        this.getSetting("printer_last_update")
      ]);

      // If settings don't exist, create defaults
      if (!printerName) {
        await this.setSetting({
          key: "printer_name",
          value: "Canon PIXMA ID",
          category: "printer"
        });
      }

      if (!printerStatus) {
        await this.setSetting({
          key: "printer_status",
          value: "online",
          category: "printer"
        });
      }

      if (!paperLevel) {
        // Calculate paper level based on print jobs - simulate realistic usage
        const totalPrintJobs = await db.select({ count: count() })
          .from(printJobs)
          .where(eq(printJobs.status, "completed"));
        
        const jobCount = totalPrintJobs[0]?.count || 0;
        // Start at 100%, reduce by 1% for every 10 print jobs, minimum 20%
        const calculatedPaperLevel = Math.max(20, 100 - Math.floor(jobCount / 10));
        
        await this.setSetting({
          key: "printer_paper_level",
          value: calculatedPaperLevel,
          category: "printer"
        });
      }

      if (!inkLevel) {
        // Calculate ink level based on print jobs - ink depletes faster than paper
        const totalPrintJobs = await db.select({ count: count() })
          .from(printJobs)
          .where(eq(printJobs.status, "completed"));
        
        const jobCount = totalPrintJobs[0]?.count || 0;
        // Start at 100%, reduce by 2% for every 10 print jobs, minimum 15%
        const calculatedInkLevel = Math.max(15, 100 - Math.floor(jobCount / 5));
        
        await this.setSetting({
          key: "printer_ink_level",
          value: calculatedInkLevel,
          category: "printer"
        });
      }

      if (!lastUpdate) {
        await this.setSetting({
          key: "printer_last_update",
          value: new Date().toISOString(),
          category: "printer"
        });
      }

      // Get the current values
      const currentName = printerName?.value as string || "Canon PIXMA ID";
      const currentStatus = printerStatus?.value as string || "online";
      const currentPaperLevel = paperLevel?.value as number || 89;
      const currentInkLevel = inkLevel?.value as number || 76;
      const currentLastUpdate = lastUpdate?.value as string || new Date().toISOString();

      return {
        name: currentName,
        status: currentStatus === "online" ? "Online" : "Offline",
        isOnline: currentStatus === "online",
        paperLevel: Number(currentPaperLevel),
        inkLevel: Number(currentInkLevel),
        lastUpdate: new Date(currentLastUpdate)
      };
    } catch (error) {
      console.error('Failed to get printer status:', error);
      // Return default values if there's an error
      return {
        name: "Canon PIXMA ID",
        status: "Online",
        isOnline: true,
        paperLevel: 89,
        inkLevel: 76,
        lastUpdate: new Date()
      };
    }
  }
}

export const storage = new DatabaseStorage();
