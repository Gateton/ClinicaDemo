import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ProfileDropdown } from "@/components/shared/profile-dropdown";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import {
  Home,
  Calendar,
  Torus,
  Images,
  User,
  Settings,
  Menu,
  X
} from "lucide-react";

type PatientLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export function PatientLayout({ children, title = "Mi Portal", subtitle = "Bienvenido a tu portal de paciente de Delica Dental." }: PatientLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { href: "/patient", label: "Panel Principal", icon: Home },
    { href: "/patient/appointments", label: "Mis Citas", icon: Calendar },
    { href: "/patient/treatment", label: "Mi Tratamiento", icon: Torus },
    { href: "/patient/images", label: "Mis Imágenes", icon: Images },
    { href: "/patient/profile", label: "Mi Perfil", icon: User },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle sidebar</span>
              </Button>
              
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/patient">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white font-bold">D</span>
                  </div>
                </Link>
                <span className="ml-2 font-medium text-neutral-800 text-lg hidden sm:block">
                  Delica Dental
                </span>
              </div>
            </div>
            
            {/* Right side navigation items */}
            <div className="flex items-center">
              {/* Notifications */}
              <NotificationsDropdown />
              
              {/* Profile Dropdown */}
              <ProfileDropdown user={user} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="w-64 bg-white shadow-sm hidden md:block overflow-y-auto">
          <div className="px-4 pt-6 pb-4">
            {/* Patient Portal Title */}
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Portal del Paciente
            </h2>
            
            {/* Navigation Links */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                        isActive(item.href)
                          ? "text-primary bg-primary-50"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mr-3 ${
                          isActive(item.href)
                            ? "text-primary"
                            : "text-neutral-400 group-hover:text-primary"
                        }`}
                      />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-neutral-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-white shadow-lg">
              <div className="px-4 pt-6 pb-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span className="ml-2 font-medium text-neutral-800">Delica Dental</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <a
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                            isActive(item.href)
                              ? "text-primary bg-primary-50"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-primary"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon
                            className={`w-5 h-5 mr-3 ${
                              isActive(item.href)
                                ? "text-primary"
                                : "text-neutral-400 group-hover:text-primary"
                            }`}
                          />
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
              <p className="text-neutral-500 mt-1">{subtitle}</p>
            </div>
            
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
