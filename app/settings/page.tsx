"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { 
  ChevronRight, 
  User, 
  Shield, 
  Camera, 
  List, 
  MessageCircle, 
  Radio, 
  Bell, 
  Database, 
  Eye, 
  Globe, 
  HelpCircle, 
  UserPlus, 
  Download,
  LogOut,
  Moon,
  Sun,
  Palette,
  Lock,
  Key,
  Trash2,
  Archive,
  Volume2,
  Wifi,
  Cloud,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
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
  const [locationSharing, setLocationSharing] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [highQualityMedia, setHighQualityMedia] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [language, setLanguage] = useState('en-US');
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [screenSecurity, setScreenSecurity] = useState(true);

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

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    // In a real app, you would adjust the app's font size
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const settingSections = [
    {
      title: "Account",
      items: [
        {
          id: "account",
          title: "Account",
          description: "Manage your account settings",
          icon: <User className="h-5 w-5" />,
          action: () => console.log("Account settings")
        },
        {
          id: "privacy",
          title: "Privacy",
          description: "Privacy and security settings",
          icon: <Shield className="h-5 w-5" />,
          action: () => console.log("Privacy settings")
        },
        {
          id: "avatar",
          title: "Avatar",
          description: "Change your profile picture",
          icon: <Camera className="h-5 w-5" />,
          action: () => console.log("Avatar settings")
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
          action: () => console.log("Chat settings")
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
      title: "Lists & Broadcasts",
      items: [
        {
          id: "lists",
          title: "Lists",
          description: "Manage your contact lists",
          icon: <List className="h-5 w-5" />,
          action: () => console.log("Lists settings")
        },
        {
          id: "broadcasts",
          title: "Broadcasts",
          description: "Broadcast message settings",
          icon: <Radio className="h-5 w-5" />,
          action: () => console.log("Broadcasts settings")
        }
      ]
    },
    {
      title: "Storage & Data",
      items: [
        {
          id: "storage",
          title: "Storage and Data",
          description: "Manage storage and data usage",
          icon: <Database className="h-5 w-5" />,
          action: () => console.log("Storage settings")
        },
        {
          id: "network",
          title: "Network Usage",
          description: "Network usage settings",
          icon: <Wifi className="h-5 w-5" />,
          action: () => console.log("Network settings")
        }
      ]
    },
    {
      title: "Accessibility",
      items: [
        {
          id: "accessibility",
          title: "Accessibility",
          description: "Accessibility settings",
          icon: <Eye className="h-5 w-5" />,
          action: () => console.log("Accessibility settings")
        },
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
          action: () => console.log("Language settings")
        },
        {
          id: "theme",
          title: "Theme",
          description: "App theme settings",
          icon: <Palette className="h-5 w-5" />,
          action: () => console.log("Theme settings")
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
          action: () => console.log("Help and feedback")
        },
        {
          id: "invite",
          title: "Invite a Friend",
          description: "Invite friends to join",
          icon: <UserPlus className="h-5 w-5" />,
          action: () => console.log("Invite friends")
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
          action: () => console.log("Check for updates")
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
    </div>
  );
}