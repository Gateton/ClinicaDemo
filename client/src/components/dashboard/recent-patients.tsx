import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

interface Patient {
  id: number;
  fullName: string;
  initials: string;
  lastVisit: string;
}

interface RecentPatientsProps {
  limit?: number;
  showLink?: boolean;
}

export function RecentPatients({ limit = 5, showLink = true }: RecentPatientsProps) {
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients/recent'],
    queryFn: async () => {
      const res = await fetch(`/api/patients/recent?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch recent patients');
      return res.json();
    },
  });

  const formatLastVisit = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-800">Pacientes Recientes</CardTitle>
          {showLink && (
            <Link href="/admin/patients">
              <Button variant="link" className="text-sm text-primary hover:text-primary-500 p-0">Ver todos</Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center p-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : patients && patients.length > 0 ? (
          <div className="space-y-3">
            {patients.map((patient) => (
              <Link key={patient.id} href={`/admin/patients/${patient.id}`}>
                <div className="flex items-center p-2 hover:bg-neutral-50 rounded-lg cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                    {patient.initials}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">{patient.fullName}</p>
                    <p className="text-xs text-neutral-500">Última visita: {formatLastVisit(patient.lastVisit)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-neutral-500">No hay pacientes registrados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
