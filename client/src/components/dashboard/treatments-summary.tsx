import { useQuery } from "@tanstack/react-query";
import { PatientTreatment, Treatment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default function TreatmentsSummary() {
  const { data: patientTreatments, isLoading: isLoadingTreatments } = useQuery<PatientTreatment[]>({
    queryKey: ["/api/patient-treatments"],
  });
  
  const { data: treatments, isLoading: isLoadingTreatmentTypes } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
  });
  
  const isLoading = isLoadingTreatments || isLoadingTreatmentTypes;
  
  // Filter active treatments and sort by progress
  const activeTreatments = patientTreatments
    ?.filter(treatment => treatment.status === "active")
    .sort((a, b) => {
      // Sort by progress descending
      return (b.progress || 0) - (a.progress || 0);
    })
    .slice(0, 3) || [];
  
  const getTreatmentName = (treatmentId: number): string => {
    const treatment = treatments?.find(t => t.id === treatmentId);
    return treatment?.name || `Tratamiento #${treatmentId}`;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs rounded-full bg-success bg-opacity-10 text-success">En progreso</span>;
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-neutral-500 bg-opacity-10 text-neutral-500">Completado</span>;
      case "cancelled":
        return <span className="px-2 py-1 text-xs rounded-full bg-destructive bg-opacity-10 text-destructive">Cancelado</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-800">{status}</span>;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-4 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-10 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-10 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-10 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-10 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-10 w-24" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resumen de Tratamientos Activos</CardTitle>
      </CardHeader>
      <CardContent>
        {activeTreatments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">No hay tratamientos activos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tratamiento
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Inicio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {activeTreatments.map((treatment) => (
                  <tr key={treatment.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                          P{treatment.patientId}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">
                            Paciente #{treatment.patientId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {getTreatmentName(treatment.treatmentId)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {treatment.phase || "Fase inicial"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(treatment.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${treatment.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {treatment.progress || 0}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                      {treatment.startDate ? format(new Date(treatment.startDate), "dd/MM/yyyy") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
