import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { insertUserSchema } from '@shared/schema';

const patientSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  medicalConditions: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patientId?: number;
  defaultValues?: Partial<PatientFormValues>;
  onSuccess?: () => void;
}

export function PatientForm({ patientId, defaultValues, onSuccess }: PatientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!patientId;

  // Update the schema to include all fields
  const patientSchema = insertUserSchema.extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    allergies: z.string().optional(),
    currentMedication: z.string().optional(),
    medicalConditions: z.string().optional(),
    notes: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  // Update default values to include all fields
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues || {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      role: 'patient',
      allergies: '',
      currentMedication: '',
      medicalConditions: '',
      notes: '',
    },
  });
  
  // Update phone field to handle null values
  <FormField
    control={form.control}
    name="phone"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Teléfono</FormLabel>
        <FormControl>
          <Input 
            placeholder="+34 612 345 678"
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      const { confirmPassword, allergies, currentMedication, medicalConditions, notes, ...userData } = data;
      
      const userResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to create patient account');
      }
      
      const user = await userResponse.json();
      
      // Create patient additional info
      const patientInfoResponse = await fetch(`/api/patients/${user.id}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allergies,
          currentMedication,
          medicalConditions,
          notes,
        }),
      });
      
      if (!patientInfoResponse.ok) {
        throw new Error('Failed to save patient medical information');
      }
      
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patients/recent'] });
      toast({
        title: 'Paciente creado',
        description: 'El paciente ha sido registrado exitosamente.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      const { confirmPassword, allergies, currentMedication, medicalConditions, notes, ...userData } = data;
      
      const userResponse = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to update patient account');
      }
      
      // Update patient additional info
      const patientInfoResponse = await fetch(`/api/patients/${patientId}/info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allergies,
          currentMedication,
          medicalConditions,
          notes,
        }),
      });
      
      if (!patientInfoResponse.ok) {
        throw new Error('Failed to update patient medical information');
      }
      
      const user = await userResponse.json();
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}`] });
      toast({
        title: 'Paciente actualizado',
        description: 'La información del paciente ha sido actualizada exitosamente.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updatePatientMutation.mutateAsync(data);
      } else {
        await createPatientMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre completo del paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="correo@ejemplo.com" {...field} />
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
              
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Dirección completa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de usuario para acceso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirmar contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <div className="space-y-4">
          <h3 className="font-medium text-neutral-800">Información médica</h3>
          
          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alergias</FormLabel>
                <FormControl>
                  <Textarea placeholder="Alergias conocidas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentMedication"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicación actual</FormLabel>
                <FormControl>
                  <Textarea placeholder="Medicación que toma actualmente" {...field} />
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
                <FormLabel>Condiciones médicas</FormLabel>
                <FormControl>
                  <Textarea placeholder="Condiciones médicas relevantes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas adicionales</FormLabel>
                <FormControl>
                  <Textarea placeholder="Notas adicionales sobre el paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Actualizar paciente' : 'Registrar paciente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
