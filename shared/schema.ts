import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default('patient'), // 'admin', 'staff', 'patient'
  phone: text("phone"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow()
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  insurance: text("insurance"),
  occupation: text("occupation"),
  allergies: text("allergies").array(),
  medicalConditions: text("medical_conditions").array(),
  currentMedication: text("current_medication"),
  medicalNotes: text("medical_notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  position: text("position").notNull(), // 'doctor', 'assistant', etc.
  specialty: text("specialty"),
  licenseNumber: text("license_number"),
  createdAt: timestamp("created_at").defaultNow()
});

export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  defaultDuration: integer("default_duration").notNull(), // in minutes
  createdAt: timestamp("created_at").defaultNow()
});

export const patientTreatments = pgTable("patient_treatments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  treatmentId: integer("treatment_id").notNull().references(() => treatments.id, { onDelete: "cascade" }),
  staffId: integer("staff_id").notNull().references(() => staff.id, { onDelete: "restrict" }),
  status: text("status").notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'cancelled'
  progress: integer("progress").notNull().default(0), // progress percentage 0-100
  notes: text("notes"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow()
});

export const treatmentSteps = pgTable("treatment_steps", {
  id: serial("id").primaryKey(),
  patientTreatmentId: integer("patient_treatment_id").notNull().references(() => patientTreatments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('pending'), // 'pending', 'completed'
  date: timestamp("date"),
  createdAt: timestamp("created_at").defaultNow()
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  staffId: integer("staff_id").notNull().references(() => staff.id, { onDelete: "restrict" }),
  patientTreatmentId: integer("patient_treatment_id").references(() => patientTreatments.id, { onDelete: "set null" }),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default('scheduled'), // 'scheduled', 'confirmed', 'cancelled', 'completed'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const treatmentImages = pgTable("treatment_images", {
  id: serial("id").primaryKey(),
  patientTreatmentId: integer("patient_treatment_id").notNull().references(() => patientTreatments.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull().default('progress'), // 'before', 'progress', 'after'
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

// Schema for inserting patients
export const insertPatientSchema = createInsertSchema(patients)
  .omit({ id: true, createdAt: true });

// Schema for inserting staff
export const insertStaffSchema = createInsertSchema(staff)
  .omit({ id: true, createdAt: true });

// Schema for inserting treatments
export const insertTreatmentSchema = createInsertSchema(treatments)
  .omit({ id: true, createdAt: true });

// Schema for inserting patient treatments
export const insertPatientTreatmentSchema = createInsertSchema(patientTreatments)
  .omit({ id: true, createdAt: true });

// Schema for inserting treatment steps
export const insertTreatmentStepSchema = createInsertSchema(treatmentSteps)
  .omit({ id: true, createdAt: true });

// Schema for inserting appointments
export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({ id: true, createdAt: true });

// Schema for inserting treatment images
export const insertTreatmentImageSchema = createInsertSchema(treatmentImages)
  .omit({ id: true, uploadedAt: true });

// Registration schema that combines user and patient/staff data
export const registerUserSchema = z.object({
  user: insertUserSchema,
  profile: z.union([insertPatientSchema, insertStaffSchema])
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type InsertPatientTreatment = z.infer<typeof insertPatientTreatmentSchema>;
export type InsertTreatmentStep = z.infer<typeof insertTreatmentStepSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertTreatmentImage = z.infer<typeof insertTreatmentImageSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Treatment = typeof treatments.$inferSelect;
export type PatientTreatment = typeof patientTreatments.$inferSelect;
export type TreatmentStep = typeof treatmentSteps.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type TreatmentImage = typeof treatmentImages.$inferSelect;
