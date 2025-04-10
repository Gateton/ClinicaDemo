import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import PatientsPage from "@/pages/patients-page";
import AppointmentsPage from "@/pages/appointments-page";
import TreatmentsPage from "@/pages/treatments-page";
import ImagesPage from "@/pages/images-page";
import StaffPage from "@/pages/staff-page";
import PatientDashboard from "@/pages/patient-portal/patient-dashboard";
import TreatmentProgress from "@/pages/patient-portal/treatment-progress";
import PatientAppointments from "@/pages/patient-portal/patient-appointments";
import PatientImages from "@/pages/patient-portal/patient-images";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user } = useAuth();
  
  // User is patient, redirect to patient portal
  if (user && user.role === "patient") {
    return (
      <Switch>
        <ProtectedRoute path="/" component={PatientDashboard} />
        <ProtectedRoute path="/treatment-progress" component={TreatmentProgress} />
        <ProtectedRoute path="/appointments" component={PatientAppointments} />
        <ProtectedRoute path="/images" component={PatientImages} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  // User is admin or staff, show admin panel
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} adminOnly />
      <ProtectedRoute path="/patients" component={PatientsPage} adminOnly />
      <ProtectedRoute path="/appointments" component={AppointmentsPage} adminOnly />
      <ProtectedRoute path="/treatments" component={TreatmentsPage} adminOnly />
      <ProtectedRoute path="/images" component={ImagesPage} adminOnly />
      <ProtectedRoute path="/staff" component={StaffPage} adminOnly />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
