import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';

interface ProfileDropdownProps {
  user: any | null;
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { logoutMutation } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  // Generate initials from user's full name or username
  const getInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="ml-3 relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open user menu</span>
        <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-sm font-medium text-primary-700">
          {getInitials()}
        </div>
        <span className="ml-2 text-sm font-medium text-neutral-700 hidden sm:block">
          {user.fullName || user.username}
        </span>
        <ChevronDown className="ml-1 h-4 w-4 text-neutral-400" />
      </Button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
          <Link href={user.role === 'admin' ? '/admin/profile' : '/patient/profile'}>
            <a 
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Tu perfil
            </a>
          </Link>
          <Link href={user.role === 'admin' ? '/admin/settings' : '/patient/settings'}>
            <a 
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </a>
          </Link>
          <Link href="/help">
            <a 
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Ayuda
            </a>
          </Link>
          <div className="border-t border-neutral-200"></div>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      )}
    </div>
  );
}
