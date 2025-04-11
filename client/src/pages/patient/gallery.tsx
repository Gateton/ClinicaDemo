import React, { useState, useRef } from 'react';
import PatientLayout from '@/components/layout/patient-layout';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Image, 
  CheckCircle, 
  Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TreatmentImage {
  id: number;
  patientTreatmentId: number;
  filename: string;
  title: string;
  type: 'before' | 'progress' | 'after';
  uploadedAt: Date;
  url: string;
}

interface Treatment {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
}

const PatientGallery = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('all');
  const [selectedImageType, setSelectedImageType] = useState<string>('all');
  const [currentImage, setCurrentImage] = useState<TreatmentImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Fetch patient treatments
  const { 
    data: treatments, 
    isLoading: isLoadingTreatments 
  } = useQuery<Treatment[]>({
    queryKey: ['/api/patient-treatments/me'],
    enabled: !!user,
  });

  // Fetch treatment images
  const { 
    data: images, 
    isLoading: isLoadingImages,
    error 
  } = useQuery<TreatmentImage[]>({
    queryKey: ['/api/images/me'],
    enabled: !!treatments && treatments.length > 0,
  });

  // Apply filters
  const filteredImages = images?.filter(image => {
    const matchesSearch = searchTerm === '' || 
      image.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTreatment = selectedTreatment === 'all' || 
      image.patientTreatmentId.toString() === selectedTreatment;
    
    const matchesType = selectedImageType === 'all' || 
      image.type === selectedImageType;
    
    return matchesSearch && matchesTreatment && matchesType;
  });

  // Group images by treatment
  const groupedImages = filteredImages?.reduce<Record<string, TreatmentImage[]>>((acc, image) => {
    const treatmentId = image.patientTreatmentId.toString();
    if (!acc[treatmentId]) {
      acc[treatmentId] = [];
    }
    acc[treatmentId].push(image);
    return acc;
  }, {});

  // Get treatment name by id
  const getTreatmentName = (id: number) => {
    return treatments?.find(t => t.id === id)?.name || 'Tratamiento desconocido';
  };

  // Get treatment status by id
  const getTreatmentStatus = (id: number) => {
    return treatments?.find(t => t.id === id)?.status || 'pending';
  };

  // Handle image navigation
  const handlePreviousImage = () => {
    if (!currentImage || !filteredImages) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === currentImage.id);
    if (currentIndex > 0) {
      setCurrentImage(filteredImages[currentIndex - 1]);
      resetZoomAndRotation();
    }
  };

  const handleNextImage = () => {
    if (!currentImage || !filteredImages) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === currentImage.id);
    if (currentIndex < filteredImages.length - 1) {
      setCurrentImage(filteredImages[currentIndex + 1]);
      resetZoomAndRotation();
    }
  };

  // Reset zoom and rotation
  const resetZoomAndRotation = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  // Format image type for display
  const formatImageType = (type: string) => {
    switch (type) {
      case 'before':
        return 'Antes';
      case 'progress':
        return 'Progreso';
      case 'after':
        return 'Después';
      default:
        return type;
    }
  };

  return (
    <PatientLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Galería de Imágenes</h1>
            <p className="text-neutral-600">Visualiza el progreso de tus tratamientos</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar imágenes..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select 
                value={selectedTreatment} 
                onValueChange={setSelectedTreatment}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tratamiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tratamientos</SelectItem>
                  {treatments?.map(treatment => (
                    <SelectItem key={treatment.id} value={treatment.id.toString()}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedImageType} 
                onValueChange={setSelectedImageType}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tipo de imagen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="before">Antes</SelectItem>
                  <SelectItem value="progress">Progreso</SelectItem>
                  <SelectItem value="after">Después</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Images Gallery */}
        {isLoadingImages || isLoadingTreatments ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error al cargar imágenes: {(error as Error).message}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        ) : filteredImages?.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <Image className="h-10 w-10 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No hay imágenes disponibles</h2>
            <p className="text-neutral-500 mb-4">
              {searchTerm || selectedTreatment !== 'all' || selectedImageType !== 'all'
                ? 'No se encontraron imágenes con los filtros seleccionados'
                : 'Aún no hay imágenes asociadas a tus tratamientos'}
            </p>
            {(searchTerm || selectedTreatment !== 'all' || selectedImageType !== 'all') && (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedTreatment('all');
                setSelectedImageType('all');
              }}>
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedImages || {}).map(([treatmentId, imgs]) => {
              const numericTreatmentId = parseInt(treatmentId);
              const treatmentName = getTreatmentName(numericTreatmentId);
              const treatmentStatus = getTreatmentStatus(numericTreatmentId);
              
              return (
                <div key={treatmentId}>
                  <div className="flex items-center mb-4">
                    <h2 className="text-lg font-semibold">{treatmentName}</h2>
                    <Badge 
                      className="ml-3"
                      variant="outline"
                      color={
                        treatmentStatus === 'completed' ? 'success' :
                        treatmentStatus === 'in_progress' ? 'warning' :
                        treatmentStatus === 'cancelled' ? 'destructive' : 'default'
                      }
                    >
                      {treatmentStatus === 'completed' ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Completado</span>
                        </div>
                      ) : treatmentStatus === 'in_progress' ? (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>En progreso</span>
                        </div>
                      ) : (
                        treatmentStatus
                      )}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imgs.map(image => (
                      <Card 
                        key={image.id} 
                        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setCurrentImage(image);
                          setIsDialogOpen(true);
                          resetZoomAndRotation();
                        }}
                      >
                        <div className="h-48 bg-neutral-100 relative">
                          <img 
                            src={`/api/uploads/${image.filename}`}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-black bg-opacity-50 text-white border-none">
                              {formatImageType(image.type)}
                            </Badge>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all group">
                            <ZoomIn className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium line-clamp-1">{image.title}</p>
                          <p className="text-xs text-neutral-500">
                            {format(new Date(image.uploadedAt), "d 'de' MMMM yyyy", { locale: es })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Image Viewer Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl p-0 bg-black h-[90vh] max-h-[90vh] flex flex-col">
            <DialogHeader className="p-4 text-white">
              <DialogTitle>{currentImage?.title}</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
              {currentImage && (
                <img 
                  src={`/api/uploads/${currentImage.filename}`}
                  alt={currentImage.title}
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{ 
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                />
              )}
              
              {/* Navigation buttons */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
                onClick={handlePreviousImage}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
                onClick={handleNextImage}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 bg-black bg-opacity-80 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white"
                    onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.1))}
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white"
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white"
                    onClick={() => setRotation(prev => prev - 90)}
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white"
                    onClick={() => setRotation(prev => prev + 90)}
                  >
                    <RotateCw className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="text-white text-sm space-x-4">
                  <span className="inline-flex items-center">
                    <Badge variant="outline" className="border-white text-white mr-2">
                      {formatImageType(currentImage?.type || '')}
                    </Badge>
                    {currentImage && format(new Date(currentImage.uploadedAt), "d 'de' MMMM yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  );
};

export default PatientGallery;
