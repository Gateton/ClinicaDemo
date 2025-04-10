import { AdminLayout } from "@/components/layout/admin-layout";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { AppointmentsList } from "@/components/dashboard/appointments-list";
import { RecentPatients } from "@/components/dashboard/recent-patients";
import { TreatmentImages } from "@/components/dashboard/treatment-images";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TreatmentsTable } from "@/components/dashboard/treatments-table";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Panel Administrativo" subtitle="Bienvenido de nuevo. Aquí está el resumen de hoy.">
      {/* Stats Overview */}
      <StatsOverview role="admin" />

      {/* Appointments and Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <AppointmentsList filter="today" limit={3} showLink={true} />
        </div>

        {/* Recent Patients */}
        <div className="lg:col-span-1">
          <RecentPatients limit={5} showLink={true} />
        </div>
      </div>

      {/* Treatment Images Gallery */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <TreatmentImages limit={6} showLink={true} showUpload={true} />
      </div>

      {/* Quick Actions and Treatments */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div>
          <QuickActions role="admin" />
        </div>

        {/* Active Treatments Summary */}
        <div className="lg:col-span-3">
          <TreatmentsTable filter="active" limit={3} showLink={true} />
        </div>
      </div>
    </AdminLayout>
  );
}
