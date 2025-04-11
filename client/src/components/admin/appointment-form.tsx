import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, CalendarIcon, Clock } from 'lucide-react';
import { format, addMinutes, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

// Types
interface Appointment {
  id: number;
  date: Date;
  patientId: number;
  staffId: number;
  patientTreatmentId: number | null;
  duration: number;
  status: string;
  notes: string | null;
}

interface Patient {
  id: number;
  user: {
    fullName: string;
  };
}

interface Staff {
  id: number;
  user: {
    fullName: string;
  };
  position: string;
  specialty?: string;
}

interface Treatment {
  id: number;
  name: string;
  defaultDuration: number;
}

interface PatientTreatment {
  id: number;
  patientId: number;
  treatmentId: number;
  treatmentName: string;
}

interface AppointmentFormProps {
  appointment?: Appointment;
  onSuccess: () => void;
  defaultDate?: Date;
}

// Time options for the select
const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return {
    label: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    value: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
  };
});

// Form schema
const appointmentFormSchema = z.object({
  patientId: z.coerce.number(),
  staffId: z.coerce.number(),
  treatmentId: z.coerce.number().optional(),
  date: z.date(),
  time: z.string().min(1, 'La hora es requerida'),
  duration: z.coerce.number().min(1, 'La duración es requerida'),
  status: z.string().min(1, 'El estado es requerido'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointment, onSuccess, defaultDate }) => {
  const { toast } = useToast();
  const isEditing = !!appointment;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment ? new Date(appointment.date) : defaultDate || new Date()
  );
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | undefined>(undefined);

  // Fetch patients
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });

  // Fetch staff
  const { data: staff } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  // Fetch treatments
  const { data: treatments } = useQuery<Treatment[]>({
    queryKey: ['/api/treatments'],
  });

  // Fetch patient treatments if patient is selected
  const { data: patientTreatments } = useQuery<PatientTreatment[]>({
    queryKey: ['/api/patient-treatments'],
    // This query will run regardless of patient selection, but frontend filtering will be applied
  });

  // Default values for the form
  const defaultValues: Partial<AppointmentFormValues> = {
    patientId: appointment?.patientId || 0,
    staffId: appointment?.staffId || 0,
    treatmentId: appointment?.patientTreatmentId || undefined,
    date: selectedDate || new Date(),
    time: appointment ? format(new Date(appointment.date), 'HH:mm') : '09:00',
    duration: appointment?.duration || 30,
    status: appointment?.status || 'scheduled',
    notes: appointment?.notes || '',
  };

  // Setup form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  // Get patient treatments for the selected patient
  const getPatientTreatmentsForPatient = (patientId: number) => {
    return patientTreatments?.filter(pt => pt.patientId === patientId) || [];
  };

  // Get treatment details by ID
  const getTreatmentById = (treatmentId: number) => {
    return treatments?.find(t => t.id === treatmentId);
  };

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      // Combine date and time
      const [hours, minutes] = data.time.split(':').map(Number);
      const combinedDate = setMinutes(setHours(new Date(data.date), hours), minutes);
      
      const appointmentData = {
        patientId: data.patientId,
        staffId: data.staffId,
        patientTreatmentId: data.treatmentId || null,
        date: combinedDate.toISOString(),
        duration: data.duration,
        status: data.status,
        notes: data.notes || null,
      };
      
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita creada",
        description: "La cita ha sido programada exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear cita",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      // Combine date and time
      const [hours, minutes] = data.time.split(':').map(Number);
      const combinedDate = setMinutes(setHours(new Date(data.date), hours), minutes);
      
      const appointmentData = {
        patientId: data.patientId,
        staffId: data.staffId,
        patientTreatmentId: data.treatmentId || null,
        date: combinedDate.toISOString(),
        duration: data.duration,
        status: data.status,
        notes: data.notes || null,
      };
      
      const res = await apiRequest("PATCH", `/api/appointments/${appointment?.id}`, appointmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita actualizada",
        description: "La cita ha sido actualizada exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar cita",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // When treatment is selected, update duration
  React.useEffect(() => {
    if (selectedTreatmentId) {
      const relatedTreatment = patientTreatments?.find(pt => pt.id === selectedTreatmentId);
      if (relatedTreatment) {
        const treatment = getTreatmentById(relatedTreatment.treatmentId);
        if (treatment) {
          form.setValue('duration', treatment.defaultDuration);
        }
      }
    }
  }, [selectedTreatmentId, patientTreatments, form]);

  // Form submission handler
  const onSubmit = (data: AppointmentFormValues) => {
    if (isEditing) {
      updateAppointmentMutation.mutate(data);
    } else {
      createAppointmentMutation.mutate(data);
    }
  };

  const isSubmitting = createAppointmentMutation.isPending || updateAppointmentMutation.isPending;
  
  // Calculate end time based on start time and duration
  const calculateEndTime = () => {
    const timeValue = form.watch('time');
    const durationValue = form.watch('duration');
    
    if (!timeValue || !durationValue) return '';
    
    const [hours, minutes] = timeValue.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    
    const endDate = addMinutes(date, durationValue);
    return format(endDate, 'HH:mm');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    // Reset selected treatment when patient changes
                    form.setValue('treatmentId', undefined);
                    setSelectedTreatmentId(undefined);
                  }} 
                  defaultValue={field.value.toString()} 
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients?.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value.toString()} 
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff?.map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                        {staffMember.user.fullName} ({staffMember.specialty || staffMember.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tratamiento (opcional)</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    const parsedValue = parseInt(value);
                    field.onChange(parsedValue);
                    setSelectedTreatmentId(parsedValue);
                  }} 
                  defaultValue={field.value?.toString()} 
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tratamiento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">Sin tratamiento específico</SelectItem>
                    {form.watch('patientId') > 0 && 
                      getPatientTreatmentsForPatient(form.watch('patientId')).map((pt) => (
                        <SelectItem key={pt.id} value={pt.id.toString()}>
                          {pt.treatmentName}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "d 'de' MMMM yyyy", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                          setSelectedDate(date);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (minutos)</FormLabel>
                <div className="flex items-center">
                  <FormControl>
                    <Input 
                      type="number" 
                      min="5" 
                      max="240" 
                      step="5" 
                      {...field} 
                    />
                  </FormControl>
                  <div className="ml-2 text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Fin: {calculateEndTime()}</span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Pendiente</SelectItem>
                    <SelectItem value="confirmed">Confirmada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Notas (opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Añade notas sobre la cita..." 
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Actualizar' : 'Programar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;