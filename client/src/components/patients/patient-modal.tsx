import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, PencilIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PatientModalProps {
  patientId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (patientId: number) => void;
}

interface Patient {
  id: number;
  fullName: string;
  initials: string;
  patientId: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  age: number;
  treatments: string[];
  appointmentCount: number;
  status: 'active' | 'inactive';
  allergies: string;
  currentMedication: string;
  medicalConditions: string;
  notes: string;
  nextAppointment?: {
    id: number;
    date: string;
    treatmentName: string;
    duration: number;
  };
}

export function PatientModal({ patientId, isOpen, onClose, onEdit }: PatientModalProps) {
  const [activeTab, setActiveTab] = useState('information');

  const { data: patient, isLoading } = useQuery<Patient>({
    queryKey: ['/api/patients', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const res = await fetch(`/api/patients/${patientId}`);
      if (!res.ok) throw new Error('Failed to fetch patient');
      return res.json();
    },
    enabled: !!patientId && isOpen,
  });

  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'No disponible';
    }
  };

  const formatAppointmentDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'a las' h:mm a", { locale: es });
    } catch {
      return 'No disponible';
    }
  };

  const handleEdit = () => {
    if (patient && onEdit) {
      onEdit(patient.id);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-neutral-800">Detalles del Paciente</DialogTitle>
        </DialogHeader>

        {isLoading || !patient ? (
          <div className="space-y-4">
            <div className="flex items-start mb-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="ml-4 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24 mt-1" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full mt-1" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Patient Info Header */}
            <div className="flex items-start mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-medium text-primary-700">
                {patient.initials}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-medium text-neutral-900">{patient.fullName}</h3>
                <p className="text-neutral-500">ID: {patient.patientId}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {patient.treatments.map((treatment, index) => (
                    <Badge key={index} variant="outline" className="bg-primary-100 text-primary-800 border-primary-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {treatment}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="bg-neutral-100 text-neutral-800 border-neutral-200">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                    {patient.appointmentCount} Citas
                  </Badge>
                  <Badge variant="outline" className={patient.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Patient Details Tabs */}
            <Tabs defaultValue="information" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 border-b border-neutral-200 w-full justify-start rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="information"
                  className="border-primary-500 data-[state=active]:border-b-2 data-[state=active]:text-primary-600 border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 whitespace-nowrap py-3 px-1 rounded-none bg-transparent"
                >
                  Información
                </TabsTrigger>
                <TabsTrigger
                  value="treatments"
                  className="border-primary-500 data-[state=active]:border-b-2 data-[state=active]:text-primary-600 border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 whitespace-nowrap py-3 px-1 rounded-none bg-transparent"
                >
                  Tratamientos
                </TabsTrigger>
                <TabsTrigger
                  value="images"
                  className="border-primary-500 data-[state=active]:border-b-2 data-[state=active]:text-primary-600 border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 whitespace-nowrap py-3 px-1 rounded-none bg-transparent"
                >
                  Imágenes
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="border-primary-500 data-[state=active]:border-b-2 data-[state=active]:text-primary-600 border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 whitespace-nowrap py-3 px-1 rounded-none bg-transparent"
                >
                  Historial
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="information" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-3">Información Personal</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-neutral-500">Nombre completo</p>
                        <p className="text-sm text-neutral-900">{patient.fullName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Fecha de nacimiento</p>
                        <p className="text-sm text-neutral-900">
                          {formatBirthDate(patient.dateOfBirth)} ({patient.age} años)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Correo electrónico</p>
                        <p className="text-sm text-neutral-900">{patient.email || 'No disponible'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Teléfono</p>
                        <p className="text-sm text-neutral-900">{patient.phone || 'No disponible'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Dirección</p>
                        <p className="text-sm text-neutral-900">{patient.address || 'No disponible'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-3">Historial Médico</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-neutral-500">Alergias</p>
                        <p className="text-sm text-neutral-900">{patient.allergies || 'Ninguna conocida'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Medicación actual</p>
                        <p className="text-sm text-neutral-900">{patient.currentMedication || 'Ninguna'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Condiciones médicas</p>
                        <p className="text-sm text-neutral-900">{patient.medicalConditions || 'Ninguna'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Notas</p>
                        <p className="text-sm text-neutral-900">{patient.notes || 'Sin notas adicionales'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Appointments */}
                {patient.nextAppointment && (
                  <div className="mt-6">
                    <h4 className="font-medium text-neutral-800 mb-3">Próxima Cita</h4>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{patient.nextAppointment.treatmentName}</p>
                          <p className="text-xs text-neutral-500">
                            {formatAppointmentDateTime(patient.nextAppointment.date)} ({patient.nextAppointment.duration} min)
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <PencilIcon className="h-3.5 w-3.5 mr-1" /> Editar
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1" /> Reagendar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="treatments" className="mt-0">
                <p>Información de tratamientos en desarrollo...</p>
              </TabsContent>
              
              <TabsContent value="images" className="mt-0">
                <p>Galería de imágenes en desarrollo...</p>
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <p>Historial de visitas en desarrollo...</p>
              </TabsContent>
            </Tabs>
          </>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleEdit} disabled={isLoading || !patient}>
            Editar Paciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
