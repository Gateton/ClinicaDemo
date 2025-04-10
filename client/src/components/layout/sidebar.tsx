import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Home, 
  UserPlus, 
  Calendar, 
  Torus, 
  Image, 
  User, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  if (!user) return null;
  
  const isAdmin = user.role === "admin" || user.role === "staff";
  
  const adminNavItems = [
    { name: "Panel Principal", href: "/", icon: Home },
    { name: "Pacientes", href: "/patients", icon: UserPlus },
    { name: "Citas", href: "/appointments", icon: Calendar },
    { name: "Tratamientos", href: "/treatments", icon: Torus },
    { name: "Imágenes", href: "/images", icon: Image },
    { name: "Personal", href: "/staff", icon: User },
    { name: "Configuración", href: "/settings", icon: Settings }
  ];
  
  const patientNavItems = [
    { name: "Panel Principal", href: "/", icon: Home },
    { name: "Mi Tratamiento", href: "/treatment-progress", icon: Torus },
    { name: "Mis Citas", href: "/appointments", icon: Calendar },
    { name: "Mis Imágenes", href: "/images", icon: Image }
  ];
  
  const navItems = isAdmin ? adminNavItems : patientNavItems;
  
  return (
    <aside className="w-64 bg-white shadow-sm hidden md:block overflow-y-auto">
      <div className="px-4 pt-6 pb-4">
        {/* Admin Title */}
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          {isAdmin ? "Panel Administrativo" : "Portal del Paciente"}
        </h2>
        
        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <a 
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation(item.href);
                }}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md group",
                  isActive 
                    ? "text-primary bg-primary-50" 
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                )}
              >
                <item.icon className={cn(
                  "w-6 mr-3",
                  isActive ? "text-primary" : "text-neutral-400 group-hover:text-primary"
                )} />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
