// GroupParticipantsModal.jsx
import React from "react";
import { Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

const GroupParticipantsModal = ({ isOpen, onClose, participants }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Group Participants</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {participants && participants.length > 0 ? (
            <div className="space-y-2.5">
              {participants.map((participant) => (
                <div
                  key={participant.user_id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background-surface hover:bg-background-elevated transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-lg font-semibold">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium text-sm">
                      {participant.name}
                    </p>
                    <p className="text-text-muted text-xs truncate">
                      {participant.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-center text-sm py-8">
              No participants found.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ParticipantsIcon.jsx
const ParticipantsIcon = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="tap-target p-2 rounded-lg hover:bg-background-elevated transition-colors group"
      aria-label="View participants"
    >
      <Users className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-200" />
    </button>
  );
};

export { GroupParticipantsModal, ParticipantsIcon };
