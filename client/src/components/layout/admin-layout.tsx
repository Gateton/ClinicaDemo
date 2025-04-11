import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/ui/logo';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  UserCog,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Admin sidebar navigation items
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Calendar, label: 'Citas', href: '/admin/appointments' },
  { icon: Users, label: 'Pacientes', href: '/admin/patients' },
  { icon: Stethoscope, label: 'Tratamientos', href: '/admin/treatments' },
  { icon: UserCog, label: 'Personal', href: '/admin/staff' },
  { icon: BarChart3, label: 'Reportes', href: '#reports' },
  { icon: Settings, label: 'Configuración', href: '#settings' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="bg-neutral-900 text-white w-64 flex-shrink-0 hidden md:flex flex-col h-full">
        <div className="p-4 border-b border-neutral-700 flex items-center space-x-3">
          <Logo size="small" className="text-white" />
        </div>
        
        <div className="px-3 py-4 flex-1 overflow-y-auto">
          <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Principal</p>
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                className={`flex items-center text-neutral-300 p-2 rounded-md mb-1 ${
                  location === item.href ? 'bg-primary-700 text-neutral-100' : 'hover:bg-neutral-800'
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
          
          <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mt-6 mb-2">Administración</p>
          {navItems.slice(4).map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                className={`flex items-center text-neutral-300 p-2 rounded-md mb-1 ${
                  location === item.href ? 'bg-primary-700 text-neutral-100' : 'hover:bg-neutral-800'
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-primary-700">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium" data-bind="currentUser.name">{user?.fullName}</p>
              <p className="text-xs text-neutral-400" data-bind="currentUser.role">
                {user?.role === 'admin' ? 'Administrador' : 'Personal'}
              </p>
            </div>
            <button 
              className="ml-auto text-neutral-400 hover:text-white"
              onClick={() => setLogoutDialogOpen(true)}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="bg-neutral-900 text-white w-full h-16 md:hidden flex items-center px-4 shadow-md fixed top-0 z-50">
        <button className="text-white p-1 focus:outline-none" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <div className="ml-4 flex items-center">
          <Logo size="small" className="text-white" />
        </div>
        <div className="ml-auto">
          <Avatar onClick={() => setLogoutDialogOpen(true)}>
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="bg-primary-700">{userInitials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-neutral-900 z-40 transform transition-transform duration-300 md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
          <Logo size="small" className="text-white" />
          <button className="text-white p-1" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="px-3 py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                className={`flex items-center text-neutral-300 p-2 rounded-md mb-1 ${
                  location === item.href ? 'bg-primary-700 text-neutral-100' : 'hover:bg-neutral-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
          <a 
            href="#" 
            className="flex items-center text-neutral-300 p-2 rounded-md hover:bg-neutral-800 mt-4"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              setLogoutDialogOpen(true);
            }}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-neutral-50">
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

export default AdminLayout;
