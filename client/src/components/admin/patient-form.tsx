import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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
import { Loader2 } from 'lucide-react';

// Types
interface PatientUser {
  fullName: string;
  email: string;
  phone: string;
}

interface Patient {
  id: number;
  userId: number;
  user: PatientUser;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  insurance?: string;
  occupation?: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedication?: string;
  medicalNotes?: string;
}

interface PatientFormProps {
  patient?: Patient;
  onSuccess: () => void;
}

// Form schema
const patientFormSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  insurance: z.string().optional(),
  occupation: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  currentMedication: z.string().optional(),
  medicalNotes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!patient;

  // Parse allergies and medical conditions to comma-separated string
  const allergiesString = patient?.allergies?.join(', ') || '';
  const medicalConditionsString = patient?.medicalConditions?.join(', ') || '';

  // Default values for the form
  const defaultValues: Partial<PatientFormValues> = {
    fullName: patient?.user.fullName || '',
    email: patient?.user.email || '',
    phone: patient?.user.phone || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || '',
    address: patient?.address || '',
    insurance: patient?.insurance || '',
    occupation: patient?.occupation || '',
    allergies: allergiesString,
    medicalConditions: medicalConditionsString,
    currentMedication: patient?.currentMedication || '',
    medicalNotes: patient?.medicalNotes || '',
    password: '',
  };

  // Setup form
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      // Convert comma-separated strings to arrays
      const formattedData = {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        medicalConditions: data.medicalConditions ? data.medicalConditions.split(',').map(c => c.trim()).filter(c => c) : [],
      };
      
      const res = await apiRequest("POST", "/api/register-patient", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: "Paciente creado",
        description: "El paciente ha sido registrado exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear paciente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      // Convert comma-separated strings to arrays
      const formattedData = {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        medicalConditions: data.medicalConditions ? data.medicalConditions.split(',').map(c => c.trim()).filter(c => c) : [],
      };
      
      // If password is empty, remove it from the request
      if (!formattedData.password) {
        delete formattedData.password;
      }
      
      const res = await apiRequest("PATCH", `/api/patients/${patient?.id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      toast({
        title: "Paciente actualizado",
        description: "Los datos del paciente han sido actualizados exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar paciente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: PatientFormValues) => {
    if (isEditing) {
      updatePatientMutation.mutate(data);
    } else {
      createPatientMutation.mutate(data);
    }
  };

  const isSubmitting = createPatientMutation.isPending || updatePatientMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-500">Información Personal</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="María López" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+34 123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} required={!isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña (Dejar en blanco para mantener)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle Ejemplo, 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocupación</FormLabel>
                  <FormControl>
                    <Input placeholder="Profesión" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insurance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seguro Médico</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del seguro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-500">Información Médica</h3>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias (separadas por coma)</FormLabel>
                  <FormControl>
                    <Input placeholder="Penicilina, polen, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicalConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condiciones Médicas (separadas por coma)</FormLabel>
                  <FormControl>
                    <Input placeholder="Diabetes, hipertensión, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentMedication"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Medicación Actual</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Lista de medicamentos que toma actualmente..." 
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="medicalNotes"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Notas Médicas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones relevantes para su tratamiento..." 
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;