import { 
  User, InsertUser, Patient, InsertPatient, Staff, InsertStaff,
  Treatment, InsertTreatment, PatientTreatment, InsertPatientTreatment,
  TreatmentStep, InsertTreatmentStep, Appointment, InsertAppointment,
  TreatmentImage, InsertTreatmentImage
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Patient management
  getPatientById(id: number): Promise<Patient | undefined>;
  getPatientByUserId(userId: number): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined>;
  
  // Staff management
  getStaffById(id: number): Promise<Staff | undefined>;
  getStaffByUserId(userId: number): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: number, staffData: Partial<Staff>): Promise<Staff | undefined>;
  
  // Treatment management
  getTreatmentById(id: number): Promise<Treatment | undefined>;
  getAllTreatments(): Promise<Treatment[]>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;
  
  // Patient Treatment management
  getPatientTreatmentById(id: number): Promise<PatientTreatment | undefined>;
  getPatientTreatments(patientId: number): Promise<PatientTreatment[]>;
  createPatientTreatment(patientTreatment: InsertPatientTreatment): Promise<PatientTreatment>;
  updatePatientTreatmentProgress(id: number, progress: number): Promise<PatientTreatment | undefined>;
  updatePatientTreatmentStatus(id: number, status: string): Promise<PatientTreatment | undefined>;
  
  // Treatment Step management
  getTreatmentStepById(id: number): Promise<TreatmentStep | undefined>;
  getTreatmentSteps(patientTreatmentId: number): Promise<TreatmentStep[]>;
  createTreatmentStep(treatmentStep: InsertTreatmentStep): Promise<TreatmentStep>;
  updateTreatmentStepStatus(id: number, status: string): Promise<TreatmentStep | undefined>;
  
  // Appointment management
  getAppointmentById(id: number): Promise<Appointment | undefined>;
  getAllAppointments(): Promise<Appointment[]>;
  getPatientAppointments(patientId: number): Promise<Appointment[]>;
  getStaffAppointments(staffId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Treatment Image management
  getTreatmentImageById(id: number): Promise<TreatmentImage | undefined>;
  getTreatmentImages(patientTreatmentId: number): Promise<TreatmentImage[]>;
  saveTreatmentImage(imageData: InsertTreatmentImage): Promise<TreatmentImage>;
  deleteTreatmentImage(id: number): Promise<boolean>;
  
  // Registration helpers
  registerPatient(userData: InsertUser, patientData: InsertPatient): Promise<User>;
  registerStaff(userData: InsertUser, staffData: InsertStaff): Promise<User>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private staff: Map<number, Staff>;
  private treatments: Map<number, Treatment>;
  private patientTreatments: Map<number, PatientTreatment>;
  private treatmentSteps: Map<number, TreatmentStep>;
  private appointments: Map<number, Appointment>;
  private treatmentImages: Map<number, TreatmentImage>;
  
  sessionStore: session.SessionStore;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.staff = new Map();
    this.treatments = new Map();
    this.patientTreatments = new Map();
    this.treatmentSteps = new Map();
    this.appointments = new Map();
    this.treatmentImages = new Map();
    this.currentId = 1;
    
    // Create session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with some example data
    this.initializeData();
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Patient management
  async getPatientById(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByUserId(userId: number): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.userId === userId,
    );
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentId++;
    const now = new Date();
    const patient: Patient = { ...insertPatient, id, createdAt: now };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined> {
    const patient = await this.getPatientById(id);
    if (!patient) return undefined;
    
    const updatedPatient: Patient = { ...patient, ...patientData };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  // Staff management
  async getStaffById(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    return Array.from(this.staff.values()).find(
      (staff) => staff.userId === userId,
    );
  }

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.currentId++;
    const now = new Date();
    const staff: Staff = { ...insertStaff, id, createdAt: now };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaff(id: number, staffData: Partial<Staff>): Promise<Staff | undefined> {
    const staff = await this.getStaffById(id);
    if (!staff) return undefined;
    
    const updatedStaff: Staff = { ...staff, ...staffData };
    this.staff.set(id, updatedStaff);
    return updatedStaff;
  }

  // Treatment management
  async getTreatmentById(id: number): Promise<Treatment | undefined> {
    return this.treatments.get(id);
  }

  async getAllTreatments(): Promise<Treatment[]> {
    return Array.from(this.treatments.values());
  }

  async createTreatment(insertTreatment: InsertTreatment): Promise<Treatment> {
    const id = this.currentId++;
    const now = new Date();
    const treatment: Treatment = { ...insertTreatment, id, createdAt: now };
    this.treatments.set(id, treatment);
    return treatment;
  }

  // Patient Treatment management
  async getPatientTreatmentById(id: number): Promise<PatientTreatment | undefined> {
    return this.patientTreatments.get(id);
  }

  async getPatientTreatments(patientId: number): Promise<PatientTreatment[]> {
    return Array.from(this.patientTreatments.values())
      .filter(treatment => treatment.patientId === patientId);
  }

  async createPatientTreatment(insertPatientTreatment: InsertPatientTreatment): Promise<PatientTreatment> {
    const id = this.currentId++;
    const now = new Date();
    const patientTreatment: PatientTreatment = { ...insertPatientTreatment, id, createdAt: now };
    this.patientTreatments.set(id, patientTreatment);
    return patientTreatment;
  }

  async updatePatientTreatmentProgress(id: number, progress: number): Promise<PatientTreatment | undefined> {
    const treatment = await this.getPatientTreatmentById(id);
    if (!treatment) return undefined;
    
    const updatedTreatment: PatientTreatment = { ...treatment, progress };
    this.patientTreatments.set(id, updatedTreatment);
    return updatedTreatment;
  }

  async updatePatientTreatmentStatus(id: number, status: string): Promise<PatientTreatment | undefined> {
    const treatment = await this.getPatientTreatmentById(id);
    if (!treatment) return undefined;
    
    const updatedTreatment: PatientTreatment = { ...treatment, status };
    this.patientTreatments.set(id, updatedTreatment);
    return updatedTreatment;
  }

  // Treatment Step management
  async getTreatmentStepById(id: number): Promise<TreatmentStep | undefined> {
    return this.treatmentSteps.get(id);
  }

  async getTreatmentSteps(patientTreatmentId: number): Promise<TreatmentStep[]> {
    return Array.from(this.treatmentSteps.values())
      .filter(step => step.patientTreatmentId === patientTreatmentId);
  }

  async createTreatmentStep(insertTreatmentStep: InsertTreatmentStep): Promise<TreatmentStep> {
    const id = this.currentId++;
    const now = new Date();
    const treatmentStep: TreatmentStep = { ...insertTreatmentStep, id, createdAt: now };
    this.treatmentSteps.set(id, treatmentStep);
    return treatmentStep;
  }

  async updateTreatmentStepStatus(id: number, status: string): Promise<TreatmentStep | undefined> {
    const step = await this.getTreatmentStepById(id);
    if (!step) return undefined;
    
    const updatedStep: TreatmentStep = { 
      ...step, 
      status,
      date: status === 'completed' ? new Date() : step.date
    };
    this.treatmentSteps.set(id, updatedStep);
    return updatedStep;
  }

  // Appointment management
  async getAppointmentById(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getPatientAppointments(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.patientId === patientId);
  }

  async getStaffAppointments(staffId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.staffId === staffId);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId++;
    const now = new Date();
    const appointment: Appointment = { ...insertAppointment, id, createdAt: now };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = await this.getAppointmentById(id);
    if (!appointment) return undefined;
    
    const updatedAppointment: Appointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Treatment Image management
  async getTreatmentImageById(id: number): Promise<TreatmentImage | undefined> {
    return this.treatmentImages.get(id);
  }

  async getTreatmentImages(patientTreatmentId: number): Promise<TreatmentImage[]> {
    return Array.from(this.treatmentImages.values())
      .filter(image => image.patientTreatmentId === patientTreatmentId);
  }

  async saveTreatmentImage(insertTreatmentImage: InsertTreatmentImage): Promise<TreatmentImage> {
    const id = this.currentId++;
    const now = new Date();
    const treatmentImage: TreatmentImage = { ...insertTreatmentImage, id, uploadedAt: now };
    this.treatmentImages.set(id, treatmentImage);
    return treatmentImage;
  }

  async deleteTreatmentImage(id: number): Promise<boolean> {
    return this.treatmentImages.delete(id);
  }

  // Registration helpers
  async registerPatient(userData: InsertUser, patientData: InsertPatient): Promise<User> {
    // Check if username already exists
    const existingUser = await this.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    // Create user
    const user = await this.createUser(userData);
    
    // Create patient profile
    await this.createPatient({
      ...patientData,
      userId: user.id
    });
    
    return user;
  }

  async registerStaff(userData: InsertUser, staffData: InsertStaff): Promise<User> {
    // Check if username already exists
    const existingUser = await this.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    // Create user
    const user = await this.createUser(userData);
    
    // Create staff profile
    await this.createStaff({
      ...staffData,
      userId: user.id
    });
    
    return user;
  }

  // Initialize some data for testing purposes
  private async initializeData() {
    // Create some treatments
    const cleaningTreatment = await this.createTreatment({
      name: "Limpieza dental",
      description: "Limpieza dental profesional para eliminar placa y sarro",
      defaultDuration: 30
    });
    
    const whiteningTreatment = await this.createTreatment({
      name: "Blanqueamiento dental",
      description: "Tratamiento para aclarar el color de los dientes mediante gel activado por luz",
      defaultDuration: 60
    });
    
    const orthoTreatment = await this.createTreatment({
      name: "Ortodoncia",
      description: "Tratamiento para corregir la posición de los dientes mediante brackets o alineadores",
      defaultDuration: 45
    });
    
    // Create admin user
    const adminUser = await this.createUser({
      username: "admin",
      password: "$2b$10$CtY0FIGxjmtC0MReuPWuKOghPVMa3YFoGa0VF2UyY1Oe9Wf1Qf3a.salt", // password: "admin123"
      email: "admin@clinicadelica.com",
      fullName: "Administrador Sistema",
      role: "admin"
    });
    
    // Create admin staff profile
    await this.createStaff({
      userId: adminUser.id,
      position: "Director",
      specialty: "Administración",
      licenseNumber: "ADM-001"
    });
    
    // Create doctor user
    const doctorUser = await this.createUser({
      username: "carmen",
      password: "$2b$10$CtY0FIGxjmtC0MReuPWuKOghPVMa3YFoGa0VF2UyY1Oe9Wf1Qf3a.salt", // password: "carmen123"
      email: "carmen@clinicadelica.com",
      fullName: "Dra. Carmen Rodríguez",
      role: "staff",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&h=150"
    });
    
    // Create doctor staff profile
    const doctorStaff = await this.createStaff({
      userId: doctorUser.id,
      position: "doctor",
      specialty: "Odontología General, Ortodoncista",
      licenseNumber: "ODN-12345"
    });
    
    // Create patient user
    const patientUser = await this.createUser({
      username: "ana",
      password: "$2b$10$CtY0FIGxjmtC0MReuPWuKOghPVMa3YFoGa0VF2UyY1Oe9Wf1Qf3a.salt", // password: "ana123"
      email: "ana.perez@email.com",
      fullName: "Ana Pérez",
      role: "patient",
      phone: "+34 678 901 234",
      profileImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&h=150"
    });
    
    // Create patient profile
    const patient = await this.createPatient({
      userId: patientUser.id,
      dateOfBirth: "15/05/1985",
      gender: "Femenino",
      address: "Calle Alcalá 123, 28001 Madrid",
      insurance: "Sanitas",
      occupation: "Profesora",
      allergies: ["Penicilina", "Látex"],
      medicalConditions: ["Hipertensión"],
      currentMedication: "Enalapril 10mg (diario)",
      medicalNotes: "Paciente con sensibilidad dental. Prefiere anestesia local para procedimientos invasivos. Visita regular cada 6 meses para limpieza."
    });
    
    // Create patient treatment
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30);
    
    const patientTreatment = await this.createPatientTreatment({
      patientId: patient.id,
      treatmentId: whiteningTreatment.id,
      staffId: doctorStaff.id,
      status: "in_progress",
      progress: 60,
      notes: "Paciente responde bien al tratamiento. Se recomienda evitar alimentos que manchan durante el periodo de tratamiento.",
      startDate: now,
      endDate: endDate
    });
    
    // Create treatment steps
    await this.createTreatmentStep({
      patientTreatmentId: patientTreatment.id,
      name: "Primera sesión",
      description: "Evaluación inicial y primera aplicación del tratamiento.",
      status: "completed",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30) // 30 days ago
    });
    
    await this.createTreatmentStep({
      patientTreatmentId: patientTreatment.id,
      name: "Segunda sesión",
      description: "Segunda aplicación del tratamiento y evaluación de resultados intermedios.",
      status: "completed",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
    });
    
    await this.createTreatmentStep({
      patientTreatmentId: patientTreatment.id,
      name: "Tercera sesión",
      description: "Aplicación final del tratamiento y evaluación de resultados.",
      status: "pending",
      date: now
    });
    
    // Create appointment
    await this.createAppointment({
      patientId: patient.id,
      staffId: doctorStaff.id,
      patientTreatmentId: patientTreatment.id,
      date: now,
      duration: 60,
      status: "confirmed",
      notes: "Tercera sesión de blanqueamiento dental"
    });
    
    // Create some treatment images
    await this.saveTreatmentImage({
      patientTreatmentId: patientTreatment.id,
      filename: "before-treatment.jpg",
      title: "Antes del tratamiento",
      type: "before",
      uploadedBy: doctorUser.id
    });
    
    await this.saveTreatmentImage({
      patientTreatmentId: patientTreatment.id,
      filename: "progress-treatment.jpg",
      title: "Progreso del tratamiento",
      type: "progress",
      uploadedBy: doctorUser.id
    });
  }
}

export const storage = new MemStorage();
