import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPatientSchema, insertTreatmentSchema, insertPatientTreatmentSchema, insertAppointmentSchema, insertImageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Only allow authenticated users to view uploaded files
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }, express.static(uploadDir));

  // User routes
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const role = req.query.role as string | undefined;
    const users = await storage.listUsers(role);
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  });

  // Patient routes
  app.get("/api/patients", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      return res.json(patient ? [patient] : []);
    }
    
    const patients = await storage.listPatients();
    res.json(patients);
  });

  app.get("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const patientId = parseInt(req.params.id);
    
    // If patient, can only access own data
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient || patient.id !== patientId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    
    const patient = await storage.getPatient(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.json(patient);
  });

  app.post("/api/patients", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const patientId = parseInt(req.params.id);
    
    // If patient, can only update own data
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient || patient.id !== patientId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    
    try {
      // Partial validation of patient data
      const patientData = req.body;
      const updatedPatient = await storage.updatePatient(patientId, patientData);
      
      if (!updatedPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(updatedPatient);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  // Treatment routes
  app.get("/api/treatments", async (req, res) => {
    const treatments = await storage.listTreatments();
    res.json(treatments);
  });

  app.post("/api/treatments", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const treatmentData = insertTreatmentSchema.parse(req.body);
      const treatment = await storage.createTreatment(treatmentData);
      res.status(201).json(treatment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.put("/api/treatments/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const treatmentId = parseInt(req.params.id);
    
    try {
      const treatmentData = req.body;
      const updatedTreatment = await storage.updateTreatment(treatmentId, treatmentData);
      
      if (!updatedTreatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }
      
      res.json(updatedTreatment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  // Patient Treatment routes
  app.get("/api/patient-treatments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
    
    // If patient, can only view own treatments
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient) {
        return res.json([]);
      }
      
      const treatments = await storage.listPatientTreatments(patient.id);
      return res.json(treatments);
    }
    
    const treatments = await storage.listPatientTreatments(patientId);
    res.json(treatments);
  });

  app.post("/api/patient-treatments", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "staff")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const treatmentData = insertPatientTreatmentSchema.parse(req.body);
      const treatment = await storage.createPatientTreatment(treatmentData);
      res.status(201).json(treatment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.put("/api/patient-treatments/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "staff")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const treatmentId = parseInt(req.params.id);
    
    try {
      const treatmentData = req.body;
      const updatedTreatment = await storage.updatePatientTreatment(treatmentId, treatmentData);
      
      if (!updatedTreatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }
      
      res.json(updatedTreatment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const filters: {
      patientId?: number,
      staffId?: number,
      date?: Date,
      status?: string
    } = {};
    
    if (req.query.patientId) {
      filters.patientId = parseInt(req.query.patientId as string);
    }
    
    if (req.query.staffId) {
      filters.staffId = parseInt(req.query.staffId as string);
    }
    
    if (req.query.date) {
      filters.date = new Date(req.query.date as string);
    }
    
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    
    // If patient, can only view own appointments
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient) {
        return res.json([]);
      }
      
      filters.patientId = patient.id;
    }
    
    // If staff, can only view assigned appointments
    if (req.user.role === "staff") {
      filters.staffId = req.user.id;
    }
    
    const appointments = await storage.listAppointments(filters);
    res.json(appointments);
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Patients can only create appointments for themselves
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient || patient.id !== req.body.patientId) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const appointmentId = parseInt(req.params.id);
    const appointment = await storage.getAppointment(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Patients can only update certain fields of their own appointments
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient || patient.id !== appointment.patientId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Patients can only cancel appointments
      if (req.body.status && req.body.status !== "cancelled") {
        return res.status(403).json({ message: "Patients can only cancel appointments" });
      }
    }
    
    try {
      const appointmentData = req.body;
      const updatedAppointment = await storage.updateAppointment(appointmentId, appointmentData);
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  // Image routes
  app.get("/api/images", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const filters: {
      patientId?: number,
      treatmentId?: number,
      category?: string,
      isVisible?: boolean
    } = {};
    
    if (req.query.patientId) {
      filters.patientId = parseInt(req.query.patientId as string);
    }
    
    if (req.query.treatmentId) {
      filters.treatmentId = parseInt(req.query.treatmentId as string);
    }
    
    if (req.query.category) {
      filters.category = req.query.category as string;
    }
    
    // Patients can only see visible images
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient) {
        return res.json([]);
      }
      
      filters.patientId = patient.id;
      filters.isVisible = true;
    }
    
    const images = await storage.listImages(filters);
    res.json(images);
  });

  app.post("/api/images", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "staff")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    
    try {
      const imageData = {
        ...req.body,
        patientId: parseInt(req.body.patientId),
        treatmentId: req.body.treatmentId ? parseInt(req.body.treatmentId) : undefined,
        filename: req.file.filename,
        originalName: req.file.originalname,
        type: req.file.mimetype,
        uploadedById: req.user.id,
        isVisible: req.body.isVisible === 'true'
      };
      
      const validatedData = insertImageSchema.parse(imageData);
      const image = await storage.createImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.put("/api/images/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "staff")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const imageId = parseInt(req.params.id);
    
    try {
      const imageData = req.body;
      
      // Convert boolean string to actual boolean
      if (imageData.isVisible !== undefined) {
        imageData.isVisible = imageData.isVisible === 'true' || imageData.isVisible === true;
      }
      
      const updatedImage = await storage.updateImage(imageId, imageData);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.delete("/api/images/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "staff")) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const imageId = parseInt(req.params.id);
    const image = await storage.getImage(imageId);
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    // Delete image file
    const imagePath = path.join(uploadDir, image.filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    const deleted = await storage.deleteImage(imageId);
    res.status(deleted ? 200 : 404).json({ success: deleted });
  });

  // Stats routes (for dashboard)
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // For patients, return their stats
    if (req.user.role === "patient") {
      const patient = await storage.getPatientByUserId(req.user.id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      
      const patientTreatments = await storage.listPatientTreatments(patient.id);
      const appointments = await storage.listAppointments({ patientId: patient.id });
      const images = await storage.listImages({ patientId: patient.id, isVisible: true });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate >= today && a.status !== "cancelled";
      });
      
      return res.json({
        treatments: patientTreatments.length,
        activeTreatments: patientTreatments.filter(t => t.status === "active").length,
        upcomingAppointments: upcomingAppointments.length,
        totalAppointments: appointments.length,
        images: images.length
      });
    }
    
    // For admin and staff, return overall stats
    const patients = await storage.listPatients();
    const patientTreatments = await storage.listPatientTreatments();
    const appointments = await storage.listAppointments();
    const images = await storage.listImages();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate.getDate() === today.getDate() &&
             appointmentDate.getMonth() === today.getMonth() &&
             appointmentDate.getFullYear() === today.getFullYear();
    });
    
    return res.json({
      patientCount: patients.length,
      todayAppointments: todayAppointments.length,
      activeTreatments: patientTreatments.filter(t => t.status === "active").length,
      storedImages: images.length
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
