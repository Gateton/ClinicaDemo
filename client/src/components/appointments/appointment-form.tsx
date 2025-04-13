interface AppointmentFormProps {
  onSuccess?: () => void;
  isPatientRequest?: boolean;
}

export function AppointmentForm({ onSuccess, isPatientRequest = false }: AppointmentFormProps) {
  // ... rest of the component
}