import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Bell, ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  
  if (!user) return null;
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="ml-2 heading font-semibold text-neutral-800 text-lg">Delica Dental</span>
            </div>
          </div>
          
          {/* Right side navigation items */}
          <div className="flex items-center">
            {/* Notifications */}
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full text-neutral-500 hover:text-primary hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 relative">
                  <span className="sr-only">Ver notificaciones</span>
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-2 border-b border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-900">Notificaciones</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {/* Sample notifications - in a real app, these would come from a data source */}
                  <div className="px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                          <Bell className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-neutral-900">No hay notificaciones</p>
                        <p className="text-sm text-neutral-500">Las notificaciones aparecerán aquí</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-neutral-200 text-center">
                  <button className="text-xs font-medium text-primary hover:text-primary/80">
                    Ver todas las notificaciones
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Profile Dropdown */}
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <span className="sr-only">Abrir menu de usuario</span>
                    <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-sm font-medium text-primary-700">
                      {getInitials(user.fullName)}
                    </div>
                    <span className="ml-2 text-sm font-medium text-neutral-700 hidden sm:block">{user.fullName}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-neutral-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => {}}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Tu perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => {}}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Ayuda</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
