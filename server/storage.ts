import { users, patients, treatments, patientTreatments, appointments, images, type User, type InsertUser, type Patient, type InsertPatient, type Treatment, type InsertTreatment, type PatientTreatment, type InsertPatientTreatment, type Appointment, type InsertAppointment, type Image, type InsertImage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface for all CRUD operations
export interface IStorage {
  sessionStore: session.SessionStore;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  listUsers(role?: string): Promise<User[]>;

  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByUserId(userId: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<Patient>): Promise<Patient | undefined>;
  listPatients(): Promise<Patient[]>;

  // Treatment operations
  getTreatment(id: number): Promise<Treatment | undefined>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;
  updateTreatment(id: number, treatment: Partial<Treatment>): Promise<Treatment | undefined>;
  listTreatments(): Promise<Treatment[]>;

  // Patient Treatment operations
  getPatientTreatment(id: number): Promise<PatientTreatment | undefined>;
  createPatientTreatment(patientTreatment: InsertPatientTreatment): Promise<PatientTreatment>;
  updatePatientTreatment(id: number, patientTreatment: Partial<PatientTreatment>): Promise<PatientTreatment | undefined>;
  listPatientTreatments(patientId?: number): Promise<PatientTreatment[]>;

  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  listAppointments(filters?: {patientId?: number, staffId?: number, date?: Date, status?: string}): Promise<Appointment[]>;

  // Image operations
  getImage(id: number): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  updateImage(id: number, image: Partial<Image>): Promise<Image | undefined>;
  listImages(filters?: {patientId?: number, treatmentId?: number, category?: string, isVisible?: boolean}): Promise<Image[]>;
  deleteImage(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private treatments: Map<number, Treatment>;
  private patientTreatments: Map<number, PatientTreatment>;
  private appointments: Map<number, Appointment>;
  private images: Map<number, Image>;
  
  sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private patientCurrentId: number;
  private treatmentCurrentId: number;
  private patientTreatmentCurrentId: number;
  private appointmentCurrentId: number;
  private imageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.treatments = new Map();
    this.patientTreatments = new Map();
    this.appointments = new Map();
    this.images = new Map();
    
    this.userCurrentId = 1;
    this.patientCurrentId = 1;
    this.treatmentCurrentId = 1;
    this.patientTreatmentCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.imageCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Seed initial data
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "adminpassword", // Will be hashed in auth.ts
      fullName: "Admin Delica",
      email: "admin@delica.com",
      role: "admin"
    };
    this.createUser(adminUser);
    
    // Create default treatments
    const treatments = [
      { name: "Limpieza dental", description: "Limpieza dental profesional" },
      { name: "Ortodoncia", description: "Tratamiento de ortodoncia" },
      { name: "Blanqueamiento", description: "Blanqueamiento dental" },
      { name: "Implante Dental", description: "Implante dental completo" },
      { name: "Endodoncia", description: "Tratamiento de conducto" }
    ];
    
    treatments.forEach(t => this.createTreatment(t));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(role?: string): Promise<User[]> {
    const users = Array.from(this.users.values());
    if (role) {
      return users.filter(user => user.role === role);
    }
    return users;
  }

  // Patient operations
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByUserId(userId: number): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.userId === userId,
    );
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientCurrentId++;
    const now = new Date();
    const patient: Patient = { ...insertPatient, id, createdAt: now };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined> {
    const patient = await this.getPatient(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...patientData };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async listPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  // Treatment operations
  async getTreatment(id: number): Promise<Treatment | undefined> {
    return this.treatments.get(id);
  }

  async createTreatment(insertTreatment: InsertTreatment): Promise<Treatment> {
    const id = this.treatmentCurrentId++;
    const now = new Date();
    const treatment: Treatment = { ...insertTreatment, id, createdAt: now };
    this.treatments.set(id, treatment);
    return treatment;
  }

  async updateTreatment(id: number, treatmentData: Partial<Treatment>): Promise<Treatment | undefined> {
    const treatment = await this.getTreatment(id);
    if (!treatment) return undefined;
    
    const updatedTreatment = { ...treatment, ...treatmentData };
    this.treatments.set(id, updatedTreatment);
    return updatedTreatment;
  }

  async listTreatments(): Promise<Treatment[]> {
    return Array.from(this.treatments.values());
  }

  // Patient Treatment operations
  async getPatientTreatment(id: number): Promise<PatientTreatment | undefined> {
    return this.patientTreatments.get(id);
  }

  async createPatientTreatment(insertPatientTreatment: InsertPatientTreatment): Promise<PatientTreatment> {
    const id = this.patientTreatmentCurrentId++;
    const patientTreatment: PatientTreatment = { ...insertPatientTreatment, id };
    this.patientTreatments.set(id, patientTreatment);
    return patientTreatment;
  }

  async updatePatientTreatment(id: number, patientTreatmentData: Partial<PatientTreatment>): Promise<PatientTreatment | undefined> {
    const patientTreatment = await this.getPatientTreatment(id);
    if (!patientTreatment) return undefined;
    
    const updatedPatientTreatment = { ...patientTreatment, ...patientTreatmentData };
    this.patientTreatments.set(id, updatedPatientTreatment);
    return updatedPatientTreatment;
  }

  async listPatientTreatments(patientId?: number): Promise<PatientTreatment[]> {
    const patientTreatments = Array.from(this.patientTreatments.values());
    if (patientId) {
      return patientTreatments.filter(pt => pt.patientId === patientId);
    }
    return patientTreatments;
  }

  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const now = new Date();
    const appointment: Appointment = { ...insertAppointment, id, createdAt: now };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async listAppointments(filters?: {patientId?: number, staffId?: number, date?: Date, status?: string}): Promise<Appointment[]> {
    let appointments = Array.from(this.appointments.values());
    
    if (filters) {
      if (filters.patientId) {
        appointments = appointments.filter(a => a.patientId === filters.patientId);
      }
      
      if (filters.staffId) {
        appointments = appointments.filter(a => a.staffId === filters.staffId);
      }
      
      if (filters.status) {
        appointments = appointments.filter(a => a.status === filters.status);
      }
      
      if (filters.date) {
        const filterDate = new Date(filters.date);
        appointments = appointments.filter(a => {
          const appointmentDate = new Date(a.date);
          return appointmentDate.getFullYear() === filterDate.getFullYear() &&
                 appointmentDate.getMonth() === filterDate.getMonth() &&
                 appointmentDate.getDate() === filterDate.getDate();
        });
      }
    }
    
    return appointments;
  }

  // Image operations
  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageCurrentId++;
    const now = new Date();
    const image: Image = { ...insertImage, id, uploadedAt: now };
    this.images.set(id, image);
    return image;
  }

  async updateImage(id: number, imageData: Partial<Image>): Promise<Image | undefined> {
    const image = await this.getImage(id);
    if (!image) return undefined;
    
    const updatedImage = { ...image, ...imageData };
    this.images.set(id, updatedImage);
    return updatedImage;
  }

  async listImages(filters?: {patientId?: number, treatmentId?: number, category?: string, isVisible?: boolean}): Promise<Image[]> {
    let images = Array.from(this.images.values());
    
    if (filters) {
      if (filters.patientId) {
        images = images.filter(i => i.patientId === filters.patientId);
      }
      
      if (filters.treatmentId) {
        images = images.filter(i => i.treatmentId === filters.treatmentId);
      }
      
      if (filters.category) {
        images = images.filter(i => i.category === filters.category);
      }
      
      if (filters.isVisible !== undefined) {
        images = images.filter(i => i.isVisible === filters.isVisible);
      }
    }
    
    return images;
  }

  async deleteImage(id: number): Promise<boolean> {
    return this.images.delete(id);
  }
}

export const storage = new MemStorage();
