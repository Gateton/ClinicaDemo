import React, { useState } from 'react';
import PatientLayout from '@/components/layout/patient-layout';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import TreatmentProgress from '@/components/shared/treatment-progress';
import ImageComparison from '@/components/shared/image-comparison';
import AppointmentCard from '@/components/shared/appointment-card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LightbulbIcon, Calendar, Phone, Mail, Clock } from 'lucide-react';

interface Patient {
  id: number;
  userId: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  insurance?: string;
  occupation?: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedication?: string;
  medicalNotes?: string;
}

interface Treatment {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  staffName: string;
  steps: {
    id: number;
    name: string;
    description: string;
    status: 'pending' | 'completed';
    date: Date | null;
  }[];
}

interface Appointment {
  id: number;
  date: Date;
  staffName: string;
  treatmentName: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

interface TreatmentImage {
  id: number;
  patientTreatmentId: number;
  title: string;
  type: 'before' | 'progress' | 'after';
  uploadedAt: Date;
  url: string;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  
  // Fetch patient data
  const { 
    data: patient, 
    isLoading: isLoadingPatient 
  } = useQuery<Patient>({
    queryKey: ['/api/patients/me'],
    enabled: !!user,
  });

  // Fetch patient treatments
  const { 
    data: treatments, 
    isLoading: isLoadingTreatments 
  } = useQuery<Treatment[]>({
    queryKey: ['/api/patient-treatments/me'],
    enabled: !!patient,
  });

