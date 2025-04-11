import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ImageUploadProps {
  patientTreatmentId: number;
  onUploadComplete?: () => void;
  defaultType?: 'before' | 'progress' | 'after';
  maxWidth?: number;
}

const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  type: z.enum(['before', 'progress', 'after'], {
    required_error: 'El tipo de imagen es requerido',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ImageUpload: React.FC<ImageUploadProps> = ({
  patientTreatmentId,
  onUploadComplete,
  defaultType = 'progress',
  maxWidth = 400,
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: defaultType,
    },
  });

  // Mutation for uploading image
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      try {
        const res = await fetch("/api/images/upload", {
          method: "POST",
          body: data,
          credentials: "include"
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || res.statusText);
        }
        
        clearInterval(interval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
        
        return await res.json();
      } catch (error) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/images/treatment'] });
      toast({
        title: "Imagen subida",
        description: "La imagen ha sido subida exitosamente",
      });
      
      // Reset form and file state
      form.reset();
      setFile(null);
      setPreviewUrl(null);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir la imagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler for file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    handleFile(selectedFile);
  };

  // Handler for drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handler for drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Process the selected file
  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // Trigger file input click
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    if (!file) {
      toast({
        title: "No hay imagen seleccionada",
        description: "Por favor, selecciona una imagen para subir",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('patientTreatmentId', patientTreatmentId.toString());
    
    uploadMutation.mutate(formData);
  };

  return (
    <div style={{ maxWidth: `${maxWidth}px` }} className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-colors
              ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'}
              ${previewUrl ? 'bg-neutral-50' : 'bg-white'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {!previewUrl ? (
              <div className="flex flex-col items-center justify-center py-4">
                <UploadCloud className="h-10 w-10 text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-700 mb-1">
                  Arrastra y suelta o haz clic para subir
                </p>
                <p className="text-xs text-neutral-500 text-center mb-3">
                  Formatos: JPG, PNG, GIF (Max. 5MB)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openFileSelector}
                  disabled={isUploading}
                >
                  Seleccionar imagen
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white shadow-sm border"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Quitar imagen</span>
                </Button>
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-auto rounded border"
                />
              </div>
            )}
            
            {isUploading && (
              <div className="mt-4">
                <p className="text-xs font-medium text-neutral-700 mb-1">
                  Subiendo imagen...
                </p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título de la imagen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="before">Antes del tratamiento</SelectItem>
                      <SelectItem value="progress">Durante el proceso</SelectItem>
                      <SelectItem value="after">Resultado final</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!file || isUploading}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {isUploading ? 'Subiendo...' : 'Subir imagen'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ImageUpload;