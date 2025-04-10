import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/images/image-upload";
import { Search, Plus, Download, Trash2, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface TreatmentImage {
  id: number;
  imageUrl: string;
  patientId: number;
  patientName: string;
  patientInitials: string;
  treatmentId: number;
  treatmentName: string;
  imageType: 'before' | 'after' | 'treatment';
  date: string;
  description?: string;
  isVisibleToPatient: boolean;
}

export default function AdminImages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'before' | 'after' | 'treatment'>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<TreatmentImage | null>(null);
  const [selectedImagesIds, setSelectedImagesIds] = useState<number[]>([]);

  const { data: images, isLoading } = useQuery<TreatmentImage[]>({
    queryKey: ['/api/images', filter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('filter', filter);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/images?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch images');
      return res.json();
    },
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    // The search is already handled by the dependency in the useQuery hook
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const getImageTypeBadge = (type: TreatmentImage['imageType']) => {
    switch (type) {
      case 'before':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Antes</Badge>;
      case 'after':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Después</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Tratamiento</Badge>;
    }
  };

  const handleViewImage = (image: TreatmentImage) => {
    setSelectedImage(image);
  };

  const toggleImageSelection = (imageId: number) => {
    setSelectedImagesIds(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (!images) return;
    
    if (selectedImagesIds.length === images.length) {
      // Deselect all
      setSelectedImagesIds([]);
    } else {
      // Select all
      setSelectedImagesIds(images.map(img => img.id));
    }
  };

  const handleDeleteSelected = () => {
    // Implementation for deleting selected images
    console.log('Deleting images:', selectedImagesIds);
    setSelectedImagesIds([]);
  };

  return (
    <AdminLayout title="Imágenes" subtitle="Gestiona las imágenes de tratamientos de tus pacientes.">
      {/* Filter and actions bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <Tabs 
            value={filter} 
            onValueChange={(value) => setFilter(value as 'all' | 'before' | 'after' | 'treatment')}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="before">Antes</TabsTrigger>
              <TabsTrigger value="after">Después</TabsTrigger>
              <TabsTrigger value="treatment">Tratamiento</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <form onSubmit={handleSearch} className="w-full sm:w-auto flex-grow max-w-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Buscar imágenes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedImagesIds.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                Eliminar ({selectedImagesIds.length})
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Descargar ({selectedImagesIds.length})
              </Button>
            </>
          )}
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Subir Imágenes
          </Button>
        </div>
      </div>

      {/* Images gallery */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="relative">
                  <AspectRatio ratio={1}>
                    <Skeleton className="w-full h-full rounded-lg" />
                  </AspectRatio>
                </div>
              ))}
            </div>
          ) : images && images.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Checkbox
                    id="select-all"
                    checked={images.length > 0 && selectedImagesIds.length === images.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="ml-2 text-sm text-neutral-700">
                    Seleccionar todas ({images.length})
                  </label>
                </div>
                {selectedImagesIds.length > 0 && (
                  <p className="text-sm text-neutral-500">{selectedImagesIds.length} imágenes seleccionadas</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="group relative">
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox
                        id={`image-${image.id}`}
                        checked={selectedImagesIds.includes(image.id)}
                        onCheckedChange={() => toggleImageSelection(image.id)}
                        className="bg-white data-[state=checked]:bg-primary"
                      />
                    </div>
                    <AspectRatio ratio={1} className="rounded-lg overflow-hidden bg-neutral-200">
                      <img 
                        src={image.imageUrl} 
                        alt={`Imagen de ${image.patientName} - ${image.treatmentName}`} 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute inset-x-0 bottom-0 p-3">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-white font-medium truncate">{image.patientName}</p>
                              <p className="text-xs text-white/80 truncate">{image.treatmentName}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 border-0 text-white"
                              onClick={() => handleViewImage(image)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        {getImageTypeBadge(image.imageType)}
                      </div>
                    </AspectRatio>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-500">No se encontraron imágenes para el filtro seleccionado.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Subir primeras imágenes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subir Imágenes</DialogTitle>
          </DialogHeader>
          <ImageUpload onSuccess={() => setIsUploadDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* View Image Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Imagen de Tratamiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-neutral-200 max-h-[500px] flex justify-center">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={`Imagen de ${selectedImage.patientName} - ${selectedImage.treatmentName}`} 
                  className="object-contain max-h-[500px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Paciente</p>
                  <div className="flex items-center mt-1">
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
                      {selectedImage.patientInitials}
                    </div>
                    <p className="ml-2 text-sm font-medium text-neutral-900">{selectedImage.patientName}</p>
                  </div>
                </div>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Tratamiento</p>
                  <p className="text-sm font-medium text-neutral-900 mt-1">{selectedImage.treatmentName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Tipo de Imagen</p>
                  <div className="mt-1">{getImageTypeBadge(selectedImage.imageType)}</div>
                </div>
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Fecha</p>
                  <p className="text-sm font-medium text-neutral-900 mt-1">{formatDate(selectedImage.date)}</p>
                </div>
              </div>
              
              {selectedImage.description && (
                <div className="bg-neutral-50 p-3 rounded-lg">
                  <p className="text-xs text-neutral-500">Descripción</p>
                  <p className="text-sm text-neutral-900 mt-1">{selectedImage.description}</p>
                </div>
              )}
              
              <div className="flex justify-between space-x-2 pt-4">
                <div className="flex items-center">
                  <Checkbox
                    id="visible-to-patient"
                    checked={selectedImage.isVisibleToPatient}
                    disabled
                  />
                  <label htmlFor="visible-to-patient" className="ml-2 text-sm text-neutral-700">
                    Visible para el paciente
                  </label>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-1" /> Descargar
                  </Button>
                  <Button variant="outline" className="text-red-500">
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                  <Button onClick={() => setSelectedImage(null)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