  // Fetch patient appointments
  const { 
    data: appointments, 
    isLoading: isLoadingAppointments 
  } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/me'],
    enabled: !!patient,
  });

  // Fetch treatment images
  const { 
    data: treatmentImages, 
    isLoading: isLoadingImages 
  } = useQuery<TreatmentImage[]>({
    queryKey: ['/api/images/me'],
    enabled: !!treatments && treatments.length > 0,
  });

  // Get current/active treatment
  const currentTreatment = treatments?.find(t => t.status === 'in_progress');
  
  // Get next appointment
  const nextAppointment = appointments?.filter(a => 
    new Date(a.date) > new Date() && 
    (a.status === 'scheduled' || a.status === 'confirmed')
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Get images for comparison
  const getImagesForComparison = () => {
    if (!treatmentImages || !currentTreatment) return {};
    
    const treatmentImgs = treatmentImages.filter(img => 
      img.patientTreatmentId === currentTreatment.id
    );
    
    return {
      beforeImage: treatmentImgs.find(img => img.type === 'before'),
      progressImage: treatmentImgs.find(img => img.type === 'progress'),
      afterImage: treatmentImgs.find(img => img.type === 'after'),
    };
  };

  const { beforeImage, progressImage, afterImage } = getImagesForComparison();

  // Check if next appointment is today
  const isAppointmentToday = nextAppointment ? 
    new Date(nextAppointment.date).toDateString() === new Date().toDateString() : 
    false;

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="md:flex md:space-x-6">
          {/* Main Content */}
          <div className="md:w-2/3">
            {/* Welcome Banner */}
            <div className="bg-primary-600 text-white rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-2/3">
                  <h1 className="font-semibold text-xl">
                    ¡Bienvenido{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
                  </h1>
                  {isLoadingAppointments || !nextAppointment ? (
                    <p className="my-2">Cargando información de tu próxima cita...</p>
                  ) : (
                    <p className="my-2">
                      Tu próxima cita es {isAppointmentToday ? 'hoy' : format(new Date(nextAppointment.date), "EEEE d 'de' MMMM", { locale: es })}, 
                      <span className="font-semibold"> {format(new Date(nextAppointment.date), 'HH:mm', { locale: es })}</span> con 
                      <span className="font-semibold"> {nextAppointment.staffName}</span>.
                    </p>
                  )}
                  {nextAppointment && (
                    <Button 
                      className="mt-3 bg-white text-primary-600 hover:bg-primary-50"
                      onClick={() => setMapDialogOpen(true)}
                    >
                      Ver detalles de mi cita
                    </Button>
                  )}
                </div>
                <div className="mt-4 md:mt-0 md:w-1/3 flex justify-center">
                  <svg
                    className="h-24 text-primary-100"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 2C10.059 2 2 10.059 2 20C2 29.941 10.059 38 20 38C29.941 38 38 29.941 38 20C38 10.059 29.941 2 20 2Z"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M28 14C28 10.686 24.4183 8 20 8C15.5817 8 12 10.686 12 14"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M28 26C28 29.314 24.4183 32 20 32C15.5817 32 12 29.314 12 26"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M28 14V26"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 14V26"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M20 16C21.6569 16 23 17.3431 23 19C23 20.6569 21.6569 22 20 22C18.3431 22 17 20.6569 17 19C17 17.3431 18.3431 16 20 16Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* My Treatment Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {isLoadingTreatments ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <div className="space-y-3 pt-4 mt-4 border-t border-neutral-200">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex">
                          <Skeleton className="h-5 w-5 rounded-full mr-3" />
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : currentTreatment ? (
                <TreatmentProgress
                  treatmentName={currentTreatment.name}
                  description={currentTreatment.description}
                  progress={currentTreatment.progress}
                  status={currentTreatment.status}
                  steps={currentTreatment.steps}
                  nextAppointmentDate={nextAppointment?.date}
                />
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                    No tienes tratamientos activos
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    Actualmente no hay tratamientos activos en tu historial.
                  </p>
                  <Button>Solicitar consulta</Button>
                </div>
              )}
            </div>
            
            {/* Progress Comparison */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {isLoadingImages ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200">
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="p-3">
                        <Skeleton className="w-full h-48 rounded" />
                      </div>
                    </div>
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200">
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="p-3">
                        <Skeleton className="w-full h-48 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <ImageComparison
                  treatmentName={currentTreatment?.name || "Tu Tratamiento"}
                  beforeImage={beforeImage}
                  progressImage={progressImage}
                  afterImage={afterImage}
                />
              )}
              
              <div className="mt-4 text-center">
                <Button variant="ghost" className="text-primary-600 text-sm font-medium hover:text-primary-800">
                  Ver todas mis imágenes
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar Content */}
          <div className="md:w-1/3 mt-6 md:mt-0">
            {/* Next Appointment Card */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Mi Próxima Cita</h2>
              
              {isLoadingAppointments ? (
                <div className="space-y-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <Skeleton className="h-5 w-5 mr-3" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32 mt-2" />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="h-9 flex-1 rounded-md" />
                  </div>
                </div>
              ) : nextAppointment ? (
                <>
                  <AppointmentCard
                    date={new Date(nextAppointment.date)}
                    doctor={nextAppointment.staffName}
                    treatment={nextAppointment.treatmentName}
                    location={nextAppointment.location}
                    status={nextAppointment.status}
                    onReschedule={() => {/* Handler for rescheduling */}}
                    onViewMap={() => setMapDialogOpen(true)}
                    isUpcoming={true}
                  />
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-500 mb-4">No tienes citas programadas</p>
                  <Button variant="outline" className="w-full">
                    Solicitar Cita
                  </Button>
                </div>
              )}
            </div>
            
            {/* Treatment Recommendation */}
            <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recomendaciones</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-1 rounded-full text-primary-600 mr-3">
                    <LightbulbIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Evite alimentos que manchan</p>
                    <p className="text-xs text-neutral-600 mt-1">Para mantener los resultados del blanqueamiento, evite café, té, vino tinto y alimentos con colorantes fuertes durante las primeras 48 horas después de cada sesión.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 p-1 rounded-full text-primary-600 mr-3">
                    <LightbulbIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Use pasta dental especial</p>
                    <p className="text-xs text-neutral-600 mt-1">Le recomendamos usar la pasta dental blanqueadora recomendada para prolongar los efectos del tratamiento.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 p-1 rounded-full text-primary-600 mr-3">
                    <LightbulbIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Cepillado regular</p>
                    <p className="text-xs text-neutral-600 mt-1">Mantenga una buena higiene dental cepillándose tres veces al día y usando hilo dental regularmente.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">¿Necesitas ayuda?</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="text-neutral-500 mr-3 h-4 w-4" />
                  <div>
                    <p className="text-xs text-neutral-500">Teléfono</p>
                    <p className="text-sm font-medium text-neutral-800">+34 912 345 678</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="text-neutral-500 mr-3 h-4 w-4" />
                  <div>
                    <p className="text-xs text-neutral-500">Email</p>
                    <p className="text-sm font-medium text-neutral-800">citas@clinicadelica.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="text-neutral-500 mr-3 h-4 w-4" />
                  <div>
                    <p className="text-xs text-neutral-500">Horario</p>
                    <p className="text-sm font-medium text-neutral-800">Lun-Vie: 9:00-20:00</p>
                    <p className="text-sm font-medium text-neutral-800">Sáb: 9:00-14:00</p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-primary-500 hover:bg-primary-600">
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
