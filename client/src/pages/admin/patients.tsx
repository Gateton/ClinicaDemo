import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientModal } from "@/components/patients/patient-modal";
import { Plus, Search, UserCog } from "lucide-react";

interface Patient {
  id: number;
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  treatmentCount: number;
}

export default function AdminPatients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/patients?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch patients');
      return res.json();
    },
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // The search is already handled by the dependency in the useQuery hook
  };

  const handleViewPatient = (patientId: number) => {
    setSelectedPatientId(patientId);
  };

  const handleEditPatient = (patientId: number) => {
    setSelectedPatientId(patientId);
    setIsEditDialogOpen(true);
  };

  return (
    <AdminLayout title="Pacientes" subtitle="Gestiona la información de tus pacientes.">
      {/* Search and actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex-grow max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="search"
              placeholder="Buscar pacientes..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <Button onClick={() => setIsNewPatientDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
        </Button>
      </div>

      {/* Patients list */}
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
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : patients && patients.length > 0 ? (
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Última Visita
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
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => handleViewPatient(patient.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                              {patient.initials}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">{patient.fullName}</div>
                              <div className="text-sm text-neutral-500">{patient.treatmentCount} tratamientos</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{patient.email}</div>
                          <div className="text-sm text-neutral-500">{patient.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {patient.lastVisit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={patient.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-neutral-50 text-neutral-700 border-neutral-200"}>
                            {patient.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPatient(patient.id);
                            }}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            Editar
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
              <p className="text-neutral-500">No se encontraron pacientes.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsNewPatientDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Registrar nuevo paciente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Patient Dialog */}
      <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
          </DialogHeader>
          <PatientForm onSuccess={() => setIsNewPatientDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          <PatientForm 
            patientId={selectedPatientId || undefined} 
            onSuccess={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      <PatientModal 
        patientId={selectedPatientId} 
        isOpen={!!selectedPatientId && !isEditDialogOpen} 
        onClose={() => setSelectedPatientId(null)}
        onEdit={handleEditPatient}
      />
    </AdminLayout>
  );
}
