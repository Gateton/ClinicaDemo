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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Types
interface Treatment {
  id: number;
  name: string;
  description: string;
  defaultDuration: number;
  createdAt: string;
}

interface TreatmentFormProps {
  treatment?: Treatment;
  onSuccess: () => void;
}

// Form schema
const treatmentFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  defaultDuration: z.coerce.number()
    .min(1, 'La duración debe ser mayor a 0')
    .max(480, 'La duración no puede exceder 8 horas (480 minutos)'),
});

type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;

const TreatmentForm: React.FC<TreatmentFormProps> = ({ treatment, onSuccess }) => {
  const { toast } = useToast();
  const isEditing = !!treatment;

  // Default values for the form
  const defaultValues: Partial<TreatmentFormValues> = {
    name: treatment?.name || '',
    description: treatment?.description || '',
    defaultDuration: treatment?.defaultDuration || 60,
  };

  // Setup form
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues,
  });

  // Create treatment mutation
  const createTreatmentMutation = useMutation({
    mutationFn: async (data: TreatmentFormValues) => {
      const res = await apiRequest("POST", "/api/treatments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      toast({
        title: "Tratamiento creado",
        description: "El tratamiento ha sido creado exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear tratamiento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update treatment mutation
  const updateTreatmentMutation = useMutation({
    mutationFn: async (data: TreatmentFormValues) => {
      const res = await apiRequest("PATCH", `/api/treatments/${treatment?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      toast({
        title: "Tratamiento actualizado",
        description: "Los datos del tratamiento han sido actualizados exitosamente",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar tratamiento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: TreatmentFormValues) => {
    if (isEditing) {
      updateTreatmentMutation.mutate(data);
    } else {
      createTreatmentMutation.mutate(data);
    }
  };

  const isSubmitting = createTreatmentMutation.isPending || updateTreatmentMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del tratamiento</FormLabel>
              <FormControl>
                <Input placeholder="Limpieza dental" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Breve descripción del tratamiento..." 
                  className="min-h-24"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duración estimada (minutos)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1}
                  max={480}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

export default TreatmentForm;