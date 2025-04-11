import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CalendarRange } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TreatmentStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'completed';
  date: Date | null;
}

interface TreatmentProgressProps {
  treatmentName: string;
  description: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  steps: TreatmentStep[];
  nextAppointmentDate?: Date | null;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Clock className="h-4 w-4" />,
  },
  in_progress: {
    label: 'En Progreso',
    color: 'bg-primary-100 text-primary-800',
    icon: <Clock className="h-4 w-4" />,
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

const TreatmentProgress: React.FC<TreatmentProgressProps> = ({
  treatmentName,
  description,
  progress,
  status,
  steps,
  nextAppointmentDate
}) => {
  const statusInfo = statusConfig[status];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium text-neutral-800">{treatmentName}</h3>
        <Badge variant="outline" className={statusInfo.color}>
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.label}</span>
        </Badge>
      </div>
      
      <p className="text-sm text-neutral-600">{description}</p>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-neutral-700">Progreso del tratamiento</span>
          <span className="text-sm font-medium text-neutral-700">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {nextAppointmentDate && (
        <div className="flex items-center p-3 bg-primary-50 rounded-md text-primary-700">
          <CalendarRange className="h-5 w-5 mr-2" />
          <div>
            <p className="text-sm font-medium">Próxima cita: {format(nextAppointmentDate, "d 'de' MMMM, HH:mm", { locale: es })}</p>
          </div>
        </div>
      )}
      
      <div className="border-t border-neutral-200 pt-4 mt-4">
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Plan de tratamiento</h3>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start">
              <div className={`p-1 rounded-full mt-0.5 ${
                step.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-primary-100 text-primary-800'
              }`}>
                {step.status === 'completed' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-900">{step.name}</p>
                <p className="text-xs text-neutral-500">
                  {step.status === 'completed' 
                    ? `Completado: ${step.date ? format(step.date, "d/MM/yyyy", { locale: es }) : 'Fecha no registrada'}`
                    : (step.date ? `Programado: ${format(step.date, "d/MM/yyyy", { locale: es })}` : 'No programado aún')}
                </p>
                <p className="text-xs text-neutral-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TreatmentProgress;
