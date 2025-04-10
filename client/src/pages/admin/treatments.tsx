import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TreatmentForm } from "@/components/treatments/treatment-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Search, Pencil } from "lucide-react";

interface Treatment {
  id: number;
  patientId: number;
  patientName: string;
  patientInitials: string;
  name: string;
  type: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  progress: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  assignedToName?: string;
  nextAppointment?: string;
}

export default function AdminTreatments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [isNewTreatmentDialogOpen, setIsNewTreatmentDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const { data: treatments, isLoading } = useQuery<Treatment[]>({
    queryKey: ['/api/treatments', filter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('filter', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/treatments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch treatments');
      return res.json();
    },
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // The search is already handled by the dependency in the useQuery hook
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No definida';
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getStatusBadge = (status: Treatment['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">En progreso</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completado</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pendiente</Badge>;
    }
  };

  const handleViewTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
  };

  const handleEditTreatment = () => {
    if (selectedTreatment) {
      // Handle edit treatment logic
      setSelectedTreatment(null);
    }
  };

  return (
    <AdminLayout title="Tratamientos" subtitle="Gestiona los tratamientos de tus pacientes.">
      {/* Filter and actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <Tabs 
            value={filter} 
            onValueChange={(value) => setFilter(value as 'active' | 'completed' | 'all')}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <form onSubmit={handleSearch} className="w-full sm:w-auto flex-grow max-w-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Buscar tratamientos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>

        <Button onClick={() => setIsNewTreatmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Tratamiento
        </Button>
      </div>

      {/* Treatments list */}
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
                      <Skeleton className="h-2 w-36 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : treatments && treatments.length > 0 ? (
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
                        Progreso
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {treatments.map((treatment) => (
                      <tr key={treatment.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                              {treatment.patientInitials}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-neutral-900">{treatment.patientName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{treatment.name}</div>
                          <div className="text-xs text-neutral-500">{treatment.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-48">
                          <Progress value={treatment.progress} className="h-2" />
                          <div className="text-xs text-neutral-500 mt-1">
                            {treatment.progress}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(treatment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">
                            <div className="flex flex-col space-y-1">
                              <span><span className="text-xs text-neutral-500">Inicio:</span> {formatDate(treatment.startDate)}</span>
                              <span><span className="text-xs text-neutral-500">Fin:</span> {formatDate(treatment.endDate)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTreatment(treatment)}
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
              <p className="text-neutral-500">No se encontraron tratamientos para el filtro seleccionado.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsNewTreatmentDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Crear nuevo tratamiento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Treatment Dialog */}
      <Dialog open={isNewTreatmentDialogOpen} onOpenChange={setIsNewTreatmentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tratamiento</DialogTitle>
          </DialogHeader>
          <TreatmentForm onSuccess={() => setIsNewTreatmentDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* View/Edit Treatment Dialog */}
      {selectedTreatment && (
        <Dialog open={!!selectedTreatment} onOpenChange={(open) => !open && setSelectedTreatment(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Tratamiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-medium text-primary-700">
                    {selectedTreatment.patientInitials}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900">{selectedTreatment.patientName}</h3>
                    <div className="mt-1">
                      {getStatusBadge(selectedTreatment.status)}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleEditTreatment}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-neutral-800 mb-2">Información del Tratamiento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500">Nombre</p>
                    <p className="text-sm font-medium text-neutral-900">{selectedTreatment.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Tipo</p>
                    <p className="text-sm font-medium text-neutral-900">{selectedTreatment.type}</p>
                  </div>
                </div>
                
                {selectedTreatment.description && (
                  <div className="mt-3">
                    <p className="text-xs text-neutral-500">Descripción</p>
                    <p className="text-sm text-neutral-900 mt-1">{selectedTreatment.description}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-neutral-800 mb-2">Progreso y Fechas</h4>
                <Progress value={selectedTreatment.progress} className="h-2 mb-1" />
                <p className="text-sm text-neutral-900 mb-3">{selectedTreatment.progress}% Completado</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500">Fecha de inicio</p>
                    <p className="text-sm font-medium text-neutral-900">{formatDate(selectedTreatment.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Fecha de finalización</p>
                    <p className="text-sm font-medium text-neutral-900">{formatDate(selectedTreatment.endDate)}</p>
                  </div>
                </div>
              </div>
              
              {selectedTreatment.assignedToName && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-500">Asignado a</p>
                  <p className="text-sm font-medium text-neutral-900">{selectedTreatment.assignedToName}</p>
                </div>
              )}
              
              {selectedTreatment.nextAppointment && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-500">Próxima cita</p>
                  <p className="text-sm font-medium text-neutral-900">{selectedTreatment.nextAppointment}</p>
                </div>
              )}
              
              {selectedTreatment.notes && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-xs text-neutral-500">Notas</p>
                  <p className="text-sm text-neutral-900 mt-1">{selectedTreatment.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedTreatment(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
