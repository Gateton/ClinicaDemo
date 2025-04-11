import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentForm from "@/components/admin/appointment-form";

import { format, addDays, isToday, startOfWeek, addWeeks, eachDayOfInterval, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: number;
  date: Date;
  patientId: number;
  patientName: string;
  staffId: number;
  staffName: string;
  treatmentName: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  duration: number;
  location: string;
}

const AdminAppointments = () => {
  const [createAppointmentOpen, setCreateAppointmentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Fetch appointments
  const { 
    data: appointments,
    isLoading,
    error,
  } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  // Filter appointments based on search term and selected date
  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch = searchTerm === "" || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.treatmentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter based on selected view
    let matchesDate = false;
    const appointmentDate = new Date(appointment.date);
    
    if (view === 'day') {
      matchesDate = isSameDay(appointmentDate, selectedDate);
    } else if (view === 'week') {
      const weekEnd = addDays(currentWeekStart, 6);
      matchesDate = appointmentDate >= currentWeekStart && appointmentDate <= weekEnd;
    } else if (view === 'month') {
      matchesDate = appointmentDate.getMonth() === selectedDate.getMonth() && 
                    appointmentDate.getFullYear() === selectedDate.getFullYear();
    }
    
    return matchesSearch && matchesDate;
  });

  // Helper function to get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments?.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    ).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Handle previous week navigation
  const goToPreviousWeek = () => {
    if (view === 'week') {
      setCurrentWeekStart(addWeeks(currentWeekStart, -1));
    } else if (view === 'day') {
      setSelectedDate(addDays(selectedDate, -1));
    } else if (view === 'month') {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setSelectedDate(newDate);
    }
  };

  // Handle next week navigation
  const goToNextWeek = () => {
    if (view === 'week') {
      setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    } else if (view === 'day') {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (view === 'month') {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setSelectedDate(newDate);
    }
  };

  // Generate days for the week view
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: addDays(currentWeekStart, 6)
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Citas</h1>
            <p className="text-neutral-600">Gestiona las citas de la clínica</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={createAppointmentOpen} onOpenChange={setCreateAppointmentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary-500 hover:bg-primary-600">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Nueva Cita</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Programar Nueva Cita</DialogTitle>
                  <DialogDescription>
                    Completa el formulario para programar una nueva cita
                  </DialogDescription>
                </DialogHeader>
                <AppointmentForm 
                  onSuccess={() => setCreateAppointmentOpen(false)}
                  defaultDate={selectedDate}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar / Date Picker */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Calendario</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="border-0"
                locale={es}
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
          
          {/* Appointments View */}
          <Card className="lg:col-span-3">
            <CardHeader className="px-6 pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <CardTitle className="text-lg">
                  {view === 'day' 
                    ? `Citas del ${format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}` 
                    : view === 'week'
                      ? `Semana del ${format(currentWeekStart, "d 'de' MMMM", { locale: es })}`
                      : `${format(selectedDate, "MMMM yyyy", { locale: es })}`
                  }
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPreviousWeek}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => {
                      setSelectedDate(new Date());
                      setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
                    }}
                  >
                    Hoy
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between mt-4 space-y-3 md:space-y-0">
                <Tabs defaultValue="day" value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
                  <TabsList>
                    <TabsTrigger value="day">Día</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mes</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar citas..."
                      className="pl-8 h-9 w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-9 w-[150px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="confirmed">Confirmadas</SelectItem>
                      <SelectItem value="scheduled">Pendientes</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                      <SelectItem value="completed">Completadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">Error al cargar citas: {(error as Error).message}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reintentar
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {view === 'day' && (
                    <div className="space-y-4">
                      {filteredAppointments && filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appointment => (
                          <div 
                            key={appointment.id} 
                            className="flex p-4 border rounded-md hover:bg-neutral-50 transition-colors"
                          >
                            <div className="w-16 flex-shrink-0 text-center">
                              <div className="text-lg font-semibold">
                                {format(new Date(appointment.date), "HH:mm", { locale: es })}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {appointment.duration} min
                              </div>
                            </div>
                            
                            <div className="ml-4 flex-grow">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{appointment.patientName}</div>
                                  <div className="text-sm text-neutral-500">{appointment.treatmentName}</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium 
                                  ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                    appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                    'bg-blue-100 text-blue-800'}`}
                                >
                                  {appointment.status === 'confirmed' ? 'Confirmada' : 
                                    appointment.status === 'scheduled' ? 'Pendiente' : 
                                    appointment.status === 'cancelled' ? 'Cancelada' : 
                                    'Completada'}
                                </div>
                              </div>
                              
                              <div className="mt-2 flex items-center space-x-4 text-sm">
                                <div className="flex items-center text-neutral-500">
                                  <CalendarIcon className="mr-1 h-3 w-3" />
                                  <span>{appointment.staffName}</span>
                                </div>
                                <div className="text-neutral-500">
                                  {appointment.location}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-neutral-500 mb-4">No hay citas programadas para este día</p>
                          <Button onClick={() => setCreateAppointmentOpen(true)}>
                            Programar cita
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {view === 'week' && (
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {weekDays.map((day) => (
                        <div key={format(day, 'yyyy-MM-dd')} className="border rounded-md">
                          <div className={`p-2 text-center border-b ${
                            isToday(day) ? 'bg-primary-50 text-primary-600' : ''
                          }`}>
                            <div className="text-xs uppercase font-medium">
                              {format(day, 'EEEE', { locale: es })}
                            </div>
                            <div className={`text-xl ${isToday(day) ? 'font-bold' : ''}`}>
                              {format(day, 'd', { locale: es })}
                            </div>
                          </div>
                          <div className="p-2 h-[300px] overflow-y-auto">
                            {getAppointmentsForDate(day)?.map(appointment => (
                              <div 
                                key={appointment.id} 
                                className={`p-2 mb-2 text-xs rounded border-l-4 ${
                                  appointment.status === 'confirmed' ? 'border-l-green-500 bg-green-50' : 
                                  appointment.status === 'scheduled' ? 'border-l-yellow-500 bg-yellow-50' : 
                                  appointment.status === 'cancelled' ? 'border-l-red-500 bg-red-50' : 
                                  'border-l-blue-500 bg-blue-50'
                                }`}
                              >
                                <div className="font-medium">
                                  {format(new Date(appointment.date), "HH:mm", { locale: es })}
                                </div>
                                <div className="truncate font-medium">
                                  {appointment.patientName}
                                </div>
                                <div className="truncate text-neutral-500">
                                  {appointment.treatmentName}
                                </div>
                              </div>
                            ))}
                            
                            {(!getAppointmentsForDate(day) || getAppointmentsForDate(day)?.length === 0) && (
                              <div className="h-full flex items-center justify-center text-sm text-neutral-400">
                                <div className="text-center">
                                  <div>Sin citas</div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => {
                                      setSelectedDate(day);
                                      setCreateAppointmentOpen(true);
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Añadir
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {view === 'month' && (
                    <div className="text-center py-12">
                      <p className="text-neutral-500 mb-4">Vista de mes está en desarrollo</p>
                      <p className="text-sm text-neutral-400 mb-4">Por favor, utiliza la vista de día o semana</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointments;
