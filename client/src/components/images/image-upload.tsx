import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onSuccess?: () => void;
  patientId?: number;
  treatmentId?: number | undefined;
}

export function ImageUpload({ onSuccess, patientId, treatmentId }: ImageUploadProps) {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageType, setImageType] = useState<string>("progress");
  const [title, setTitle] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      if (patientId) formData.append('patientId', patientId.toString());
      if (treatmentId) formData.append('treatmentId', treatmentId.toString());
      formData.append('imageType', imageType);
      formData.append('title', title);
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      setSelectedFiles([]);
      setTitle("");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Upload className="h-4 w-4 mr-1" />
          <span>Subir Imágenes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Imágenes de Tratamiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageType">Tipo de imagen</Label>
            <Select value={imageType} onValueChange={setImageType}>
              <SelectTrigger id="imageType">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Antes del tratamiento</SelectItem>
                <SelectItem value="progress">Durante el tratamiento</SelectItem>
                <SelectItem value="after">Después del tratamiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Añade un título para estas imágenes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Imágenes</Label>
            <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="images" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                <span className="text-sm font-medium text-neutral-900">Haz clic para seleccionar imágenes</span>
                <span className="text-xs text-neutral-500 mt-1">o arrastra y suelta aquí</span>
              </Label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Imágenes seleccionadas ({selectedFiles.length})</Label>
              <div className="grid grid-cols-3 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-20 w-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Subiendo...' : 'Subir imágenes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}