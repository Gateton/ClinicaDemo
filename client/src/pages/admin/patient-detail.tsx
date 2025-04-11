import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardTitle, 
  CardHeader,
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Heart,
  Pill,
  FileText,
  Search,
  Plus,
  Check,
  MoreVertical
} from "lucide-react";
import TreatmentProgress from "@/components/shared/treatment-progress";
import ImageUpload from "@/components/admin/image-upload";
import PatientForm from "@/components/admin/patient-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Patient {
  id: number;
  userId: number;
  user: {
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  insurance?: string;
  occupation?: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedication?: string;
  medicalNotes?: string;
  since?: Date;
}

interface Treatment {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  startDate: Date;
  endDate?: Date;
  staffName: string;
  steps: {
    id: number;
    name: string;
    description: string;
    status: 'pending' | 'completed';
    date: Date | null;
  }[];
}

interface TreatmentImage {
  id: number;
  patientTreatmentId: number;
  filename: string;
  title: string;
  type: 'before' | 'progress' | 'after';
  uploadedAt: Date;
  url: string;
}

interface Appointment {
  id: number;
  date: Date;
  patientId: number;
  staffName: string;
  treatmentName: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch patient data
  const { 
    data: patient, 
    isLoading: isLoadingPatient,
    error: patientError
  } = useQuery<Patient>({
    queryKey: [`/api/patients/${id}`],
    enabled: !!id,
  });

  // Fetch patient treatments
  const { 
    data: treatments, 
    isLoading: isLoadingTreatments,
  } = useQuery<Treatment[]>({
    queryKey: [`/api/patient-treatments/${id}`],
    enabled: !!id,
  });

  // Fetch patient images
  const { 
    data: treatmentImages, 
    isLoading: isLoadingImages,
  } = useQuery<TreatmentImage[]>({
    queryKey: [`/api/images/treatment`],
    enabled: !!treatments && treatments.length > 0,
  });

