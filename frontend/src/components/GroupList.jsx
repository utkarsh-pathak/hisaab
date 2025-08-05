import React from "react";
import {
  Users,
  ChevronRight,
  IndianRupee,
  Check,
  ArrowRight,
} from "lucide-react";

const GroupCard = ({ group, onClick }) => (
  <div
    onClick={onClick}
    className="relative overflow-hidden 
               bg-gradient-to-br from-dark-surface via-grey-darker to-dark
               backdrop-blur-md rounded-2xl
               transition-all duration-300 ease-out
               border border-gray-medium/10 hover:border-purple-light/20
               group cursor-pointer shadow-lg hover:shadow-xl
               hover:-translate-y-1 hover:scale-[1.01]"
  >
    {/* Interactive gradient overlay */}
    <div
      className="absolute inset-0 bg-gradient-to-tr from-purple/5 via-purple-light/5 to-purple-darker/10 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    />

    {/* Content */}
    <div className="relative z-10 p-8 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-5">
          <div
            className="p-3.5 bg-gradient-to-br from-purple/20 to-purple-light/10 
                         rounded-xl ring-1 ring-purple-light/20 backdrop-blur-sm
                         group-hover:ring-purple-light/30 transition-all duration-300
                         shadow-lg"
          >
            <Users className="w-6 h-6 text-purple-light" />
          </div>
          <h2
            className="text-xl font-bold text-white group-hover:text-purple-light-200 
                         transition-colors duration-300"
          >
            {group.group_name}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <span
            className={`
              text-sm font-semibold px-5 py-2 rounded-full
              ring-1 backdrop-blur-sm shadow-lg
              transition-all duration-300
              flex items-center gap-2.5
              ${
                group.debts.length === 0
                  ? "bg-teal/10 text-teal ring-teal/20 group-hover:bg-teal/20"
                  : "bg-gold/10 text-gold ring-gold/20 group-hover:bg-gold/20"
              }
            `}
          >
            {group.debts.length === 0 ? (
              <>
                <Check className="w-4 h-4" />
                Settled
              </>
            ) : (
              <>
                <IndianRupee className="w-4 h-4" />
                Active
              </>
            )}
          </span>
          <ChevronRight
            className="w-5 h-5 text-gray-medium group-hover:text-purple-light 
                       transform group-hover:translate-x-1 transition-all duration-300"
          />
        </div>
      </div>

      {/* Debts Section */}
      <div
        className="bg-gradient-to-br from-dark/80 to-dark-surface/90 
                      backdrop-blur-sm rounded-xl p-6 
                      ring-1 ring-gray-medium/10 group-hover:ring-purple/20
                      transition-all duration-300"
      >
        {group.debts.length > 0 ? (
          <ul className="space-y-4">
            {group.debts.slice(0, 3).map((debt, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-sm
                           hover:bg-purple/5 rounded-lg p-3 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4 text-gray">
                  <span className="font-medium">{debt.debtor_name}</span>
                  <ArrowRight className="w-4 h-4 text-purple-light/50" />
                  <span className="font-medium">{debt.creditor_name}</span>
                </div>
                <span
                  className="font-semibold text-purple-light bg-purple/10 
                               px-4 py-1.5 rounded-full shadow-sm
                               group-hover:bg-purple/15 transition-colors duration-300"
                >
                  ₹{debt.amount_owed.toFixed(2)}
                </span>
              </li>
            ))}
            {group.debts.length > 3 && (
              <li className="pt-4 border-t border-gray-medium/10">
                <p
                  className="text-center text-sm text-gray-medium font-medium
                             hover:text-purple-light transition-colors duration-200"
                >
                  +{group.debts.length - 3} more debts
                </p>
              </li>
            )}
          </ul>
        ) : (
          <p className="text-center text-sm text-gray-medium font-medium py-2">
            All debts are settled in this group
          </p>
        )}
      </div>
    </div>
  </div>
);

const GroupList = ({ groups, onGroupSelect }) => {
  return (
    <div
      className="w-full max-w-3xl mx-auto p-8 
                    bg-gradient-to-b from-dark to-dark-surface 
                    rounded-3xl shadow-xl space-y-6"
    >
      {groups.map((group) => (
        <GroupCard
          key={group.group_id}
          group={group}
          onClick={() => onGroupSelect(group)}
        />
      ))}
    </div>
  );
};

export default GroupList;
