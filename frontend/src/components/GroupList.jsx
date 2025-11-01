import React from "react";
import {
  Users,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "./ui/status-badge";
import { AmountDisplay } from "./ui/amount-display";
import { cn } from "@/lib/utils";

const GroupCard = ({ group, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer p-6 space-y-4 rounded-2xl bg-background-surface hover:bg-background-elevated transition-all"
  >
    {/* Content */}
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
            {group.group_name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            status={group.debts.length === 0 ? "settled" : "active"}
          />
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Debts Section */}
      <div className="bg-background-elevated rounded-xl p-4">
        {group.debts.length > 0 ? (
          <ul className="space-y-3">
            {group.debts.slice(0, 3).map((debt, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-sm hover:bg-primary/5 rounded-lg p-2 transition-colors"
              >
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="font-medium">{debt.debtor_name}</span>
                  <ArrowRight className="w-4 h-4 text-primary/50" />
                  <span className="font-medium">{debt.creditor_name}</span>
                </div>
                <AmountDisplay amount={debt.amount_owed} size="sm" variant="default" />
              </li>
            ))}
            {group.debts.length > 3 && (
              <li className="pt-3 border-t border-border">
                <p className="text-center text-sm text-text-muted font-medium hover:text-primary transition-colors">
                  +{group.debts.length - 3} more debts
                </p>
              </li>
            )}
          </ul>
        ) : (
          <p className="text-center text-sm text-text-muted font-medium py-2">
            All debts are settled in this group
          </p>
        )}
      </div>
    </div>
  </div>
);

const GroupList = ({ groups, onGroupSelect }) => {
  return (
    <div className="space-y-4">
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
