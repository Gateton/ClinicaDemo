import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AppointmentsList() {
  const [, setLocation] = useLocation();
  
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });
  
  // Get today's appointments
  const todayAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  }).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }) || [];
  
  // Only show first 3 appointments
  const displayAppointments = todayAppointments.slice(0, 3);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success bg-opacity-10 text-success";
      case "pending":
        return "bg-warning bg-opacity-10 text-warning";
      case "cancelled":
        return "bg-destructive bg-opacity-10 text-destructive";
      case "completed":
        return "bg-neutral-500 bg-opacity-10 text-neutral-500";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return status;
    }
  };
  
  const formatTime = (date: string | Date) => {
    return format(new Date(date), "h:mm a", { locale: es });
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Citas de Hoy</CardTitle>
          <Button
            variant="link"
            onClick={() => setLocation("/appointments")}
            className="text-sm text-primary font-medium p-0"
          >
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {displayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                      {/* Display initials or patient identifier */}
                      PA
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">
                        Paciente #{appointment.patientId}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {appointment.notes || "Sin notas"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {formatTime(appointment.date)}
                    </p>
                    <div className="mt-1 flex items-center justify-end text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
