"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { 
  ChevronRight, 
  User, 
  Shield, 
  Camera, 
  MessageCircle, 
  Bell, 
  Eye, 
  Globe, 
  HelpCircle, 
  UserPlus, 
  Download,
  LogOut,
  Moon,
  Sun,
  X,
  Mail,
  Phone,
  Key,
  Lock,
  Trash2,
  Upload,
  Languages,
  Info,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (checked: boolean) => void;
}

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  
  // State for settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [showAvatars, setShowAvatars] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [highQualityMedia, setHighQualityMedia] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [screenSecurity, setScreenSecurity] = useState(true);
  
  // Dialog states
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isChatsDialogOpen, setIsChatsDialogOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isUpdatesDialogOpen, setIsUpdatesDialogOpen] = useState(false);

  // Handle setting changes
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    // Toggle dark mode class on document element
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // In a real app, you would persist this to localStorage or backend
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    // In a real app, you would register/unregister notification permissions
  };

  const handleReadReceiptsChange = (checked: boolean) => {
    setReadReceipts(checked);
    // In a real app, you would sync this with backend
  };

  const handleAutoDownloadChange = (checked: boolean) => {
    setAutoDownload(checked);
    // In a real app, you would sync this with backend
  };

  const handleHighQualityMediaChange = (checked: boolean) => {
    setHighQualityMedia(checked);
    // In a real app, you would sync this with backend
  };

  const handleBackupChange = (checked: boolean) => {
    setBackupEnabled(checked);
    // In a real app, you would sync this with backend
  };

  const handleLowDataModeChange = (checked: boolean) => {
    setLowDataMode(checked);
    // In a real app, you would adjust data usage accordingly
  };

  const handleScreenSecurityChange = (checked: boolean) => {
    setScreenSecurity(checked);
    // In a real app, you would implement screen recording protection
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    // In a real app, you would change the app language
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Simplified setting sections - only include essential items
  const settingSections = [
    {
      title: "Account",
      items: [
        {
          id: "account",
          title: "Account",
          description: "Manage your account settings",
          icon: <User className="h-5 w-5" />,
          action: () => setIsAccountDialogOpen(true)
        },
        {
          id: "privacy",
          title: "Privacy",
          description: "Privacy and security settings",
          icon: <Shield className="h-5 w-5" />,
          action: () => setIsPrivacyDialogOpen(true)
        },
        {
          id: "avatar",
          title: "Avatar",
          description: "Change your profile picture",
          icon: <Camera className="h-5 w-5" />,
          action: () => setIsAvatarDialogOpen(true)
        }
      ]
    },
    {
      title: "Chats",
      items: [
        {
          id: "chats",
          title: "Chats",
          description: "Chat settings and preferences",
          icon: <MessageCircle className="h-5 w-5" />,
          action: () => setIsChatsDialogOpen(true)
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "Notification preferences",
          icon: <Bell className="h-5 w-5" />,
          hasSwitch: true,
          switchValue: notifications,
          onSwitchChange: handleNotificationsChange
        },
        {
          id: "read-receipts",
          title: "Read Receipts",
          description: "Show when messages are read",
          icon: <Eye className="h-5 w-5" />,
          hasSwitch: true,
          switchValue: readReceipts,
          onSwitchChange: handleReadReceiptsChange
        }
      ]
    },
    {
      title: "Accessibility",
      items: [
        {
          id: "dark-mode",
          title: "Dark Mode",
          description: "Enable dark theme",
          icon: darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
          hasSwitch: true,
          switchValue: darkMode,
          onSwitchChange: handleDarkModeChange
        }
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          id: "language",
          title: "App Language",
          description: "Change app language",
          icon: <Globe className="h-5 w-5" />,
          action: () => setIsLanguageDialogOpen(true)
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Help and Feedback",
          description: "Get help and send feedback",
          icon: <HelpCircle className="h-5 w-5" />,
          action: () => setIsHelpDialogOpen(true)
        },
        {
          id: "invite",
          title: "Invite a Friend",
          description: "Invite friends to join",
          icon: <UserPlus className="h-5 w-5" />,
          action: () => setIsInviteDialogOpen(true)
        }
      ]
    },
    {
      title: "Updates",
      items: [
        {
          id: "updates",
          title: "App Updates",
          description: "Check for app updates",
          icon: <Download className="h-5 w-5" />,
          action: () => setIsUpdatesDialogOpen(true)
        }
      ]
    }
  ];

  const SettingItemComponent = ({ item }: { item: SettingItem }) => (
    <div 
      className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={item.action}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-muted rounded-lg">
          {item.icon}
        </div>
        <div>
          <h3 className="font-medium">{item.title}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
        </div>
      </div>
      {item.hasSwitch ? (
        <Switch
          checked={item.switchValue}
          onCheckedChange={item.onSwitchChange}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={user?.imageUrl}
            name={user?.fullName || user?.username || "User"}
            size="lg"
          />
          <div className="flex-1">
            <h2 className="font-semibold">{user?.fullName || user?.username || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="p-4 space-y-6">
        {settingSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items.map((item) => (
                <SettingItemComponent key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>Chat App v1.0.0</p>
        <p className="mt-1">© 2024 Chat App. All rights reserved.</p>
      </div>

      {/* Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account information and security settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.primaryEmailAddress?.emailAddress || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="Enter phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Change password" />
            </div>
            <Button className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
            <DialogDescription>
              Control your privacy and security preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Profile Visibility</h3>
                <p className="text-sm text-muted-foreground">Who can see your profile</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Read Receipts</h3>
                <p className="text-sm text-muted-foreground">Show when you've read messages</p>
              </div>
              <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
            </div>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Avatar</DialogTitle>
            <DialogDescription>
              Upload a new profile picture or choose from options
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <UserAvatar
                src={user?.imageUrl}
                name={user?.fullName || user?.username || "User"}
                size="lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload">Upload Image</Label>
              <Input id="avatar-upload" type="file" accept="image/*" />
            </div>
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload New Avatar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chats Dialog */}
      <Dialog open={isChatsDialogOpen} onOpenChange={setIsChatsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
            <DialogDescription>
              Customize your chat experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-Download Media</h3>
                <p className="text-sm text-muted-foreground">Download images and videos automatically</p>
              </div>
              <Switch checked={autoDownload} onCheckedChange={setAutoDownload} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">High Quality Media</h3>
                <p className="text-sm text-muted-foreground">Send and receive high quality images</p>
              </div>
              <Switch checked={highQualityMedia} onCheckedChange={setHighQualityMedia} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show Avatars</h3>
                <p className="text-sm text-muted-foreground">Display user avatars in chats</p>
              </div>
              <Switch checked={showAvatars} onCheckedChange={setShowAvatars} />
            </div>
            <Button className="w-full">Save Preferences</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>App Language</DialogTitle>
            <DialogDescription>
              Change the language of the application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language-select">Select Language</Label>
              <select 
                id="language-select" 
                className="w-full p-2 border rounded-md"
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="en-US">English (US)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="zh-CN">Chinese</option>
              </select>
            </div>
            <Button className="w-full">Apply Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Help and Feedback</DialogTitle>
            <DialogDescription>
              Get help or send us your feedback
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="help-subject">Subject</Label>
              <Input id="help-subject" placeholder="Enter subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="help-message">Message</Label>
              <textarea 
                id="help-message" 
                className="w-full p-2 border rounded-md h-32"
                placeholder="Describe your issue or feedback..."
              />
            </div>
            <Button className="w-full">
              <HelpCircle className="h-4 w-4 mr-2" />
              Send Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a Friend</DialogTitle>
            <DialogDescription>
              Share the app with your friends
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Friend's Email</Label>
              <Input id="invite-email" type="email" placeholder="Enter email address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message</Label>
              <textarea 
                id="invite-message" 
                className="w-full p-2 border rounded-md h-24"
                placeholder="Add a personal message (optional)..."
              />
            </div>
            <Button className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Updates Dialog */}
      <Dialog open={isUpdatesDialogOpen} onOpenChange={setIsUpdatesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>App Updates</DialogTitle>
            <DialogDescription>
              Check for and manage app updates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">Current Version</h3>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              <Info className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">Latest Version</h3>
                <p className="text-sm text-muted-foreground">v1.0.0</p>
              </div>
              <AlertCircle className="h-5 w-5 text-green-500" />
            </div>
            <Button className="w-full" disabled>
              Check for Updates
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}