import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, CalendarPlus, Torus, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { PatientForm } from '@/components/patients/patient-form';
import { AppointmentForm } from '@/components/appointments/appointment-form';
import { TreatmentForm } from '@/components/treatments/treatment-form';

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  action: () => void;
}

interface QuickActionsProps {
  role: 'admin' | 'patient';
}

export function QuickActions({ role }: QuickActionsProps) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleOpenDialog = (dialogName: string) => {
    setOpenDialog(dialogName);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const adminActions: QuickAction[] = [
    {
      title: 'Nuevo Paciente',
      icon: <UserPlus className="mr-3 h-5 w-5" />,
      color: 'bg-primary-50 text-primary-700',
      hoverColor: 'hover:bg-primary-100',
      action: () => handleOpenDialog('newPatient'),
    },
    {
      title: 'Programar Cita',
      icon: <CalendarPlus className="mr-3 h-5 w-5" />,
      color: 'bg-secondary-100 text-secondary-700',
      hoverColor: 'hover:bg-secondary-200',
      action: () => handleOpenDialog('newAppointment'),
    },
    {
      title: 'Nuevo Tratamiento',
      icon: <Torus className="mr-3 h-5 w-5" />,
      color: 'bg-neutral-100 text-neutral-700',
      hoverColor: 'hover:bg-neutral-200',
      action: () => handleOpenDialog('newTreatment'),
    },
    {
      title: 'Generar Informe',
      icon: <FileText className="mr-3 h-5 w-5" />,
      color: 'bg-blue-50 text-blue-700',
      hoverColor: 'hover:bg-blue-100',
      action: () => handleOpenDialog('generateReport'),
    },
  ];

  const patientActions: QuickAction[] = [
    {
      title: 'Solicitar Cita',
      icon: <CalendarPlus className="mr-3 h-5 w-5" />,
      color: 'bg-primary-50 text-primary-700',
      hoverColor: 'hover:bg-primary-100',
      action: () => handleOpenDialog('requestAppointment'),
    },
    {
      title: 'Ver Historial',
      icon: <FileText className="mr-3 h-5 w-5" />,
      color: 'bg-neutral-100 text-neutral-700',
      hoverColor: 'hover:bg-neutral-200',
      action: () => {
        // Navigate to treatment history
        window.location.href = '/patient/treatment';
      },
    },
    {
      title: 'Ver Imágenes',
      icon: <FileText className="mr-3 h-5 w-5" />,
      color: 'bg-blue-50 text-blue-700',
      hoverColor: 'hover:bg-blue-100',
      action: () => {
        // Navigate to images
        window.location.href = '/patient/images';
      },
    },
  ];

  const actions = role === 'admin' ? adminActions : patientActions;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-neutral-800">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full flex items-center justify-between p-3 ${action.color} rounded-md ${action.hoverColor} transition-colors`}
              onClick={action.action}
            >
              <span className="flex items-center">
                {action.icon}
                <span className="text-sm font-medium">{action.title}</span>
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ))}
        </div>

        {/* New Patient Dialog */}
        <Dialog open={openDialog === 'newPatient'} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <PatientForm onSuccess={handleCloseDialog} />
          </DialogContent>
        </Dialog>

        {/* New Appointment Dialog */}
        <Dialog open={openDialog === 'newAppointment'} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Programar Nueva Cita</DialogTitle>
            </DialogHeader>
            <AppointmentForm onSuccess={handleCloseDialog} />
          </DialogContent>
        </Dialog>

        {/* New Treatment Dialog */}
        <Dialog open={openDialog === 'newTreatment'} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Tratamiento</DialogTitle>
            </DialogHeader>
            <TreatmentForm onSuccess={handleCloseDialog} />
          </DialogContent>
        </Dialog>

        {/* Patient Request Appointment Dialog */}
        <Dialog open={openDialog === 'requestAppointment'} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Solicitar Nueva Cita</DialogTitle>
            </DialogHeader>
            <AppointmentForm onSuccess={handleCloseDialog} isPatientRequest={true} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
