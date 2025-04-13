import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PatientForm from "@/components/admin/patient-form";
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
  insurance?: string;
  allergies?: string[];
  medicalConditions?: string[];
  treatmentCount?: number;
  nextAppointment?: Date;
  lastVisit?: Date;
}

const AdminPatients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Fetch patients data
  const { 
    data: patients, 
    isLoading,
    error 
  } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  // Filter patients based on search term
  const filteredPatients = patients?.filter(patient => {
    const user = patient.user || {};
    return (
      (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.phone?.includes(searchTerm) || false)
    );
  });

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Pacientes</h1>
            <p className="text-neutral-600">Gestiona los pacientes de la clínica</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary-500 hover:bg-primary-600">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Nuevo Paciente</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Paciente</DialogTitle>
                  <DialogDescription>
                    Introduce los datos del nuevo paciente en el formulario a continuación.
                  </DialogDescription>
                </DialogHeader>
                <PatientForm 
                  onSuccess={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              {filteredPatients ? `${filteredPatients.length} pacientes en total` : 'Cargando...'}
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Seguro Médico</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Visitas</TableHead>
                      <TableHead>Próxima Cita</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 rounded-full inline-block" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">Error al cargar pacientes: {(error as Error).message}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            ) : filteredPatients && filteredPatients.length > 0 ? (
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>Paciente</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Seguro Médico</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tratamientos</TableHead>
                      <TableHead>Próxima Cita</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={patient.user?.profileImage} 
                                alt={patient.user?.fullName || 'Patient'} 
                              />
                              <AvatarFallback className="bg-primary-100 text-primary-700">
                                {getInitials(patient.user?.fullName || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{patient.user?.fullName || 'Nombre no disponible'}</div>
                              <div className="text-xs text-muted-foreground">
                                {patient.dateOfBirth && `${patient.gender}, ${patient.dateOfBirth}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span>{patient.user?.phone || 'No registrado'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span>{patient.user?.email || 'No registrado'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.insurance || 'No registrado'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                            Activo
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {patient.treatmentCount || 0}
                        </TableCell>
                        <TableCell>
                          {patient.nextAppointment ? (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span>
                                {format(new Date(patient.nextAppointment), "d MMM, HH:mm", { locale: es })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No programada</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/admin/patients/${patient.id}`}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Ver detalles</span>
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Programar cita</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No hay pacientes que coincidan con tu búsqueda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPatients;
