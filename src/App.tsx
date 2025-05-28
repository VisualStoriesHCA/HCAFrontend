import { createContext, useContext, useState, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { UserDetailsResponse } from "./lib/api";

// UserContext Context
type UserContextType = {
  userInformation: UserDetailsResponse | null;
  setUserInformation: (id: UserDetailsResponse | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within UserContextProvider");
  return context;
};

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const testUser: UserDetailsResponse = {
    userId: "testUserId",
    userName: "testUser",
    name: "Test User",
    accountCreated: "2023-10-01T12:00:00Z",
  }
  
  const [userInformation, setUserInformation] = useState<UserDetailsResponse | null>(testUser);
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
