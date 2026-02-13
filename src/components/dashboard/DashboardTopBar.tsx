import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronRight, LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface DashboardTopBarProps {
  activeTab: string;
  sidebarLinks: { label: string; id: string }[];
  onNavigate: (tab: string) => void;
}

const DashboardTopBar = ({ activeTab, sidebarLinks, onNavigate }: DashboardTopBarProps) => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const currentLabel = sidebarLinks.find((l) => l.id === activeTab)?.label || "Dashboard";

  return (
    <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border px-6 py-3 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Dashboard</span>
        {activeTab !== "dashboard" && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">{currentLabel}</span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-muted-foreground">
          Welcome, <span className="text-foreground font-medium">{profile?.full_name || user?.email?.split("@")[0]}</span>
        </span>

        <button
          onClick={() => onNavigate("announcements")}
          className="relative p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {profile?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onNavigate("profile")}>
              <User className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate("settings")}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { signOut(); navigate("/"); }} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DashboardTopBar;
