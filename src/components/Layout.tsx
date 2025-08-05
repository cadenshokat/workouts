import React, { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import LogoutButton from '@/components/LogoutButton'
import { Separator } from "@/components/ui/separator"
import { useAllPartners } from "@/hooks/useAllPartners";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronLeft, ChevronRight, Table as TableIcon, ChartBar, Menu } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-white w-full">
         <header className="sticky top-0 z-10 h-16 flex items-center justify-between border-b border-gray-200 bg-white px-6 w-full">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-gray-600 hover:text-primary" />
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}logo.svg`}
                alt="Logo"
                className="h-11 w-11 rounded-full border border-gray-200"
              />
            </div>
            <div className="h-6 w-px bg-gray-200 ml-4" />
            <span className="text-sm text-gray-500"></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex justify-center items-center gap-2">
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
      </div>
    </SidebarProvider>
  );
}
