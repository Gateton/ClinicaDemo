import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, isToday, isFuture, isPast, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Plus, Search } from "lucide-react";

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientInitials: string;
  treatmentName: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'pending';
  notes?: string;
}

export default function AdminAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', filter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('filter', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    },
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // The search is already handled by the dependency in the useQuery hook
  };

  const formatAppointmentDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy 'a las' h:mm a", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const formatAppointmentTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "h:mm a", { locale: es });
    } catch {
      return 'Hora no disponible';
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Hoy';
      if (isToday(addDays(date, -1))) return 'Mañana';
      return format(date, "dd MMM yyyy", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmada</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendiente</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completada</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-50 text-neutral-700 border-neutral-200">Programada</Badge>;
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      // Handle edit appointment logic
      setSelectedAppointment(null);
    }
  };

  return (
    <AdminLayout title="Citas" subtitle="Gestiona el calendario de citas para tus pacientes.">
      {/* Filter and actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <Tabs 
            value={filter} 
            onValueChange={(value) => setFilter(value as 'today' | 'upcoming' | 'past' | 'all')}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="today">Hoy</TabsTrigger>
              <TabsTrigger value="upcoming">Próximas</TabsTrigger>
              <TabsTrigger value="past">Pasadas</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <form onSubmit={handleSearch} className="w-full sm:w-auto flex-grow max-w-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Buscar citas..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>

        <Button onClick={() => setIsNewAppointmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Cita
        </Button>
      </div>

      {/* Appointments list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 divide-y divide-neutral-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Tratamiento
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Duración
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                              {appointment.patientInitials}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-neutral-900">{appointment.patientName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{appointment.treatmentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-neutral-400 mr-1" />
                            <span className="text-sm text-neutral-900 mr-2">{formatAppointmentDate(appointment.date)}</span>
                            <Clock className="h-4 w-4 text-neutral-400 mr-1" />
                            <span className="text-sm text-neutral-900">{formatAppointmentTime(appointment.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {appointment.duration} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAppointment(appointment)}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-500">No se encontraron citas para el filtro seleccionado.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsNewAppointmentDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Programar nueva cita
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Programar Nueva Cita</DialogTitle>
          </DialogHeader>
          <AppointmentForm onSuccess={() => setIsNewAppointmentDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* View/Edit Appointment Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles de la Cita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-medium text-primary-700">
                  {selectedAppointment.patientInitials}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">{selectedAppointment.patientName}</h3>
                  <p className="text-sm text-neutral-500">{selectedAppointment.treatmentName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Fecha y Hora</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {formatAppointmentDateTime(selectedAppointment.date)}
                  </p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Duración</p>
                  <p className="text-sm font-medium text-neutral-900">{selectedAppointment.duration} minutos</p>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500">Estado</p>
                <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">Notas</p>
                  <p className="text-sm text-neutral-900">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Cerrar
                </Button>
                <Button onClick={handleEditAppointment}>
                  Editar Cita
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
