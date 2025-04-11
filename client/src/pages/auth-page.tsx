import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/ui/logo";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Registration form schema
const registerPatientSchema = z.object({
  user: z.object({
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    email: z.string().email("Debe ingresar un correo electrónico válido"),
    fullName: z.string().min(1, "El nombre completo es requerido"),
    role: z.literal('patient'),
    phone: z.string().optional(),
  }),
  profile: z.object({
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    insurance: z.string().optional(),
    occupation: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    currentMedication: z.string().optional(),
    medicalNotes: z.string().optional(),
  }),
});

const registerStaffSchema = z.object({
  user: z.object({
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    email: z.string().email("Debe ingresar un correo electrónico válido"),
    fullName: z.string().min(1, "El nombre completo es requerido"),
    role: z.string().min(1, "El rol es requerido"),
    phone: z.string().optional(),
  }),
  profile: z.object({
    position: z.string().min(1, "La posición es requerida"),
    specialty: z.string().optional(),
    licenseNumber: z.string().optional(),
  }),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [authMode, setAuthMode] = useState<'patient' | 'staff'>('patient');
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    return user.role === 'patient' ? <Redirect to="/patient" /> : <Redirect to="/admin" />;
  }

  // Setup login form
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Setup registration form for patients
  const registerPatientForm = useForm({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      user: {
        username: "",
        password: "",
        email: "",
        fullName: "",
        role: "patient",
        phone: "",
      },
      profile: {
        dateOfBirth: "",
        gender: "",
        address: "",
        insurance: "",
        occupation: "",
        allergies: [],
        medicalConditions: [],
        currentMedication: "",
        medicalNotes: "",
      },
    },
  });

  // Setup registration form for staff
  const registerStaffForm = useForm({
    resolver: zodResolver(registerStaffSchema),
    defaultValues: {
      user: {
        username: "",
        password: "",
        email: "",
        fullName: "",
        role: "staff",
        phone: "",
      },
      profile: {
        position: "",
        specialty: "",
        licenseNumber: "",
      },
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  // Handle patient registration form submission
  const onRegisterPatientSubmit = (data: z.infer<typeof registerPatientSchema>) => {
    registerMutation.mutate(data);
  };

  // Handle staff registration form submission
  const onRegisterStaffSubmit = (data: z.infer<typeof registerStaffSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Information Section */}
        <div className="hidden lg:flex flex-col justify-center p-8 bg-primary-600 text-white rounded-l-lg">
          <Logo size="large" className="text-white mb-8" />
          <h1 className="text-3xl font-bold mb-4">Bienvenido a Clínica Odontológica Delica</h1>
          <p className="text-lg mb-6">
            Nuestro sistema de gestión le permite acceder a sus tratamientos, citas y
            visualizar el progreso de su sonrisa.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white p-1 rounded-full text-primary-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Seguimiento de tratamientos</h3>
                <p className="text-primary-100">Visualice el progreso de sus tratamientos dentales.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white p-1 rounded-full text-primary-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Gestión de citas</h3>
                <p className="text-primary-100">Programe y administre sus citas fácilmente.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white p-1 rounded-full text-primary-600 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Galería de imágenes</h3>
                <p className="text-primary-100">Compare el antes y después de sus tratamientos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Section */}
        <Card className="w-full shadow-lg border-0">
          <CardContent className="p-8">
            <div className="lg:hidden mb-8">
              <Logo size="large" className="mx-auto" />
            </div>
            
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-8 w-full">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
                    <p className="text-muted-foreground mt-2">Acceda a su cuenta para gestionar sus servicios</p>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de usuario</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingrese su nombre de usuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Ingrese su contraseña" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="text-right">
                        <Button variant="link" className="p-0 h-auto">¿Olvidó su contraseña?</Button>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          "Iniciar Sesión"
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      ¿No tiene una cuenta?{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("register")}>
                        Crear cuenta
                      </Button>
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">Crear Cuenta</h2>
                    <p className="text-muted-foreground mt-2">Complete la información para registrarse</p>
                  </div>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <Button 
                      type="button" 
                      variant={authMode === 'patient' ? 'default' : 'outline'} 
                      onClick={() => setAuthMode('patient')}
                    >
                      Paciente
                    </Button>
                    <Button 
                      type="button" 
                      variant={authMode === 'staff' ? 'default' : 'outline'} 
                      onClick={() => setAuthMode('staff')}
                    >
                      Personal
                    </Button>
                  </div>
                  
                  {authMode === 'patient' ? (
                    <Form {...registerPatientForm}>
                      <form onSubmit={registerPatientForm.handleSubmit(onRegisterPatientSubmit)} className="space-y-4">
                        <FormField
                          control={registerPatientForm.control}
                          name="user.fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ingrese su nombre completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registerPatientForm.control}
                            name="user.email"
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
                            control={registerPatientForm.control}
                            name="user.phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="+34 600 000 000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={registerPatientForm.control}
                          name="user.username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de usuario</FormLabel>
                              <FormControl>
                                <Input placeholder="Elija un nombre de usuario" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerPatientForm.control}
                          name="user.password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Elija una contraseña segura" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Registrando...
                            </>
                          ) : (
                            "Crear Cuenta"
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...registerStaffForm}>
                      <form onSubmit={registerStaffForm.handleSubmit(onRegisterStaffSubmit)} className="space-y-4">
                        <FormField
                          control={registerStaffForm.control}
                          name="user.fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ingrese su nombre completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registerStaffForm.control}
                            name="user.email"
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
                            control={registerStaffForm.control}
                            name="user.phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="+34 600 000 000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registerStaffForm.control}
                            name="profile.position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Puesto</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doctor, Asistente, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerStaffForm.control}
                            name="profile.specialty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Especialidad</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ortodoncia, Implantes, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={registerStaffForm.control}
                          name="user.username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre de usuario</FormLabel>
                              <FormControl>
                                <Input placeholder="Elija un nombre de usuario" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerStaffForm.control}
                          name="user.password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Elija una contraseña segura" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Registrando...
                            </>
                          ) : (
                            "Crear Cuenta"
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      ¿Ya tiene una cuenta?{" "}
                      <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("login")}>
                        Iniciar sesión
                      </Button>
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
