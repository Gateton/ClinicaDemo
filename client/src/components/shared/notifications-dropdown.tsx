import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock query for notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: () => Promise.resolve([]), // Empty array since we're not implementing this functionality yet
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to determine icon for notification type
  const getNotificationIcon = (icon: string) => {
    switch (icon) {
      case 'calendar':
        return <i className="fas fa-calendar-alt"></i>;
      case 'check':
        return <i className="fas fa-check-circle"></i>;
      case 'user':
        return <i className="fas fa-user-plus"></i>;
      default:
        return <i className="fas fa-bell"></i>;
    }
  };

  // Has unread notifications
  const hasUnread = notifications.some(notification => !notification.read);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        className="p-2 rounded-full text-neutral-500 hover:text-primary hover:bg-neutral-100 focus:outline-none relative"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Ver notificaciones</span>
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-2 border-b border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-900">Notificaciones</h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-neutral-500">
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <a 
                  key={notification.id} 
                  href="#" 
                  className="block px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle notification click
                  }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full ${notification.iconBg} flex items-center justify-center ${notification.iconColor}`}>
                        {getNotificationIcon(notification.icon)}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                      <p className="text-sm text-neutral-500">{notification.message}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatDistanceToNow(notification.timestamp, { 
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-neutral-200 text-center">
              <a href="#" className="text-xs font-medium text-primary hover:text-primary-500">
                Ver todas las notificaciones
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
