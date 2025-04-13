import { useQuery } from "@tanstack/react-query";
import { Patient } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function PatientsList() {
  const [, setLocation] = useLocation();
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  // Sort patients by creation date (most recent first)
  const recentPatients = patients?.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 5) || [];
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No registrada';
    return format(new Date(date), "dd/MM/yyyy");
  };
  
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
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Remove this duplicate declaration
  // const formatDate = (date: Date | string) => {
  //   return format(new Date(date), "dd/MM/yyyy");
  // };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Pacientes Recientes</CardTitle>
          <Button
            variant="link"
            onClick={() => setLocation("/patients")}
            className="text-sm text-primary font-medium p-0"
          >
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentPatients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-600">No hay pacientes registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center p-2 hover:bg-neutral-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                  P{patient.id}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-900">
                    Paciente #{patient.id}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Última visita: {formatDate(patient.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
