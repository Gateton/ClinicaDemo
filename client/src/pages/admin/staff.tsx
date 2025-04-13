import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  UserCog,
  Phone,
  Mail,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StaffForm from "@/components/admin/staff-form";

interface Staff {
  id: number;
  userId: number;
  user: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profileImage?: string;
  };
  position: string;
  specialty?: string;
  licenseNumber?: string;
  createdAt: string;
  appointmentCount?: number;
  patientCount?: number;
}

const AdminStaff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const { toast } = useToast();
  
  // Fetch staff data
  const { 
    data: staffMembers, 
    isLoading,
    error 
  } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Personal eliminado",
        description: "El miembro del personal ha sido eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter staff based on search term
  const filteredStaff = staffMembers?.filter(staff => 
    staff?.user?.fullName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    staff?.user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    staff?.position?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    (staff?.specialty && staff.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (staff?.user?.phone && staff.user.phone.includes(searchTerm))
  );

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Helper function to get role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'staff':
        return 'Personal';
      default:
        return role;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Personal</h1>
            <p className="text-neutral-600">Gestiona el personal de la clínica dental</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary-500 hover:bg-primary-600">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Añadir Personal</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Personal</DialogTitle>
                  <DialogDescription>
                    Introduce los datos del nuevo miembro del personal en el formulario a continuación.
                  </DialogDescription>
                </DialogHeader>
                <StaffForm 
                  onSuccess={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Equipo Médico</CardTitle>
            <CardDescription>
              {filteredStaff ? `${filteredStaff.length} miembros del personal en total` : 'Cargando...'}
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar personal..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary-100 to-primary-50"></div>
                    <CardContent className="-mt-12 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        <Skeleton className="h-24 w-24 rounded-full border-4 border-white" />
                      </div>
                      <div className="pt-16 text-center">
                        <Skeleton className="h-6 w-32 mx-auto mb-1" />
                        <Skeleton className="h-4 w-24 mx-auto mb-3" />
                        <div className="flex justify-center gap-2 mb-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">Error al cargar el personal: {(error as Error).message}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            ) : filteredStaff && filteredStaff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((staff) => (
                  <Card key={staff.id} className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary-100 to-primary-50"></div>
                    <CardContent className="-mt-12 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        <Avatar className="h-24 w-24 border-4 border-white">
                          {staff?.user?.profileImage ? (
                            <AvatarImage src={staff.user.profileImage} alt={staff?.user?.fullName || 'Staff member'} />
                          ) : null}
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                            {staff?.user?.fullName ? getInitials(staff.user.fullName) : 'SM'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="pt-16 text-center">
                        <h3 className="text-xl font-semibold">
                          {staff?.user?.fullName || 'Nombre no disponible'}
                        </h3>
                        <p className="text-muted-foreground mb-3">
                          {staff?.position || 'Posición no disponible'}
                        </p>
                        <div className="flex justify-center gap-2 mb-4">
                          <Badge variant="outline" className={staff?.user?.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                            {staff?.user?.role ? getRoleLabel(staff.user.role) : 'Rol no disponible'}
                          </Badge>
                          {staff?.specialty && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              {staff.specialty}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-neutral-600 space-y-2">
                          <div className="flex items-center justify-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{staff?.user?.email || 'Email no disponible'}</span>
                          </div>
                          {staff?.user?.phone && (
                            <div className="flex items-center justify-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{staff.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Ver Agenda</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedStaff(staff);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("¿Estás seguro de que deseas eliminar a este miembro del personal?")) {
                                deleteStaffMutation.mutate(staff.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No hay personal que coincida con tu búsqueda.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Staff Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Personal</DialogTitle>
              <DialogDescription>
                Modifica los datos del miembro del personal en el formulario a continuación.
              </DialogDescription>
            </DialogHeader>
            {selectedStaff && (
              <StaffForm 
                staff={selectedStaff}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setSelectedStaff(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminStaff;
