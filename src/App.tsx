import { createContext, useContext, useState, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { UserResponse } from "./lib/api";
// Somewhere in your generated API client or where you initialize it
import { OpenAPI } from './lib/api';

// Set the base URL
OpenAPI.BASE = 'http://localhost:8080';

// UserContext Context
type UserContextType = {
  userInformation: UserResponse | null;
  setUserInformation: (id: UserResponse | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within UserContextProvider");
  return context;
};

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const testUser: UserResponse = {
    userId: "testUserId",
    userName: "testUser",
    name: "Test User",
    accountCreated: "2023-10-01T12:00:00Z",
  }
  
  const [userInformation, setUserInformation] = useState<UserResponse | null>(null);
  return (
    <UserContext.Provider value={{ userInformation, setUserInformation }}>
      {children}
    </UserContext.Provider>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserContextProvider>
  </QueryClientProvider>
);

export default App;