  // Fetch patient appointments
  const { 
    data: appointments, 
    isLoading: isLoadingAppointments,
  } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments`],
    select: (data) => data.filter(appointment => appointment.patientId === parseInt(id as string)),
    enabled: !!id,
  });

  // Get current/active treatment
  const currentTreatment = treatments?.find(t => t.status === "in_progress");
  
  // Get next appointment
  const nextAppointment = appointments?.filter(a => 
    new Date(a.date) > new Date() && 
    (a.status === 'scheduled' || a.status === 'confirmed')
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Filter images based on search term
  const filteredImages = treatmentImages?.filter(image => 
    image.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (patientError) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-red-600 mb-4">Error</h1>
            <p className="text-neutral-600 mb-6">
              Hubo un problema al cargar los datos del paciente: {(patientError as Error).message}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
              <Button onClick={() => navigate("/admin/patients")}>
                Volver a la lista de pacientes
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-3 bg-white rounded-full shadow-sm border border-neutral-200"
              onClick={() => navigate("/admin/patients")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              {isLoadingPatient ? (
                <>
                  <Skeleton className="h-8 w-48 mb-1" />
                  <Skeleton className="h-5 w-36" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-neutral-900">{patient?.user.fullName}</h1>
                  <p className="text-neutral-600">
                    Paciente desde: {patient?.since ? format(new Date(patient.since), "MMMM yyyy", { locale: es }) : 'No disponible'}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  <span>Editar Perfil</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Editar Paciente</DialogTitle>
                  <DialogDescription>
                    Modifica los datos del paciente en el formulario a continuación.
                  </DialogDescription>
                </DialogHeader>
                {patient && (
                  <PatientForm 
                    patient={patient} 
                    onSuccess={() => setEditDialogOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Programar Cita</span>
            </Button>
          </div>
        </div>
        
        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Personal Information */}
          <Card className="bg-white border-neutral-100">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Información Personal</h2>
              
              {isLoadingPatient ? (
                <>
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={patient?.user.profileImage} alt={patient?.user.fullName} />
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                        {getInitials(patient?.user.fullName || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-neutral-500" />
                          <p className="text-sm font-medium text-neutral-900">{patient?.user.phone || "No registrado"}</p>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-neutral-500" />
                          <p className="text-sm font-medium text-neutral-900">{patient?.user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-neutral-600">Fecha de nacimiento</p>
                      <p className="text-sm font-medium text-neutral-900">{patient?.dateOfBirth || "No registrada"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Género</p>
                      <p className="text-sm font-medium text-neutral-900">{patient?.gender || "No registrado"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Ocupación</p>
                      <p className="text-sm font-medium text-neutral-900">{patient?.occupation || "No registrada"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Seguro</p>
                      <p className="text-sm font-medium text-neutral-900">{patient?.insurance || "No registrado"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-sm text-neutral-600">Dirección</p>
                    <p className="text-sm font-medium text-neutral-900">{patient?.address || "No registrada"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Medical Information */}
          <Card className="bg-white border-neutral-100">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Información Médica</h2>
              
              {isLoadingPatient ? (
                <>
                  <div className="mb-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 flex items-center">
                      <Heart className="h-4 w-4 mr-1 text-red-500" />
                      Alergias
                    </p>
                    {patient?.allergies && patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 mt-1">No se han registrado alergias</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-yellow-500" />
                      Condiciones Médicas
                    </p>
                    {patient?.medicalConditions && patient.medicalConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {patient.medicalConditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 mt-1">No se han registrado condiciones médicas</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 flex items-center">
                      <Pill className="h-4 w-4 mr-1 text-blue-500" />
                      Medicación Actual
                    </p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">
                      {patient?.currentMedication || "No se ha registrado medicación"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-600 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-neutral-500" />
                      Notas Médicas
                    </p>
                    <p className="text-sm text-neutral-700 mt-1">
                      {patient?.medicalNotes || "No hay notas médicas registradas"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Treatment Summary */}
          <Card className="bg-white border-neutral-100">
            <CardContent className="p-5">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Resumen de Tratamientos</h2>
              
              {isLoadingTreatments ? (
                <>
                  <div className="mb-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-2.5 w-full rounded-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  
                  <div className="mb-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 rounded-full mr-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-28 ml-7 mt-1" />
                  </div>
                  
                  <div>
                    <Skeleton className="h-4 w-40 mb-3" />
                    <div className="space-y-3">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-start">
                          <Skeleton className="h-5 w-5 rounded-full mr-3 mt-0.5" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24 mb-1" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : currentTreatment ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600">Tratamiento Actual</p>
                    <p className="text-sm font-medium text-neutral-900 mt-1">{currentTreatment.name}</p>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-500 h-2.5 rounded-full" 
                        style={{ width: `${currentTreatment.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Progreso: {currentTreatment.progress}% completado
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-neutral-600">Próxima Cita</p>
                    {nextAppointment ? (
                      <>
                        <div className="flex items-center mt-1">
                          <Calendar className="text-primary-500 mr-1 h-4 w-4" />
                          <p className="text-sm font-medium text-neutral-900">
                            {format(new Date(nextAppointment.date), "d 'de' MMMM, HH:mm", { locale: es })}
                          </p>
                        </div>
                        <p className="text-xs text-neutral-500 ml-5">
                          {nextAppointment.staffName} - {nextAppointment.location}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-neutral-500 mt-1">No hay citas programadas</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-600 mb-2">Historial de Tratamientos</p>
                    <ul className="space-y-3">
                      {treatments
                        .filter(t => t.status === 'completed')
                        .slice(0, 3)
                        .map(treatment => (
                          <li key={treatment.id} className="flex items-start">
                            <div className="mt-1 bg-green-100 p-1 rounded-full text-green-800">
                              <Check className="h-3 w-3" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-neutral-900">{treatment.name}</p>
                              <p className="text-xs text-neutral-500">
                                Completado: {treatment.endDate ? format(new Date(treatment.endDate), "dd/MM/yyyy", { locale: es }) : 'Fecha no registrada'}
                              </p>
                            </div>
                          </li>
                        ))}
                      
                      {treatments.filter(t => t.status === 'completed').length === 0 && (
                        <li className="text-sm text-neutral-500">No hay tratamientos completados</li>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-500 mb-4">No hay tratamientos activos</p>
                  <Button>Iniciar nuevo tratamiento</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for Treatment Images, Notes, History */}
        <Card className="bg-white border-neutral-100 mb-6">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-neutral-200">
                <TabsList className="px-6 h-14">
                  <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500">
                    Visión General
                  </TabsTrigger>
                  <TabsTrigger value="images" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500">
                    Imágenes de Tratamiento
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500">
                    Notas Clínicas
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500">
                    Historial de Citas
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Overview Tab Content */}
              <TabsContent value="overview" className="px-6 py-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Treatment */}
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">Tratamiento Actual</h3>
                    {isLoadingTreatments ? (
                      <Card>
                        <CardContent className="p-4">
                          <Skeleton className="h-6 w-40 mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-3 w-16 mb-4" />
                          <Skeleton className="h-5 w-40 mb-3" />
                          <div className="space-y-3">
                            {Array(3).fill(0).map((_, i) => (
                              <div key={i} className="flex">
                                <Skeleton className="h-5 w-5 rounded-full mr-3" />
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-28 mb-1" />
                                  <Skeleton className="h-3 w-20 mb-1" />
                                  <Skeleton className="h-3 w-full" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : currentTreatment ? (
                      <Card>
                        <CardContent className="p-4">
                          <TreatmentProgress
                            treatmentName={currentTreatment.name}
                            description={currentTreatment.description}
                            progress={currentTreatment.progress}
                            status={currentTreatment.status}
                            steps={currentTreatment.steps}
                            nextAppointmentDate={nextAppointment?.date}
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-neutral-500 mb-4">No hay tratamientos activos</p>
                          <Button>Iniciar nuevo tratamiento</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Recent Appointments */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-neutral-900">Próximas Citas</h3>
                      <Button variant="ghost" size="sm" className="h-8 flex items-center gap-2 text-primary-600">
                        <Calendar className="h-4 w-4" />
                        <span>Programar Cita</span>
                      </Button>
                    </div>
                    
                    {isLoadingAppointments ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <div className="flex">
                                <Skeleton className="h-10 w-10 rounded-full mr-4" />
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                  </div>
                                  <div className="space-y-1">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-4 w-24" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : appointments && appointments.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4 pr-4">
                          {appointments
                            .filter(app => new Date(app.date) >= new Date())
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map(appointment => (
                              <Card key={appointment.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start">
                                    <div className="p-2 mr-4 bg-primary-100 text-primary-600 rounded-full">
                                      <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium">
                                          {format(new Date(appointment.date), "EEEE, d 'de' MMMM", { locale: es })}
                                          <span className="font-bold ml-1">
                                            {format(new Date(appointment.date), "HH:mm", { locale: es })}
                                          </span>
                                        </p>
                                        <Badge 
                                          variant="outline"
                                          className={
                                            appointment.status === 'confirmed' 
                                              ? 'bg-green-100 text-green-800 border-green-200 ml-2' 
                                              : 'bg-yellow-100 text-yellow-800 border-yellow-200 ml-2'
                                          }
                                        >
                                          {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                        </Badge>
                                      </div>
                                      
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center text-sm">
                                          <User className="h-4 w-4 mr-1 text-neutral-500" />
                                          <span>{appointment.staffName}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                          <FileText className="h-4 w-4 mr-1 text-neutral-500" />
                                          <span>{appointment.treatmentName}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                          <MapPin className="h-4 w-4 mr-1 text-neutral-500" />
                                          <span>{appointment.location}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            
                          {appointments.filter(app => new Date(app.date) >= new Date()).length === 0 && (
                            <div className="text-center py-6">
                              <p className="text-neutral-500 mb-4">No hay citas programadas</p>
                              <Button>Programar nueva cita</Button>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-500 mb-4">No hay citas registradas</p>
                        <Button>Programar primera cita</Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Treatment Images Tab Content */}
              <TabsContent value="images" className="px-6 py-5">
                <div className="flex flex-wrap justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-neutral-900">Imágenes de Tratamiento</h3>
                  <div className="flex items-center mt-2 sm:mt-0">
                    <div className="relative mr-3">
                      <Input
                        type="text"
                        placeholder="Buscar imágenes..."
                        className="w-44 text-sm pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="h-4 w-4 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    </div>
                    
                    <ImageUpload
                      patientId={Number(id)}
                      treatmentId={currentTreatment?.id}
                    />
                  </div>
                </div>
                
                {isLoadingTreatments || isLoadingImages ? (
                  <div className="space-y-8">
                    {/* Skeleton for Before/After comparison */}
                    <div>
                      <Skeleton className="h-5 w-48 mb-3" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border border-neutral-200 rounded-lg overflow-hidden">
                          <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="p-3">
                            <Skeleton className="w-full h-48 rounded" />
                          </div>
                        </div>
                        <div className="border border-neutral-200 rounded-lg overflow-hidden">
                          <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="p-3">
                            <Skeleton className="w-full h-48 rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Skeleton for image gallery */}
                    <div>
                      <Skeleton className="h-5 w-32 mb-3" />
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array(10).fill(0).map((_, i) => (
                          <div key={i} className="border border-neutral-200 rounded-lg overflow-hidden">
                            <Skeleton className="w-full h-28" />
                            <div className="px-2 py-1">
                              <Skeleton className="h-3 w-20 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : filteredImages && filteredImages.length > 0 ? (
                  <div className="space-y-8">
                    {/* Before/After comparison if available */}
                    {(() => {
                      const beforeImage = filteredImages.find(img => img.type === 'before');
                      const afterImage = filteredImages.find(img => img.type === 'after');
                      
                      if (beforeImage && afterImage) {
                        return (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-neutral-600 mb-3">
                              {currentTreatment?.name || 'Tratamiento'} - Comparativa
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                                  <span className="text-xs font-medium text-neutral-700">Antes del tratamiento</span>
                                  <span className="text-xs text-neutral-500">
                                    {format(new Date(beforeImage.uploadedAt), "dd/MM/yyyy", { locale: es })}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <img 
                                    src={`/api/uploads/${beforeImage.filename}`} 
                                    alt="Foto dental antes del tratamiento" 
                                    className="w-full h-48 object-cover rounded"
                                  />
                                </div>
                              </div>
                              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                                <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                                  <span className="text-xs font-medium text-neutral-700">Después del tratamiento</span>
                                  <span className="text-xs text-neutral-500">
                                    {format(new Date(afterImage.uploadedAt), "dd/MM/yyyy", { locale: es })}
                                  </span>
                                </div>
                                <div className="p-3">
                                  <img 
                                    src={`/api/uploads/${afterImage.filename}`} 
                                    alt="Foto dental después del tratamiento" 
                                    className="w-full h-48 object-cover rounded"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Image Gallery */}
                    <div>
                      <h4 className="text-sm font-medium text-neutral-600 mb-3">Todas las Imágenes</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredImages.map(image => (
                          <div key={image.id} className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                            <img 
                              src={`/api/uploads/${image.filename}`} 
                              alt={image.title} 
                              className="w-full h-28 object-cover"
                            />
                            <div className="px-2 py-1 bg-white">
                              <p className="text-xs text-neutral-900 truncate">{image.title}</p>
                              <p className="text-xs text-neutral-500">
                                {format(new Date(image.uploadedAt), "dd/MM/yyyy", { locale: es })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 mb-4">No hay imágenes disponibles para este paciente</p>
                    <ImageUpload
                      patientId={Number(id)}
                      treatmentId={currentTreatment?.id}
                    />
                  </div>
                )}
              </TabsContent>
              
              {/* Notes Tab Content */}
              <TabsContent value="notes" className="px-6 py-5">
                <div className="text-center py-12">
                  <p className="text-neutral-500 mb-4">Funcionalidad en desarrollo</p>
                </div>
              </TabsContent>
              
              {/* Appointment History Tab Content */}
              <TabsContent value="history" className="px-6 py-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-900">Historial de Citas</h3>
                  <Button variant="outline" size="sm" className="h-8">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Ver Calendario</span>
                  </Button>
                </div>
                
                {isLoadingAppointments ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex">
                            <Skeleton className="h-10 w-10 rounded-full mr-4" />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                              </div>
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(appointment => (
                        <Card key={appointment.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className="p-2 mr-4 bg-primary-100 text-primary-600 rounded-full">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">
                                    {format(new Date(appointment.date), "EEEE, d 'de' MMMM yyyy", { locale: es })}
                                    <span className="font-bold ml-1">
                                      {format(new Date(appointment.date), "HH:mm", { locale: es })}
                                    </span>
                                  </p>
                                  <Badge 
                                    variant="outline"
                                    className={`ml-2 ${
                                      appointment.status === 'completed' 
                                        ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                        : appointment.status === 'confirmed' 
                                          ? 'bg-green-100 text-green-800 border-green-200'
                                          : appointment.status === 'cancelled'
                                            ? 'bg-red-100 text-red-800 border-red-200'
                                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    }`}
                                  >
                                    {appointment.status === 'completed' 
                                      ? 'Completada' 
                                      : appointment.status === 'confirmed' 
                                        ? 'Confirmada'
                                        : appointment.status === 'cancelled'
                                          ? 'Cancelada'
                                          : 'Pendiente'
                                    }
                                  </Badge>
                                </div>
                                
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center text-sm">
                                    <User className="h-4 w-4 mr-1 text-neutral-500" />
                                    <span>{appointment.staffName}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <FileText className="h-4 w-4 mr-1 text-neutral-500" />
                                    <span>{appointment.treatmentName}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-1 text-neutral-500" />
                                    <span>{appointment.location}</span>
                                  </div>
                                </div>
                                
                                {appointment.notes && (
                                  <div className="mt-2 p-2 bg-neutral-50 rounded-md text-sm">
                                    <p className="text-neutral-600">{appointment.notes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar cita</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 mb-4">No hay citas registradas para este paciente</p>
                    <Button>Programar primera cita</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PatientDetail;
