import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppointmentCardProps {
  date: Date;
  doctor: string;
  treatment: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  onReschedule?: () => void;
  onViewMap?: () => void;
  isUpcoming?: boolean;
}

const statusLabels = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada'
};

const statusColors = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  date,
  doctor,
  treatment,
  location,
  status,
  onReschedule,
  onViewMap,
  isUpcoming = false
}) => {
  // Format date and time strings
  const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: es });
  const formattedTime = format(date, 'HH:mm');
  
  // Check if appointment is today
  const isToday = new Date().toDateString() === date.toDateString();
  
  return (
    <Card className={`${isUpcoming ? 'bg-primary-50 border-primary-100' : 'bg-white'}`}>
      <CardContent className={`p-4 ${isUpcoming ? 'text-primary-800' : ''}`}>
        <div className="flex items-start">
          <div className="p-2 mr-4 bg-primary-100 text-primary-600 rounded-full">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isToday ? 'Hoy' : formattedDate}
                  <span className="font-bold ml-1">{formattedTime}</span>
                </p>
                <Badge
                  className={`mt-1 font-normal ${statusColors[status]}`}
                  variant="outline"
                >
                  {statusLabels[status]}
                </Badge>
              </div>
              
              {status !== 'completed' && status !== 'cancelled' && (
                <div className="ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => onReschedule && onReschedule()}
                  >
                    {isUpcoming ? 'Reprogramar' : 'Gestionar'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{doctor}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{treatment}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{location}</span>
              </div>
            </div>
            
            {onViewMap && isUpcoming && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-3 w-full"
                onClick={onViewMap}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Ver ubicación
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
