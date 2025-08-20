import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { UserResponse, ItemsService, AvailableSettingsResponse } from "./lib/api";

// Base URL
import { OpenAPI } from './lib/api';
OpenAPI.BASE = '/api';

// UserContext Types
type UserContextType = {
  userInformation: UserResponse | null;
  setUserInformation: (id: UserResponse | null) => void;
};

// Settings Context Types
type SettingsContextType = {
  settings: AvailableSettingsResponse | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
};

// Create Contexts
const UserContext = createContext<UserContextType | undefined>(undefined);
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// User Context Hook
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext must be used within UserContextProvider");
  return context;
};

// Settings Context Hook
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettingsContext must be used within SettingsContextProvider");
  return context;
};

// User Context Provider
const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [userInformation, setUserInformation] = useState<UserResponse | null>(null);
  
  return (
    <UserContext.Provider value={{ userInformation, setUserInformation }}>
      {children}
    </UserContext.Provider>
  );
};

// Settings Context Provider
const SettingsContextProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AvailableSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ItemsService.getAvailableSettings();
      setSettings(response);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setError("Failed to load application settings");
      // Set default settings as fallback
      setSettings({
        availableImageModels: [
          {
            imageModelId: 1,
            name: "Default Model",
            description: "Default image generation model",
            disabled: false
          }
        ],
        availableDrawingStyles: [
          {
            drawingStyleId: 2,
            name: "Cartoon",
            description: "Animated cartoon-style rendering",
            disabled: false
          }
        ],
        colorBlindOptions: [
          {
            colorBlindOptionId: 1,
            name: "None",
            description: "No color adjustments applied"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserContextProvider>
      <SettingsContextProvider>
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
      </SettingsContextProvider>
    </UserContextProvider>
  </QueryClientProvider>
);

export default App;