import { User, Menu, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserContext } from "@/App";
import { useState, useEffect } from "react";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { userInformation, setUserInformation } = useUserContext();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const onLogout = () => {
    setUserInformation(null);
    setDropdownOpen(false); // Close dropdown when logging out
  };

  const onProfile = () => {
    setDropdownOpen(false); 
    setTimeout(() => {
      setShowProfileDialog(true);
    }, 100);
  };

  const onSettings = () => {
    setDropdownOpen(false); 
    console.log("Settings clicked");
  };

  // Clean up any potential stuck states
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileDialog(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle dialog close with additional cleanup
  const handleDialogClose = (open: boolean) => {
    setShowProfileDialog(open);
    if (!open) {
      // Force focus return and cleanup
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }, 50);
    }
  };

  return (
    <>
      <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu />
          </Button>
          <h1 className="font-semibold text-lg">Sketchtale</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProfile}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={showProfileDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <UserCircle className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardTitle>{userInformation?.name || "User Name"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Username</div>
                <div className="text-sm">{userInformation?.userName || "username"}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Account Created</div>
                <div className="text-sm">{userInformation?.accountCreated || "N/A"}</div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;