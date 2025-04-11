import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminPatients from "@/pages/admin/patients";
import AdminPatientDetail from "@/pages/admin/patient-detail";
import AdminAppointments from "@/pages/admin/appointments";
import AdminTreatments from "@/pages/admin/treatments";
import AdminStaff from "@/pages/admin/staff";

// Patient pages
import PatientDashboard from "@/pages/patient/dashboard";
import PatientAppointments from "@/pages/patient/appointments";
import PatientGallery from "@/pages/patient/gallery";
import PatientProfile from "@/pages/patient/profile";

import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user } = useAuth();

  // Redirect to the appropriate dashboard based on user role
  const HomePage = () => {
    if (!user) return <AuthPage />;
    return user.role === 'patient' ? <PatientDashboard /> : <AdminDashboard />;
  };

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />

      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} allowedRoles={['admin', 'staff']} />
      <ProtectedRoute path="/admin/patients" component={AdminPatients} allowedRoles={['admin', 'staff']} />
      <ProtectedRoute path="/admin/patients/:id" component={AdminPatientDetail} allowedRoles={['admin', 'staff']} />
      <ProtectedRoute path="/admin/appointments" component={AdminAppointments} allowedRoles={['admin', 'staff']} />
      <ProtectedRoute path="/admin/treatments" component={AdminTreatments} allowedRoles={['admin', 'staff']} />
      <ProtectedRoute path="/admin/staff" component={AdminStaff} allowedRoles={['admin']} />

      {/* Patient Routes */}
      <ProtectedRoute path="/patient" component={PatientDashboard} allowedRoles={['patient']} />
      <ProtectedRoute path="/patient/appointments" component={PatientAppointments} allowedRoles={['patient']} />
      <ProtectedRoute path="/patient/gallery" component={PatientGallery} allowedRoles={['patient']} />
      <ProtectedRoute path="/patient/profile" component={PatientProfile} allowedRoles={['patient']} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
