import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Progress } from '@/components/ui/progress';

interface Treatment {
  id: number;
  patientId: number;
  patientName: string;
  patientInitials: string;
  name: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  progress: number;
  phase: string;
  nextAppointment: string;
}

interface TreatmentsTableProps {
  limit?: number;
  showLink?: boolean;
  patientId?: number;
  filter?: 'active' | 'all' | 'completed';
}

export function TreatmentsTable({ 
  limit = 3, 
  showLink = true, 
  patientId, 
  filter = 'active'
}: TreatmentsTableProps) {
  const queryKey = patientId
    ? ['/api/patients', patientId, 'treatments']
    : ['/api/treatments', filter];

  const { data: treatments, isLoading } = useQuery<Treatment[]>({
    queryKey,
    queryFn: async () => {
      let url = `/api/treatments?filter=${filter}`;
      if (patientId) {
        url = `/api/patients/${patientId}/treatments`;
      }
      if (limit) {
        url += `&limit=${limit}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch treatments');
      return res.json();
    },
  });

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

  const linkPath = patientId ? `/patient/treatment` : `/admin/treatments`;
  const title = patientId ? 'Mi Tratamiento Actual' : 'Resumen de Tratamientos Activos';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
          {showLink && (
            <Link href={linkPath}>
              <Button variant="link" className="text-sm text-primary hover:text-primary-500 p-0">Ver todos</Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-5 gap-4 px-4 py-3 text-xs font-medium text-neutral-500 uppercase">
                <div>Paciente</div>
                <div>Tratamiento</div>
                <div>Estado</div>
                <div>Progreso</div>
                <div>Próx. Cita</div>
              </div>
              <div className="divide-y divide-neutral-200">
                {[...Array(limit)].map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 px-4 py-4">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20 ml-3" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div>
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-3 w-8 mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : treatments && treatments.length > 0 ? (
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
                    Próx. Cita
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {treatments.map((treatment) => (
                  <tr key={treatment.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                          {treatment.patientInitials}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-neutral-900">{treatment.patientName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">{treatment.name}</div>
                      <div className="text-xs text-neutral-500">{treatment.phase}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(treatment.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Progress value={treatment.progress} className="h-2" />
                      <div className="text-xs text-neutral-500 mt-1">
                        {treatment.progress}%
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-900">
                      {treatment.nextAppointment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-neutral-500">No hay tratamientos activos.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
