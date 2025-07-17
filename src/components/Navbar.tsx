import { User, Menu, LogOut, Settings, UserCircle, Trophy, Info, BookOpen } from "lucide-react";
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
import { ItemsService } from "@/lib/api";
import Achievements from "@/components/Achievements";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { userInformation, setUserInformation } = useUserContext();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAchievementsDialog, setShowAchievementsDialog] = useState(false);
  const [showTutorialDialog, setShowTutorialDialog] = useState(false);
  const [showPoliciesDialog, setShowPoliciesDialog] = useState(false);
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
    setTimeout(() => {
      setShowSettingsDialog(true);
    }, 100);
  };

  const onAchievements = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setShowAchievementsDialog(true);
    }, 100);
  };

  const onTutorial = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setShowTutorialDialog(true);
    }, 100);
  };

  const onPolicies = () => {
    setDropdownOpen(false);
    setTimeout(() => {
      setShowPoliciesDialog(true);
    }, 100);
  };

  // Clean up any potential stuck states
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileDialog(false);
        setShowAchievementsDialog(false);
        setShowTutorialDialog(false);
        setShowPoliciesDialog(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleShowProfileDialogClose = (open: boolean) => {
    setShowProfileDialog(open);
    handleGenericDialogClose(open);
  };

  const handleSettingsDialogClose = (open: boolean) => {
    setShowSettingsDialog(open);
    handleGenericDialogClose(open);
  }

  const handleAchievementsDialogClose = (open: boolean) => {
    setShowAchievementsDialog(open);
    handleGenericDialogClose(open);
  };

  const handleTutorialDialogClose = (open: boolean) => {
    setShowTutorialDialog(open);
    handleGenericDialogClose(open);
  };

  const handlePoliciesDialogClose = (open: boolean) => {
    setShowPoliciesDialog(open);
    handleGenericDialogClose(open);
  };

  // Handle dialog close with additional cleanup
  const handleGenericDialogClose = (open: boolean) => {
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

  const handleDeleteUser = async () => {
    try{
      await ItemsService.deleteUser({userId: userInformation?.userId });
      setUserInformation(null);
      console.log("User deleted successfully");
      setShowSettingsDialog(false);
    }
    catch (error) {
      console.error("Error deleting user:", error);
    }
  }

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
              <DropdownMenuItem onClick={onTutorial}>
                <BookOpen className="mr-2 h-4 w-4" />
                Tutorial
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onPolicies}>
                <Info className="mr-2 h-4 w-4" />
                Generation Policies
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProfile}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAchievements}>
                <Trophy className="mr-2 h-4 w-4" />
                Achievements
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

      <Dialog open={showTutorialDialog} onOpenChange={handleTutorialDialogClose}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Tutorial
            </DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Writing a Story → Generating Images</h3>
                <p className="text-sm text-muted-foreground">
                  Users can start by writing a story or a short narrative idea. Once the text is submitted, the system generates corresponding images that visualize key scenes using the selected drawing style and accessibility options. These images can then be edited or used to guide further story development.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Uploading or Drawing an Image → Generating Stories</h3>
                <p className="text-sm text-muted-foreground">
                  Users can also begin by uploading an existing image or drawing a sketch on the platform. The system interprets the visual input and generates a narrative that reflects its content. This enables users to express ideas visually and have the system translate them into language.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Editing Text and Regenerating Images</h3>
                <p className="text-sm text-muted-foreground">
                  The platform supports dynamic storytelling. If users edit the story—changing the plot, characters, or setting—the system intelligently identifies affected visual elements and regenerates images to reflect the updated narrative, while maintaining previously generated visual context where possible.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Editing Images and Regenerating Text</h3>
                <p className="text-sm text-muted-foreground">
                  Similarly, if users draw over an image or upload a new version, the system updates the associated story accordingly. It selectively rewrites only the parts of the story that need to change, preserving tone and coherence while aligning with the new visual content.
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={showPoliciesDialog} onOpenChange={handlePoliciesDialogClose}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Generation Policies
            </DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. Compliance with OpenAI's Usage Policies</h3>
                <p className="text-sm text-muted-foreground">
                  All ChatGPT and Sora users have agreed to OpenAI's Usage Policies, Service Terms, and Terms of Use. These policies apply universally to OpenAI services and are designed to ensure safe and responsible usage of AI technology. You can review OpenAI's Usage Policies{' '}
                  <a 
                    href="https://openai.com/policies/creating-images-and-videos-in-line-with-our-policies/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    here
                  </a>.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold">1.1 Depictions of Real People</h4>
                <p className="text-sm text-muted-foreground">
                  You may not edit images or videos that depict any real individual without their explicit consent. You may not create images or videos as means to impersonate, harass, intimidate, or otherwise harm the depicted individual or perpetrate fraud against others. Editing uploaded images or videos that contain real people under the age of 18 is not permitted.
                </p>
                <p className="text-sm text-muted-foreground">
                  4o image generation is capable in many instances of generating depictions of a public figure based on a text prompt. Public figures who wish for their depiction not to be generated can let us know through this form.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold">1.2 Inappropriate and Harmful Content</h4>
                <p className="text-sm text-muted-foreground">
                  ChatGPT and Sora users are prohibited from creating or distributing content that promotes or causes harm. This includes content that is generated to harass, defame, promote violence, or sexualize children. Examples include, but are not limited to:
                </p>
                <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                  <li>• Non-consensual intimate imagery (NCII)</li>
                  <li>• Content promoting suicide, self-harm or disordered eating</li>
                  <li>• Content glorifying terrorism or terrorist organizations</li>
                  <li>• Age-inappropriate content distributed to minors</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold">1.3 Misleading Content</h4>
                <p className="text-sm text-muted-foreground">
                  Our policies prohibit any use of our image or video tools to create or distribute content that is used to defraud, scam, or mislead others. This includes taking steps to obscure or hide the use of AI technology in the image and video generation process.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold">1.4 Avoid illegal content or content that may violate intellectual property rights</h4>
                <p className="text-sm text-muted-foreground">
                  OpenAI's Terms of Use prohibit any content that may violate the law—including using the intellectual property of others in ways that violate their rights.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. Reporting Violations</h3>
                <p className="text-sm text-muted-foreground">
                  If you encounter content that you believe violates any of our policies, please report it immediately. We take all violations seriously and will review reported content for compliance with our terms and the broader OpenAI Usage Policies.
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileDialog} onOpenChange={handleShowProfileDialogClose}>
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

      <Dialog open={showAchievementsDialog} onOpenChange={handleAchievementsDialogClose}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </DialogTitle>
          </DialogHeader>
          <Achievements userId={userInformation?.userId} />
        </DialogContent>
      </Dialog>

      <Dialog open={showSettingsDialog} onOpenChange={handleSettingsDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-4"></div>
              <div className="text-sm text-muted-foreground">
                Manage your account settings
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDeleteUser();
                  }}
                >
                  Delete Account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This action cannot be undone.
                </p>
              </div>

          </CardContent>
        </Card>
      </DialogContent>
    </Dialog >
    </>
  );
};

export default Navbar;