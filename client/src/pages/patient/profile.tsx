import React, { useState } from 'react';
import PatientLayout from '@/components/layout/patient-layout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  CalendarDays, 
  Shield, 
  Heart, 
  AlertCircle, 
  Pill, 
  Lock, 
  Save, 
  Upload 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Patient {
  id: number;
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    profileImage?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  insurance?: string;
  occupation?: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedication?: string;
  medicalNotes?: string;
  createdAt: string;
}

// Form schema for personal info
const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  insurance: z.string().optional(),
});

// Form schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmar contraseña es requerida'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

const PatientProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  
  // Fetch patient data
  const { 
    data: patient, 
    isLoading, 
    error 
  } = useQuery<Patient>({
    queryKey: ['/api/patients/me'],
    enabled: !!user,
  });

  // Update personal info mutation
  const updatePersonalInfoMutation = useMutation({
    mutationFn: async (data: PersonalInfoFormValues) => {
      const res = await apiRequest("PATCH", `/api/patients/me`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients/me'] });
      toast({
        title: "Información actualizada",
        description: "Tu información personal ha sido actualizada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar información",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeFormValues) => {
      const res = await apiRequest("POST", `/api/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente",
      });
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cambiar contraseña",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload profile image mutation
  const uploadProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Imagen actualizada",
        description: "Tu imagen de perfil ha sido actualizada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Setup forms
  const personalInfoForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: patient?.user.fullName || '',
      email: patient?.user.email || '',
      phone: patient?.user.phone || '',
      dateOfBirth: patient?.dateOfBirth || '',
      gender: patient?.gender || '',
      address: patient?.address || '',
      occupation: patient?.occupation || '',
      insurance: patient?.insurance || '',
    },
  });

  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update form values when patient data is loaded
  React.useEffect(() => {
    if (patient) {
      personalInfoForm.reset({
        fullName: patient.user.fullName,
        email: patient.user.email,
        phone: patient.user.phone || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        address: patient.address || '',
        occupation: patient.occupation || '',
        insurance: patient.insurance || '',
      });
    }
  }, [patient, personalInfoForm]);

  // Handle personal info form submission
  const onPersonalInfoSubmit = (data: PersonalInfoFormValues) => {
    updatePersonalInfoMutation.mutate(data);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: PasswordChangeFormValues) => {
    changePasswordMutation.mutate(data);
  };

  // Handle profile image upload
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadProfileImageMutation.mutate(file);
    }
  };

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Mi Perfil</h1>
            <p className="text-neutral-600">Gestiona tu información personal y preferencias</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Información del Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-24 mb-6" />
                  
                  <div className="w-full space-y-4">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 mb-2">Error al cargar el perfil</p>
                  <p className="text-neutral-600 mb-4">{(error as Error).message}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reintentar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={patient?.user.profileImage} alt={patient?.user.fullName} />
                        <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                          {getInitials(patient?.user.fullName || "")}
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-primary-500 text-white p-1 rounded-full cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <input 
                          id="profile-image" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                        />
                      </label>
                    </div>
                    <h3 className="text-xl font-semibold">{patient?.user.fullName}</h3>
                    <p className="text-sm text-neutral-500 mb-6">
                      Paciente desde {patient?.createdAt ? format(new Date(patient.createdAt), "MMMM yyyy", { locale: es }) : ''}
                    </p>
                    
                    <div className="w-full space-y-4">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-full text-primary-600 mr-3">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{patient?.user.email}</p>
                          <p className="text-xs text-neutral-500">Email</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-full text-primary-600 mr-3">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{patient?.user.phone || 'No registrado'}</p>
                          <p className="text-xs text-neutral-500">Teléfono</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-full text-primary-600 mr-3">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{patient?.insurance || 'No registrado'}</p>
                          <p className="text-xs text-neutral-500">Seguro médico</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Alergias</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {patient?.allergies && patient.allergies.length > 0 ? (
                        patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-100">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No hay alergias registradas</p>
                      )}
                    </div>
                    
                    <h4 className="font-medium mb-2 text-sm">Condiciones médicas</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient?.medicalConditions && patient.medicalConditions.length > 0 ? (
                        patient.medicalConditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-neutral-500">No hay condiciones médicas registradas</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Profile Edit Forms */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>Actualiza tu información personal y preferencias</CardDescription>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="personal">Información Personal</TabsTrigger>
                  <TabsTrigger value="security">Seguridad</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="personal" className="mt-0">
                <Form {...personalInfoForm}>
                  <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalInfoForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalInfoForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalInfoForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="Teléfono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalInfoForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de nacimiento</FormLabel>
                            <FormControl>
                              <Input placeholder="DD/MM/AAAA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalInfoForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Género</FormLabel>
                            <FormControl>
                              <Input placeholder="Género" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalInfoForm.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ocupación</FormLabel>
                            <FormControl>
                              <Input placeholder="Ocupación" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={personalInfoForm.control}
                        name="insurance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seguro médico</FormLabel>
                            <FormControl>
                              <Input placeholder="Seguro médico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={personalInfoForm.control}
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
                    
                    <Button type="submit" disabled={updatePersonalInfoMutation.isPending} className="mt-6">
                      {updatePersonalInfoMutation.isPending ? (
                        <>Guardando...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Cambiar Contraseña</h3>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña actual</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Ingresa tu contraseña actual" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nueva contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Ingresa tu nueva contraseña" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirma tu nueva contraseña" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={changePasswordMutation.isPending} className="mt-2">
                          {changePasswordMutation.isPending ? (
                            <>Actualizando...</>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Cambiar Contraseña
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Información de la cuenta</h3>
                    <p className="text-sm text-neutral-600 mb-4">Otra información importante de tu cuenta.</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-neutral-500" />
                          <div>
                            <p className="text-sm font-medium">Nombre de usuario</p>
                            <p className="text-xs text-neutral-500">{patient?.user.username}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CalendarDays className="h-5 w-5 mr-2 text-neutral-500" />
                          <div>
                            <p className="text-sm font-medium">Fecha de registro</p>
                            <p className="text-xs text-neutral-500">
                              {patient?.createdAt 
                                ? format(new Date(patient.createdAt), "d 'de' MMMM yyyy", { locale: es })
                                : 'No disponible'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientProfile;
