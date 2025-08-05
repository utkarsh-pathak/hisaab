// GroupParticipantsModal.jsx
import React from "react";
import { X, Users } from "lucide-react";

const GroupParticipantsModal = ({ isOpen, onClose, participants }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-dark">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">
              Group Participants
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-dark rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {participants && participants.length > 0 ? (
            <ul className="space-y-4">
              {participants.map((participant) => (
                <li
                  key={participant.user_id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-dark/40 transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-purple flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{participant.name}</p>
                    <p className="text-gray-400 text-sm">{participant.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No participants found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-dark bg-dark/40">
          <button
            onClick={onClose}
            className="w-full px-6 py-2 bg-purple hover:bg-purple-darker text-white rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ParticipantsIcon.jsx
const ParticipantsIcon = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative group p-2 hover:bg-gray-dark rounded-lg transition-colors duration-200"
    >
      <Users className="w-5 h-5 text-gray-400 group-hover:text-purple-light transition-colors duration-200" />
      <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-dark-surface text-white text-sm py-1 px-2 rounded-md -bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-200 whitespace-nowrap shadow-lg">
        View Participants
      </span>
    </button>
  );
};

export { GroupParticipantsModal, ParticipantsIcon };
