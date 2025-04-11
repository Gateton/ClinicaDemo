import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TreatmentForm from "@/components/admin/treatment-form";

interface Treatment {
  id: number;
  name: string;
  description: string;
  defaultDuration: number;
  createdAt: string;
}

interface PatientTreatment {
  id: number;
  patientId: number;
  treatmentId: number;
  patientName: string;
  treatmentName: string;
  staffName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  endDate?: string;
}

const AdminTreatments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const { toast } = useToast();
  
  // Fetch treatments data
  const { 
    data: treatments, 
    isLoading: isLoadingTreatments,
    error: treatmentsError
  } = useQuery<Treatment[]>({
    queryKey: ['/api/treatments'],
  });

  // Fetch patient treatments data
  const { 
    data: patientTreatments, 
    isLoading: isLoadingPatientTreatments,
    error: patientTreatmentsError
  } = useQuery<PatientTreatment[]>({
    queryKey: ['/api/patient-treatments'],
  });

  // Delete treatment mutation
  const deleteTreatmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/treatments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      toast({
        title: "Tratamiento eliminado",
        description: "El tratamiento ha sido eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar el tratamiento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter treatments based on search term
  const filteredTreatments = treatments?.filter(treatment => 
    treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    treatment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get the count of patients using a treatment
  const getPatientCountForTreatment = (treatmentId: number) => {
    return patientTreatments?.filter(pt => pt.treatmentId === treatmentId).length || 0;
  };

  // Helper function to get active treatments count
  const getActiveTreatmentsCount = (treatmentId: number) => {
    return patientTreatments?.filter(
      pt => pt.treatmentId === treatmentId && 
      (pt.status === 'pending' || pt.status === 'in_progress')
    ).length || 0;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Tratamientos</h1>
            <p className="text-neutral-600">Gestiona los tratamientos ofrecidos por la clínica</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary-500 hover:bg-primary-600">
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Nuevo Tratamiento</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Añadir Nuevo Tratamiento</DialogTitle>
                  <DialogDescription>
                    Introduce los datos del nuevo tratamiento en el formulario a continuación.
                  </DialogDescription>
                </DialogHeader>
                <TreatmentForm 
                  onSuccess={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Catálogo de Tratamientos</CardTitle>
            <CardDescription>
              {filteredTreatments ? `${filteredTreatments.length} tratamientos en total` : 'Cargando...'}
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar tratamiento..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTreatments || isLoadingPatientTreatments ? (
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Pacientes Activos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-8 rounded-full inline-block" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : treatmentsError || patientTreatmentsError ? (
              <div className="p-8 text-center">
                <p className="text-red-500">Error al cargar datos: {(treatmentsError as Error)?.message || (patientTreatmentsError as Error)?.message}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            ) : filteredTreatments && filteredTreatments.length > 0 ? (
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Pacientes Activos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTreatments.map((treatment) => {
                      const patientCount = getPatientCountForTreatment(treatment.id);
                      const activeTreatmentsCount = getActiveTreatmentsCount(treatment.id);
                      return (
                        <TableRow key={treatment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{treatment.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {treatment.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{treatment.defaultDuration} min</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{patientCount}</span>
                                    {activeTreatmentsCount > 0 && (
                                      <Badge variant="outline" className="bg-primary-100 text-primary-800 border-primary-200">
                                        {activeTreatmentsCount} activos
                                      </Badge>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Total: {patientCount} pacientes</p>
                                  <p>Activos: {activeTreatmentsCount} pacientes</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">
                              Activo
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedTreatment(treatment);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Ver detalles</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    if (patientCount > 0) {
                                      toast({
                                        title: "No se puede eliminar",
                                        description: "Este tratamiento está asociado a pacientes",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    if (confirm("¿Estás seguro de que deseas eliminar este tratamiento?")) {
                                      deleteTreatmentMutation.mutate(treatment.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Eliminar</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No hay tratamientos que coincidan con tu búsqueda.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Treatment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Tratamiento</DialogTitle>
              <DialogDescription>
                Modifica los datos del tratamiento en el formulario a continuación.
              </DialogDescription>
            </DialogHeader>
            {selectedTreatment && (
              <TreatmentForm 
                treatment={selectedTreatment}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTreatment(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTreatments;
