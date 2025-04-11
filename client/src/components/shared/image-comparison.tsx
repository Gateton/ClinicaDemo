import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface TreatmentImage {
  id: number;
  title: string;
  type: 'before' | 'progress' | 'after';
  url: string;
  uploadedAt: Date;
}

interface ImageComparisonProps {
  beforeImage?: TreatmentImage;
  progressImage?: TreatmentImage;
  afterImage?: TreatmentImage;
  treatmentName: string;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  beforeImage,
  progressImage,
  afterImage,
  treatmentName
}) => {
  const [selectedImage, setSelectedImage] = useState<TreatmentImage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // If no images, show placeholder
  if (!beforeImage && !progressImage && !afterImage) {
    return (
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{treatmentName} - Sin imágenes</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          No hay imágenes disponibles para este tratamiento.
        </CardContent>
      </Card>
    );
  }
  
  // Get default tab based on available images
  const getDefaultTab = () => {
    if (beforeImage && afterImage) return 'comparison';
    if (progressImage) return 'progress';
    if (beforeImage) return 'before';
    if (afterImage) return 'after';
    return 'comparison';
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-medium">{treatmentName} - Comparativa</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue={getDefaultTab()}>
          <TabsList className="mb-4 w-full">
            {(beforeImage && afterImage) && (
              <TabsTrigger value="comparison">Comparación</TabsTrigger>
            )}
            {beforeImage && (
              <TabsTrigger value="before">Antes</TabsTrigger>
            )}
            {progressImage && (
              <TabsTrigger value="progress">Progreso</TabsTrigger>
            )}
            {afterImage && (
              <TabsTrigger value="after">Después</TabsTrigger>
            )}
          </TabsList>
          
          {/* Comparison View (Before/After) */}
          {(beforeImage && afterImage) && (
            <TabsContent value="comparison">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <div 
                      className="border border-neutral-200 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(beforeImage)}
                    >
                      <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                        <span className="text-xs font-medium text-neutral-700">{beforeImage.title}</span>
                        <span className="text-xs text-neutral-500">
                          {format(beforeImage.uploadedAt, 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="p-2 relative group">
                        <img 
                          src={beforeImage.url} 
                          alt="Antes del tratamiento" 
                          className="w-full h-48 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="sm:max-w-4xl p-0 bg-black">
                    {selectedImage && (
                      <div className="p-4">
                        <img 
                          src={selectedImage.url} 
                          alt={selectedImage.title} 
                          className="max-h-[80vh] w-auto mx-auto"
                        />
                        <div className="flex justify-between items-center mt-2 text-white">
                          <h3 className="text-lg font-medium">{selectedImage.title}</h3>
                          <span className="text-sm">
                            {format(selectedImage.uploadedAt, "d 'de' MMMM yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <div 
                      className="border border-neutral-200 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(afterImage)}
                    >
                      <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                        <span className="text-xs font-medium text-neutral-700">{afterImage.title}</span>
                        <span className="text-xs text-neutral-500">
                          {format(afterImage.uploadedAt, 'dd/MM/yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="p-2 relative group">
                        <img 
                          src={afterImage.url} 
                          alt="Después del tratamiento" 
                          className="w-full h-48 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                </Dialog>
              </div>
            </TabsContent>
          )}
          
          {/* Before View */}
          {beforeImage && (
            <TabsContent value="before">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden cursor-pointer">
                    <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                      <span className="text-xs font-medium text-neutral-700">{beforeImage.title}</span>
                      <span className="text-xs text-neutral-500">
                        {format(beforeImage.uploadedAt, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="p-2 relative group">
                      <img 
                        src={beforeImage.url} 
                        alt="Antes del tratamiento" 
                        className="w-full h-64 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
              </Dialog>
            </TabsContent>
          )}
          
          {/* Progress View */}
          {progressImage && (
            <TabsContent value="progress">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden cursor-pointer">
                    <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                      <span className="text-xs font-medium text-neutral-700">{progressImage.title}</span>
                      <span className="text-xs text-neutral-500">
                        {format(progressImage.uploadedAt, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="p-2 relative group">
                      <img 
                        src={progressImage.url} 
                        alt="Progreso del tratamiento" 
                        className="w-full h-64 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
              </Dialog>
            </TabsContent>
          )}
          
          {/* After View */}
          {afterImage && (
            <TabsContent value="after">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden cursor-pointer">
                    <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200 flex justify-between items-center">
                      <span className="text-xs font-medium text-neutral-700">{afterImage.title}</span>
                      <span className="text-xs text-neutral-500">
                        {format(afterImage.uploadedAt, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="p-2 relative group">
                      <img 
                        src={afterImage.url} 
                        alt="Después del tratamiento" 
                        className="w-full h-64 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
              </Dialog>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImageComparison;
