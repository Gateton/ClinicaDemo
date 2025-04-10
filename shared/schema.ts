import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("patient"), // patient, admin, staff
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phone: true,
  address: true,
  role: true,
});

// Patient profile schema
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dateOfBirth: text("date_of_birth"),
  allergies: text("allergies"),
  currentMedication: text("current_medication"),
  medicalConditions: text("medical_conditions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  userId: true,
  dateOfBirth: true,
  allergies: true,
  currentMedication: true,
  medicalConditions: true,
  notes: true,
});

// Treatments schema
export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTreatmentSchema = createInsertSchema(treatments).pick({
  name: true,
  description: true,
});

// Patient treatments schema
export const patientTreatments = pgTable("patient_treatments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  treatmentId: integer("treatment_id").notNull().references(() => treatments.id),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  progress: integer("progress").default(0), // 0-100
  phase: text("phase"),
});

export const insertPatientTreatmentSchema = createInsertSchema(patientTreatments).pick({
  patientId: true,
  treatmentId: true,
  status: true,
  startDate: true,
  endDate: true,
  notes: true,
  progress: true,
  phase: true,
});

// Appointments schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  staffId: integer("staff_id").references(() => users.id),
  treatmentId: integer("treatment_id").references(() => treatments.id),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull().default(30), // in minutes
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  patientId: true,
  staffId: true,
  treatmentId: true,
  date: true,
  duration: true,
  status: true,
  notes: true,
});

// Images schema
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  treatmentId: integer("treatment_id").references(() => treatments.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  type: text("type").notNull(),
  category: text("category"), // before, after, progress
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  isVisible: boolean("is_visible").default(true),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertImageSchema = createInsertSchema(images).pick({
  patientId: true,
  treatmentId: true,
  filename: true,
  originalName: true,
  type: true,
  category: true,
  uploadedById: true,
  isVisible: true,
  notes: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;

export type PatientTreatment = typeof patientTreatments.$inferSelect;
export type InsertPatientTreatment = z.infer<typeof insertPatientTreatmentSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Image = typeof images.$inferSelect;
export type InsertImage = z.infer<typeof insertImageSchema>;
