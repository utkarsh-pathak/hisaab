import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { clearUser } from "../store";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userName = localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("email") || "user@example.com";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("user_id");
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Account</h2>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-background-surface border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{userInitials}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">{userName}</h3>
            <p className="text-sm text-text-muted">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-3">
        <button
          className="w-full p-5 rounded-2xl bg-background-surface hover:bg-background-elevated transition-all group border border-transparent hover:border-primary/20 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-xl">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary group-hover:text-primary transition-colors">
                  Profile Settings
                </h4>
                <p className="text-sm text-text-muted">Manage your profile information</p>
              </div>
            </div>
          </div>
        </button>

        <button
          className="w-full p-5 rounded-2xl bg-background-surface hover:bg-background-elevated transition-all group border border-transparent hover:border-primary/20 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/20 rounded-xl">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary group-hover:text-primary transition-colors">
                  App Settings
                </h4>
                <p className="text-sm text-text-muted">Customize your app experience</p>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={handleLogoutClick}
          className="w-full p-5 rounded-2xl bg-background-surface hover:bg-background-elevated transition-all group border border-transparent hover:border-error/20 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-error/20 rounded-xl">
                <LogOut className="w-5 h-5 text-error" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary group-hover:text-error transition-colors">
                  Logout
                </h4>
                <p className="text-sm text-text-muted">Sign out of your account</p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowLogoutModal(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLogout}
              variant="destructive"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Account;
