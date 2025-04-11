import React, { useState } from 'react';
import PatientLayout from '@/components/layout/patient-layout';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AppointmentCard from '@/components/shared/appointment-card';
import { format, addDays, isSameMonth, isSameDay, isAfter, isBefore, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: number;
  date: Date;
  staffName: string;
  treatmentName: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

const PatientAppointments = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Fetch patient appointments
  const { 
    data: appointments, 
    isLoading, 
    error 
  } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments/me'],
    enabled: !!user,
  });

  // Filter appointments based on selected tab
  const filteredAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    
    if (selectedTab === 'upcoming') {
      return isAfter(appointmentDate, now) && appointment.status !== 'cancelled';
    } else if (selectedTab === 'past') {
      return isBefore(appointmentDate, now) || appointment.status === 'completed';
    } else if (selectedTab === 'cancelled') {
      return appointment.status === 'cancelled';
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return selectedTab === 'past' ? dateB - dateA : dateA - dateB;
  });

  // Check if an appointment is on the selected date
  const isAppointmentOnSelectedDate = (appointment: Appointment) => {
    if (!selectedDate) return false;
    return isSameDay(new Date(appointment.date), selectedDate);
  };

  // Get appointments for the selected date
  const appointmentsOnSelectedDate = appointments?.filter(isAppointmentOnSelectedDate);

  // Handle appointment details view
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsMapDialogOpen(true);
  };

  // Generate date cells for the calendar view based on appointments
  const getAppointmentDates = () => {
    if (!appointments) return [];

    const dates = appointments.map(appointment => {
      const date = new Date(appointment.date);
      return {
        date,
        status: appointment.status,
      };
    });

    return dates;
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Mis Citas</h1>
            <p className="text-neutral-600">Gestiona tus citas en la clínica dental</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="bg-primary-500 hover:bg-primary-600">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Solicitar Cita</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar / Date Picker */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Calendario</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="border-0"
                locale={es}
                modifiers={{
                  booked: getAppointmentDates().map(item => item.date),
                }}
                modifiersStyles={{
                  booked: {
                    fontWeight: 'bold',
                  },
                }}
                components={{
                  DayContent: ({ day }) => {
                    const matchingAppointments = getAppointmentDates().filter(
                      item => isSameDay(item.date, day)
                    );
                    
                    return (
                      <div className="relative h-full w-full p-2 flex items-center justify-center">
                        {day.getDate()}
                        {matchingAppointments.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                            {matchingAppointments.slice(0, 2).map((item, idx) => (
                              <div 
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'confirmed' ? 'bg-green-500' :
                                  item.status === 'scheduled' ? 'bg-yellow-500' :
                                  item.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`}
                              />
                            ))}
                            {matchingAppointments.length > 2 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                }}
              />

              <div className="px-2 mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-neutral-600">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-neutral-600">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-neutral-600">Cancelada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-neutral-600">Completada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Mis Citas</CardTitle>
              <CardDescription>
                {selectedDate ? (
                  `${appointmentsOnSelectedDate?.length || 0} citas para el ${format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}`
                ) : (
                  "Selecciona una fecha para ver tus citas"
                )}
              </CardDescription>
              <Tabs 
                defaultValue="upcoming" 
                value={selectedTab} 
                onValueChange={setSelectedTab}
                className="mt-2"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                  <TabsTrigger value="past">Anteriores</TabsTrigger>
                  <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4 py-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500 mb-2">Error al cargar las citas</p>
                  <p className="text-neutral-600 mb-4">{(error as Error).message}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reintentar
                  </Button>
                </div>
              ) : filteredAppointments?.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-neutral-600 mb-4">
                    {selectedTab === 'upcoming' 
                      ? 'No tienes citas programadas' 
                      : selectedTab === 'past'
                        ? 'No tienes citas pasadas'
                        : 'No tienes citas canceladas'}
                  </p>
                  {selectedTab === 'upcoming' && (
                    <Button>Solicitar una cita</Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {filteredAppointments?.map((appointment) => (
                    <div key={appointment.id}>
                      <AppointmentCard
                        date={new Date(appointment.date)}
                        doctor={appointment.staffName}
                        treatment={appointment.treatmentName}
                        location={appointment.location}
                        status={appointment.status}
                        onReschedule={() => {/* Handler for rescheduling */}}
                        onViewMap={() => handleViewAppointment(appointment)}
                        isUpcoming={selectedTab === 'upcoming' && appointment.status !== 'cancelled'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointment Details Dialog */}
        <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles de la Cita</DialogTitle>
            </DialogHeader>
            
            {selectedAppointment && (
              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Fecha y Hora</h3>
                    <p className="text-lg font-semibold">
                      {format(new Date(selectedAppointment.date), "EEEE, d 'de' MMMM yyyy", { locale: es })}
                    </p>
                    <p className="text-lg font-semibold">
                      {format(new Date(selectedAppointment.date), "HH:mm", { locale: es })}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Doctor</h3>
                    <p className="text-base">{selectedAppointment.staffName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Tratamiento</h3>
                    <p className="text-base">{selectedAppointment.treatmentName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Ubicación</h3>
                    <p className="text-base">{selectedAppointment.location}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Estado</h3>
                    <Badge 
                      className={
                        selectedAppointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : selectedAppointment.status === 'scheduled'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : selectedAppointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                      }
                    >
                      {selectedAppointment.status === 'confirmed' 
                        ? 'Confirmada' 
                        : selectedAppointment.status === 'scheduled'
                          ? 'Pendiente'
                          : selectedAppointment.status === 'cancelled'
                            ? 'Cancelada'
                            : 'Completada'}
                    </Badge>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">Notas</h3>
                      <p className="text-base">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  {isAfter(new Date(selectedAppointment.date), new Date()) && 
                   selectedAppointment.status !== 'cancelled' && (
                    <Button variant="outline" className="flex-1 mr-2">
                      Reprogramar
                    </Button>
                  )}
                  <Button className="flex-1">
                    Ver ubicación
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  );
};

export default PatientAppointments;
