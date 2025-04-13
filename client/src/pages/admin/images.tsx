import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout"; // Changed from named import to default import
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Removed the ImageUpload import as it doesn't exist yet
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
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Imágenes</h1>
          <p className="text-neutral-600">Gestiona las imágenes de tratamientos de tus pacientes.</p>
        </div>
        </div>
        
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
    </AdminLayout>
  );
}
