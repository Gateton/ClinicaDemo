import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { ImageUpload } from '@/components/images/image-upload';
import { useState } from 'react';

interface TreatmentImage {
  id: number;
  imageUrl: string;
  patientName: string;
  patientInitials: string;
  treatmentName: string;
  date: string;
}

interface TreatmentImagesProps {
  limit?: number;
  showLink?: boolean;
  showUpload?: boolean;
  patientId?: number;
}

export function TreatmentImages({ limit = 6, showLink = true, showUpload = true, patientId }: TreatmentImagesProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const queryKey = patientId
    ? ['/api/patients', patientId, 'images']
    : ['/api/images/recent'];

  const { data: images, isLoading } = useQuery<TreatmentImage[]>({
    queryKey,
    queryFn: async () => {
      let url = '/api/images/recent';
      if (patientId) {
        url = `/api/patients/${patientId}/images`;
      }
      if (limit) {
        url += `?limit=${limit}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    },
  });

  const linkPath = patientId ? `/patient/images` : `/admin/images`;
  const title = patientId ? 'Mis Imágenes de Tratamiento' : 'Imágenes Recientes de Tratamientos';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
          <div className="flex space-x-2">
            {showUpload && (
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Upload size={16} /> Subir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subir nueva imagen</DialogTitle>
                  </DialogHeader>
                  <ImageUpload 
                    patientId={patientId} 
                    onSuccess={() => setIsUploadDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
            {showLink && (
              <Link href={linkPath}>
                <Button variant="link" className="text-sm text-primary hover:text-primary-500 p-0">Ver todas</Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="relative">
                <AspectRatio ratio={1}>
                  <Skeleton className="w-full h-full rounded-lg" />
                </AspectRatio>
              </div>
            ))}
          </div>
        ) : images && images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image) => (
              <Link key={image.id} href={`/admin/images/${image.id}`}>
                <div className="group relative cursor-pointer">
                  <AspectRatio ratio={1} className="rounded-lg overflow-hidden bg-neutral-200">
                    <img 
                      src={image.imageUrl} 
                      alt={`Imagen de tratamiento dental para ${image.patientName}`} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <div className="p-2 w-full">
                        <p className="text-xs text-white truncate">{image.patientName} - {image.treatmentName}</p>
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-neutral-500">No hay imágenes disponibles.</p>
            {showUpload && (
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    <Upload size={16} className="mr-2" /> Subir primera imagen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subir nueva imagen</DialogTitle>
                  </DialogHeader>
                  <ImageUpload 
                    patientId={patientId} 
                    onSuccess={() => setIsUploadDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
