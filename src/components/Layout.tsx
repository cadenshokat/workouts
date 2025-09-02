import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import LogoutButton from '@/components/LogoutButton'
import { Button } from "@/components/ui/button"
import { Settings as SettingsIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useAuth } from "@/hooks/useAuth";

function HeaderTrigger() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <div className={`${collapsed ? "ml-14" : "ml-52"} flex items-center`}>
      <SidebarTrigger className="text-gray-600 hover:text-primary" />
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/settings") setSettingsOpen(true);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmdOrCtrl = e.metaKey || e.ctrlKey;
      if (cmdOrCtrl && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSettingsChange = (open: boolean) => {
    setSettingsOpen(open);
    if (!open && location.pathname === "/settings") {
      if (window.history.length > 1) navigate(-1);
      else navigate("/dashboard");
    }
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-white w-full">
         <header className="sticky top-0 z-10 h-16 flex items-center justify-between border-b border-gray-200 bg-white px-6 w-full">
          <HeaderTrigger />
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex justify-center items-center gap-2">
                
                {role == 'elevated' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSettingsOpen(true)}
                    title="Settings (⌘/,)"
                    className="rounded-xl"
                  >
                    <SettingsIcon className="h-7 w-7" />
                  </Button>
                )}
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            { children }
          </main>
        </div>
        <SettingsDialog open={settingsOpen} onOpenChange={handleSettingsChange} />
      </div>
    </SidebarProvider>
  );
}
