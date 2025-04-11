import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, ensureAuthenticated, ensureRole } from "./auth";
import multer from "multer";
import { insertTreatmentSchema, insertAppointmentSchema, insertPatientTreatmentSchema, insertTreatmentStepSchema, insertTreatmentImageSchema } from "@shared/schema";
import path from "path";
import { mkdir } from "fs/promises";

// Setup multer for file uploads
const createUploadsDir = async () => {
  const dir = path.join(process.cwd(), 'uploads');
  try {
    await mkdir(dir, { recursive: true });
    return dir;
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
    return dir;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Setup file uploads
  const uploadsDir = await createUploadsDir();
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
  
  const upload = multer({ 
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Patient routes
  app.get("/api/patients", ensureRole(['admin', 'staff']), async (_req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Check if the requester is the patient or staff/admin
      if (req.user!.role === 'patient' && req.user!.id !== patient.userId) {
        return res.status(403).json({ message: "Unauthorized access to patient data" });
      }

      res.json(patient);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  // Staff routes
  app.get("/api/staff", ensureRole(['admin']), async (_req, res) => {
    try {
      const staffMembers = await storage.getAllStaff();
      res.json(staffMembers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", ensureRole(['admin', 'staff']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await storage.getStaffById(id);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      res.json(staffMember);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  // Treatment routes
  app.get("/api/treatments", ensureAuthenticated, async (_req, res) => {
    try {
      const treatments = await storage.getAllTreatments();
      res.json(treatments);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch treatments" });
    }
  });

  app.post("/api/treatments", ensureRole(['admin']), async (req, res) => {
    try {
      const result = insertTreatmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid treatment data", 
          errors: result.error.errors 
        });
      }

      const treatment = await storage.createTreatment(result.data);
      res.status(201).json(treatment);
    } catch (err) {
      res.status(500).json({ message: "Failed to create treatment" });
    }
  });

  // Patient Treatments routes
  app.get("/api/patient-treatments/:patientId", ensureAuthenticated, async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      
      // Check if the requester is the patient or staff/admin
      if (req.user!.role === 'patient') {
        const patient = await storage.getPatientByUserId(req.user!.id);
        if (!patient || patient.id !== patientId) {
          return res.status(403).json({ message: "Unauthorized access to treatment data" });
        }
      }

      const treatments = await storage.getPatientTreatments(patientId);
      res.json(treatments);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch patient treatments" });
    }
  });

  app.post("/api/patient-treatments", ensureRole(['admin', 'staff']), async (req, res) => {
    try {
      const result = insertPatientTreatmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid patient treatment data", 
          errors: result.error.errors 
        });
      }

      const treatment = await storage.createPatientTreatment(result.data);
      res.status(201).json(treatment);
    } catch (err) {
      res.status(500).json({ message: "Failed to create patient treatment" });
    }
  });

  app.post("/api/treatment-steps", ensureRole(['admin', 'staff']), async (req, res) => {
    try {
      const result = insertTreatmentStepSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid treatment step data", 
          errors: result.error.errors 
        });
      }

      const step = await storage.createTreatmentStep(result.data);
      res.status(201).json(step);
    } catch (err) {
      res.status(500).json({ message: "Failed to create treatment step" });
    }
  });

  app.patch("/api/treatment-steps/:id", ensureRole(['admin', 'staff']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const step = await storage.updateTreatmentStepStatus(id, req.body.status);
      
      if (!step) {
        return res.status(404).json({ message: "Treatment step not found" });
      }
      
      res.json(step);
    } catch (err) {
      res.status(500).json({ message: "Failed to update treatment step" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", ensureAuthenticated, async (req, res) => {
    try {
      // For patients, return only their appointments
      if (req.user!.role === 'patient') {
        const patient = await storage.getPatientByUserId(req.user!.id);
        if (!patient) {
          return res.status(404).json({ message: "Patient record not found" });
        }
        const appointments = await storage.getPatientAppointments(patient.id);
        return res.json(appointments);
      }
      
      // For staff and admin, return all appointments
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", ensureRole(['admin', 'staff']), async (req, res) => {
    try {
      const result = insertAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid appointment data", 
          errors: result.error.errors 
        });
      }

      const appointment = await storage.createAppointment(result.data);
      res.status(201).json(appointment);
    } catch (err) {
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id/status", ensureRole(['admin', 'staff']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.updateAppointmentStatus(id, req.body.status);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (err) {
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Treatment Images routes
  app.post("/api/images", ensureRole(['admin', 'staff']), upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageData = {
        patientTreatmentId: parseInt(req.body.patientTreatmentId),
        filename: req.file.filename,
        title: req.body.title,
        type: req.body.type || 'progress',
        uploadedBy: req.user!.id
      };

      const result = insertTreatmentImageSchema.safeParse(imageData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid image data", 
          errors: result.error.errors 
        });
      }

      const image = await storage.saveTreatmentImage(result.data);
      res.status(201).json(image);
    } catch (err) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.get("/api/images/treatment/:treatmentId", ensureAuthenticated, async (req, res) => {
    try {
      const treatmentId = parseInt(req.params.treatmentId);
      
      // Check if the requester is the patient or staff/admin
      if (req.user!.role === 'patient') {
        const treatment = await storage.getPatientTreatmentById(treatmentId);
        if (!treatment) {
          return res.status(404).json({ message: "Treatment not found" });
        }
        
        const patient = await storage.getPatientByUserId(req.user!.id);
        if (!patient || patient.id !== treatment.patientId) {
          return res.status(403).json({ message: "Unauthorized access to image data" });
        }
      }

      const images = await storage.getTreatmentImages(treatmentId);
      res.json(images);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch treatment images" });
    }
  });

  // Serve uploaded images
  app.get("/api/uploads/:filename", ensureAuthenticated, (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(uploadsDir, filename));
  });

  const httpServer = createServer(app);

  return httpServer;
}
