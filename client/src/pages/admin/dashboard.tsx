import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle2,
  PlusCircle,
  UserPlus,
  MoreVertical,
  Edit
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface StatsCard {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

interface Appointment {
  id: number;
  date: Date;
  patientName: string;
  patientPhone: string;
  patientInitials: string;
  treatment: string;
  doctor: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

interface Activity {
  id: number;
  description: string;
  time: string;
  iconBg: string;
  icon: React.ReactNode;
}

interface Patient {
  id: number;
  name: string;
  treatment: string;
  avatar?: string;
  nextAppointment: Date | null;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsCard[]>([]);
  
  // Fetch appointments
  const { 
    data: appointments,
    isLoading: isLoadingAppointments,
  } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    select: (data) => {
      // Sort by date
      return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  // Fetch patients
  const { 
    data: patients,
    isLoading: isLoadingPatients,
  } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
    select: (data) => {
      // Sort by next appointment
      return [...data].sort((a, b) => {
        if (!a.nextAppointment) return 1;
        if (!b.nextAppointment) return -1;
        return new Date(a.nextAppointment).getTime() - new Date(b.nextAppointment).getTime();
      }).slice(0, 4); // Only take the first 4
    }
  });

  // Mock recent activities (this would normally come from an API)
  const recentActivities: Activity[] = [
    {
      id: 1,
      description: <><span className="font-medium">Dra. Carmen Rodríguez</span> completó el tratamiento de <span className="font-medium">Juan López</span></>,
      time: "Hace 10 minutos",
      iconBg: "bg-primary-500",
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    {
      id: 2,
      description: <><span className="font-medium">Ana Pérez</span> ha confirmado su cita para el <span className="font-medium">blanqueamiento dental</span></>,
      time: "Hace 25 minutos",
      iconBg: "bg-secondary-500",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: 3,
      description: <><span className="font-medium">Laura Jiménez</span> se ha registrado como nueva paciente</>,
      time: "Hace 45 minutos",
      iconBg: "bg-accent-500",
      icon: <UserPlus className="h-4 w-4" />
    },
    {
      id: 4,
      description: <><span className="font-medium">Dr. Miguel Torres</span> ha subido nuevas imágenes del tratamiento de <span className="font-medium">Carlos Martínez</span></>,
      time: "Hace 1 hora",
      iconBg: "bg-primary-500",
      icon: <PlusCircle className="h-4 w-4" />
    }
  ];

  // Initialize stats
  useEffect(() => {
    if (appointments) {
      // Count today's appointments
      const today = new Date().setHours(0, 0, 0, 0);
      const todayAppointments = appointments.filter(
        app => new Date(app.date).setHours(0, 0, 0, 0) === today
      ).length;

      // Create stats cards
      setStats([
        {
          title: "Citas para hoy",
          value: todayAppointments,
          change: 2,
          icon: <Calendar className="h-4 w-4" />,
          iconBg: "bg-primary-100",
          iconColor: "text-primary-700"
        },
        {
          title: "Pacientes activos",
          value: patients?.length || 0,
          change: 14,
          icon: <Users className="h-4 w-4" />,
          iconBg: "bg-secondary-100",
          iconColor: "text-secondary-700"
        },
        {
          title: "Tratamientos en curso",
          value: 64,
          change: -3,
          icon: <LayoutDashboard className="h-4 w-4" />,
          iconBg: "bg-accent-100",
          iconColor: "text-accent-500"
        },
        {
          title: "Tratamientos finalizados",
          value: 8,
          change: 2,
          icon: <CheckCircle2 className="h-4 w-4" />,
          iconBg: "bg-success bg-opacity-10",
          iconColor: "text-success"
        }
      ]);
    }
  }, [appointments, patients]);

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Helper to format appointment status
  const formatAppointmentStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmada</span>;
      case 'scheduled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelada</span>;
      case 'completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Completada</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600">Bienvenido al panel de administración de Clínica Delica</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link href="/admin/appointments">
              <Button className="bg-primary-500 hover:bg-primary-600">
                <PlusCircle className="h-4 w-4 mr-1" />
                <span>Nueva Cita</span>
              </Button>
            </Link>
            <Link href="/admin/patients">
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-1" />
                <span>Nuevo Paciente</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.length > 0 ? (
            stats.map((stat, index) => (
              <Card key={index} className="bg-white border-neutral-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-neutral-500 text-sm font-medium">{stat.title}</h3>
                    <span className={`${stat.iconBg} ${stat.iconColor} p-1 rounded-full`}>
                      {stat.icon}
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    <span className={`${stat.change >= 0 ? 'text-success' : 'text-error'} font-medium`}>
                      {stat.change >= 0 ? '+' : ''}{stat.change}
                    </span> {stat.change >= 0 ? 'más' : 'menos'} que ayer
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            // Skeleton loading state
            Array(4).fill(0).map((_, index) => (
              <Card key={index} className="bg-white border-neutral-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Today's Appointments */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Citas de hoy</h2>
            <Link href="/admin/appointments">
              <a className="text-primary-600 text-sm hover:underline flex items-center">
                Ver todas
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </Link>
          </div>
          
          <Card className="bg-white rounded-lg overflow-hidden border border-neutral-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Hora</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Paciente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tratamiento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Doctor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {isLoadingAppointments ? (
                    // Loading skeletons
                    Array(3).fill(0).map((_, index) => (
                      <tr key={`skeleton-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="ml-3">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-28" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : appointments && appointments.length > 0 ? (
                    appointments
                      .filter(appointment => {
                        const today = new Date();
                        const appointmentDate = new Date(appointment.date);
                        return (
                          appointmentDate.getDate() === today.getDate() &&
                          appointmentDate.getMonth() === today.getMonth() &&
                          appointmentDate.getFullYear() === today.getFullYear()
                        );
                      })
                      .map(appointment => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">
                            {format(new Date(appointment.date), "HH:mm", { locale: es })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                                <span>{getInitials(appointment.patientName)}</span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-neutral-900">{appointment.patientName}</div>
                                <div className="text-xs text-neutral-500">{appointment.patientPhone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{appointment.treatment}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{appointment.doctor}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatAppointmentStatus(appointment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-3">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-neutral-400 hover:text-neutral-600">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay citas programadas para hoy
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        {/* Recent Activities + Recent Patients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Actividad Reciente</h2>
              <button className="text-neutral-400 hover:text-neutral-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            
            <Card className="bg-white rounded-lg shadow-sm p-4 border border-neutral-100">
              <div className="flow-root">
                <ul className="-my-4 divide-y divide-neutral-100">
                  {recentActivities.map(activity => (
                    <li key={activity.id} className="py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full ${activity.iconBg} text-white flex items-center justify-center`}>
                            {activity.icon}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm text-neutral-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
          
          {/* Recent Patients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Pacientes Recientes</h2>
              <Link href="/admin/patients">
                <a className="text-primary-600 text-sm hover:underline flex items-center">
                  Ver todos
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </Link>
            </div>
            
            <Card className="bg-white rounded-lg shadow-sm border border-neutral-100">
              <ul className="divide-y divide-neutral-100">
                {isLoadingPatients ? (
                  // Loading skeletons
                  Array(4).fill(0).map((_, index) => (
                    <li key={`skeleton-${index}`} className="px-4 py-3">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3 flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </li>
                  ))
                ) : patients && patients.length > 0 ? (
                  patients.map(patient => (
                    <li key={patient.id}>
                      <Link href={`/admin/patients/${patient.id}`}>
                        <a className="block hover:bg-neutral-50">
                          <div className="flex items-center px-4 py-3">
                            <Avatar>
                              <AvatarImage src={patient.avatar} alt={patient.name} />
                              <AvatarFallback className="bg-primary-100 text-primary-700">{getInitials(patient.name)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-neutral-900">{patient.name}</p>
                              <p className="text-xs text-neutral-500">{patient.treatment}</p>
                            </div>
                            <div className="ml-auto text-right">
                              <p className="text-xs text-neutral-700">Próxima cita</p>
                              <p className="text-xs font-medium text-neutral-900">
                                {patient.nextAppointment
                                  ? format(new Date(patient.nextAppointment), "d MMM, HH:mm", { locale: es })
                                  : 'No programada'}
                              </p>
                            </div>
                          </div>
                        </a>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-center text-sm text-gray-500">
                    No hay pacientes recientes
                  </li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
