import { useQuery } from "@tanstack/react-query";
import { User, UserPlus, Calendar, Torus, Image } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: number;
  linkText: string;
  linkHref: string;
}

function StatCard({ icon, iconBgColor, iconColor, title, value, linkText, linkHref }: StatCardProps) {
  const [, setLocation] = useLocation();
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">
                  {title}
                </dt>
                <dd>
                  <div className="text-lg font-medium text-neutral-900">{value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-neutral-50 px-4 py-3 sm:px-6">
        <div className="text-sm">
          <button 
            onClick={() => setLocation(linkHref)}
            className="font-medium text-primary hover:text-primary/80"
          >
            {linkText}<span className="sr-only"> {title.toLowerCase()}</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function StatsOverview() {
  const { user } = useAuth();
  const isPatient = user?.role === "patient";
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="ml-5 w-0 flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-neutral-50 px-4 py-3">
              <Skeleton className="h-4 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <p className="text-neutral-500">No hay estadísticas disponibles</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Stats for patient portal
  if (isPatient) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          icon={<Torus className="text-primary" />}
          iconBgColor="bg-primary-100"
          iconColor="text-primary"
          title="Mis Tratamientos"
          value={stats.treatments || 0}
          linkText="Ver tratamientos"
          linkHref="/treatment-progress"
        />
        <StatCard
          icon={<Calendar className="text-secondary" />}
          iconBgColor="bg-secondary-100"
          iconColor="text-secondary"
          title="Próximas Citas"
          value={stats.upcomingAppointments || 0}
          linkText="Ver citas"
          linkHref="/appointments"
        />
        <StatCard
          icon={<Image className="text-info" />}
          iconBgColor="bg-info/10"
          iconColor="text-info"
          title="Mis Imágenes"
          value={stats.images || 0}
          linkText="Ver galería"
          linkHref="/images"
        />
        <StatCard
          icon={<User className="text-neutral-500" />}
          iconBgColor="bg-neutral-100"
          iconColor="text-neutral-500"
          title="Total de Citas"
          value={stats.totalAppointments || 0}
          linkText="Ver historial"
          linkHref="/appointments"
        />
      </div>
    );
  }
  
  // Stats for admin panel
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard
        icon={<UserPlus className="text-primary" />}
        iconBgColor="bg-primary-100"
        iconColor="text-primary"
        title="Total Pacientes"
        value={stats.patientCount || 0}
        linkText="Ver todos"
        linkHref="/patients"
      />
      <StatCard
        icon={<Calendar className="text-secondary" />}
        iconBgColor="bg-secondary-100"
        iconColor="text-secondary"
        title="Citas para hoy"
        value={stats.todayAppointments || 0}
        linkText="Ver agenda"
        linkHref="/appointments"
      />
      <StatCard
        icon={<Torus className="text-neutral-500" />}
        iconBgColor="bg-neutral-100"
        iconColor="text-neutral-500"
        title="Tratamientos Activos"
        value={stats.activeTreatments || 0}
        linkText="Ver detalles"
        linkHref="/treatments"
      />
      <StatCard
        icon={<Image className="text-info" />}
        iconBgColor="bg-info/10"
        iconColor="text-info"
        title="Imágenes Almacenadas"
        value={stats.storedImages || 0}
        linkText="Ver galería"
        linkHref="/images"
      />
    </div>
  );
}
