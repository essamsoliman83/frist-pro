
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { CreateRecord } from "@/components/CreateRecord";
import { SearchRecords } from "@/components/SearchRecords";
import { UserManagement } from "@/components/UserManagement";
import { Reports } from "@/components/Reports";
import { BackupRestore } from "@/components/BackupRestore";
import NotFound from "./pages/NotFound";
import { ViolationManagement } from "@/components/ViolationManagement";
import { RecordView } from "@/components/RecordView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create-record" element={<CreateRecord />} />
              <Route path="/search-records" element={<SearchRecords />} />
              <Route path="/record-view" element={<RecordView />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/backup-restore" element={<BackupRestore />} />
              <Route path="/violation-management" element={<ViolationManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
