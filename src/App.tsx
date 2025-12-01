import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import UnmappedMoods from "./pages/admin/UnmappedMoods";
import Users from "./pages/admin/Users";
import Analytics from "./pages/admin/Analytics";
 
// Playlists page removed per request

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/analytics"
            element={
              <AdminLayout>
                <Analytics />
              </AdminLayout>
            }
          />
          
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <UnmappedMoods />
              </AdminLayout>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <Users />
              </AdminLayout>
            }
          />
          {/* /admin/playlists route removed */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
