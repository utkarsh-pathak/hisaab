import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Users, UserCheck, Activity, User, Tag, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: "Groups", path: "/groups", icon: Users },
    { name: "Friends", path: "/friends", icon: UserCheck },
    { name: "Activity", path: "/activity", icon: Activity },
    { name: "Self", path: "/self", icon: Tag },
    { name: "Account", path: "/account", icon: User },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  const userName = localStorage.getItem("name") || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Top Header - Desktop and Mobile */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-top">
        <div className="bg-background-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  <span className="text-primary">H</span>
                  <span className="text-accent">i</span>
                  <span>s</span>
                  <span className="text-primary">a</span>
                  <span>a</span>
                  <span className="text-accent">b</span>
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigate(item.path)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                        isActive
                          ? "bg-primary text-black"
                          : "text-text-secondary hover:text-text-primary hover:bg-background-elevated"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Avatar */}
              <Avatar className="w-9 h-9">
                <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
        <div className="bg-[#1c1917] border-t-2 border-primary/20 px-2 py-3">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all tap-target",
                    "min-w-[64px]",
                    isActive
                      ? "text-primary bg-primary/20"
                      : "text-text-primary hover:text-primary"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                  <span className="text-[10px] font-semibold">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Spacers for fixed headers */}
      <div className="h-16" /> {/* Top header spacer */}
      <div className="h-20 md:h-0" /> {/* Bottom nav spacer - mobile only */}
    </>
  );
};

export default Header;
