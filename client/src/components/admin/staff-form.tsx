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
interface StaffUser {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface Staff {
  id: number;
  userId: number;
  user: StaffUser;
  position: string;
  specialty?: string;
  licenseNumber?: string;
}

interface StaffFormProps {
  staff?: Staff;
  onSuccess: () => void;
}

// Form schema
const staffFormSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.string().min(1, 'El rol es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  position: z.string().min(1, 'El cargo es requerido'),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

const StaffForm: React.FC<StaffFormProps> = ({ staff, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!staff;

  // Default values for the form
  const defaultValues: Partial<StaffFormValues> = {
    fullName: staff?.user.fullName || '',
    email: staff?.user.email || '',
    phone: staff?.user.phone || '',
    role: staff?.user.role || 'staff',
    position: staff?.position || '',
    specialty: staff?.specialty || '',
    licenseNumber: staff?.licenseNumber || '',
    password: '',
  };

  // Setup form
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues,
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffFormValues) => {
      const res = await apiRequest("POST", "/api/register-staff", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Personal creado",
        description: "El miembro del personal ha sido registrado exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear personal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async (data: StaffFormValues) => {
      const res = await apiRequest("PATCH", `/api/staff/${staff?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Personal actualizado",
        description: "Los datos del personal han sido actualizados exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar personal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: StaffFormValues) => {
    if (isEditing) {
      // When editing, we can omit the password if it's empty
      const updateData = { ...data };
      if (!updateData.password) delete updateData.password;
      
      updateStaffMutation.mutate(updateData);
    } else {
      createStaffMutation.mutate(data);
    }
  };

  const isSubmitting = createStaffMutation.isPending || updateStaffMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
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
                  <Input type="email" placeholder="nombre@clinicadelica.com" {...field} />
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

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="staff">Personal</SelectItem>
                  </SelectContent>
                </Select>
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
                    <Input 
                      type="password" 
                      placeholder="******" 
                      {...field} 
                      required={!isEditing}
                    />
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
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Dentista" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidad (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ortodoncia" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licenseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Licencia (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="12345-D" {...field} value={field.value || ''} />
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
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StaffForm;