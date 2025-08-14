import React from "react";
import { Toaster as ToastUi } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout"
import { ProtectedRoute }   from '@/components/ProtectedRoute'
import { Dashboard } from "@/pages/Dashboard";
import { Overall } from "@/pages/Overall";
import { MasterData } from "@/pages/MasterData";
import Partners from "@/pages/Partners";
import { Brand } from "@/pages/extras/Brand";
import { Product } from "@/pages/extras/Product";
import { Bizdev } from "@/pages/extras/Bizdev";
import LoginPage from "@/pages/Login";
import { useAuth } from "./hooks/useAuth"
import NotFound from "./pages/NotFound";
import Spinner from "@/components/Spinner"


const queryClient = new QueryClient();

function PrivateRoute({ children }: {children: JSX.Element }) {
  const { session, loading } = useAuth();
  if (loading) return <Spinner />
  return session ? children : <Navigate to="/login" replace />;
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastUi />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />

                    <Route path="dashboard" element={<Dashboard />}/>
                    <Route path="overall" element={<Overall />}/>
                    <Route path="master-data" element={
                      <ProtectedRoute allowedRoles={['elevated']}>
                        <MasterData />
                      </ProtectedRoute>
                    }/>

                    <Route path="partners/:partnerSlug" element={<Partners />}/>

                    <Route path="extras/brand" element={<Brand />}/>
                    <Route path="extras/product" element={<Product />}/>
                    <Route path="extras/bizdev"element={<Bizdev />}/>
                    <Route path="*" element={<NotFound />}/>
                  </Routes>
                </Layout>
              </PrivateRoute>
            }/>
          </Routes>
          </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;