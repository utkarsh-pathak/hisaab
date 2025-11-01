import React from "react";
import { IndianRupee } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background-surface border-t border-border p-6 w-full text-center mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <IndianRupee className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            <span className="text-primary">H</span>
            <span className="text-accent">i</span>
            <span>s</span>
            <span className="text-primary">a</span>
            <span>a</span>
            <span className="text-accent">b</span>
          </h2>
        </div>
        <p className="text-sm text-text-muted">
          © 2025 Hisaab. Track expenses with ease.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
