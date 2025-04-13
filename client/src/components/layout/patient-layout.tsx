import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/ui/logo';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronDown, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Patient navigation items
const navItems = [
  { label: 'Mi Tratamiento', href: '/patient' },
  { label: 'Mis Citas', href: '/patient/appointments' },
  { label: 'Galería de Imágenes', href: '/patient/gallery' },
  { label: 'Mi Perfil', href: '/patient/profile' },
];

interface PatientLayoutProps {
  children: React.ReactNode;
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setLogoutDialogOpen(false);
  };

  // Get user's initials for avatar
  const userInitials = user?.fullName ? getInitials(user.fullName) : 'U';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-4 px-6 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/patient">
            <a>
              <Logo size="small" />
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a 
                  className={`text-sm ${
                    location === item.href 
                      ? 'text-primary-600 font-medium' 
                      : 'text-neutral-700 hover:text-primary-600'
                  }`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImage || undefined} />
                  <AvatarFallback className="bg-primary-100 text-primary-700">{userInitials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-neutral-800 hidden md:block">
                  {user?.fullName || 'Usuario'}
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/patient/profile"><a className="cursor-pointer">Mi Perfil</a></Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/patient"><a className="cursor-pointer">Mi Tratamiento</a></Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className="bg-white border-b border-neutral-200 shadow-sm md:hidden">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  location === item.href
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-neutral-500'
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-4">¿Cerrar sesión?</h2>
            <p className="text-muted-foreground mb-6">¿Está seguro que desea cerrar su sesión?</p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientLayout;
