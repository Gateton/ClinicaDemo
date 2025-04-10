import Header from "./header";
import Sidebar from "./sidebar";
import { ReactNode } from "react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AuthenticatedLayout({ 
  children, 
  title, 
  description 
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <Header />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="heading text-2xl font-bold text-neutral-800">{title}</h1>
              {description && <p className="text-neutral-500 mt-1">{description}</p>}
            </div>
            
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
