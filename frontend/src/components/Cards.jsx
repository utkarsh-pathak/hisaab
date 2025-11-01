import React from "react";
import { ChevronRight } from "lucide-react";

const Card = ({ children, className, ...props }) => (
  <div
    className={`p-3.5 rounded-xl bg-background-surface hover:bg-background-elevated
    transition-all group cursor-pointer w-full border border-transparent hover:border-primary/20 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className, ...props }) => (
  <div
    className={`flex items-start justify-between w-full ${className}`}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({ children, variant = "primary" }) => {
  const variants = {
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    accent: "bg-accent/15 text-accent",
  };

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export const ExpenseCard = ({ item, userId, onClick }) => {
  const isUserPayer = item.paid_by.id === userId;
  const userIsParticipant = item.participants.some(
    (participant) => participant.id === userId
  );

  const getLendingInfo = () => {
    if (isUserPayer && !userIsParticipant) {
      return { text: `You lent ₹${item.amount}`, variant: "success" };
    } else if (isUserPayer && userIsParticipant) {
      const totalLent = item.participants.reduce(
        (sum, participant) =>
          sum + (participant.id !== userId ? participant.amount_owed : 0),
        0
      );
      return { text: `You lent ₹${totalLent.toFixed(2)}`, variant: "success" };
    } else if (!isUserPayer && userIsParticipant) {
      const amountOwed =
        item.participants.find((participant) => participant.id === userId)
          ?.amount_owed || 0;
      return { text: `${item.paid_by.name} lent you ₹${amountOwed.toFixed(2)}`, variant: "primary" };
    }
    return { text: "No participation", variant: "primary" };
  };

  const lendingInfo = getLendingInfo();

  return (
    <Card onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
            {item.description}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{isUserPayer ? "You paid" : `${item.paid_by.name} paid`}</span>
            <Badge variant="accent">₹{item.amount}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={lendingInfo.variant}>{lendingInfo.text}</Badge>
          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Card>
  );
};

export const SettlementCard = ({ item, userId }) => (
  <Card className="border-success/20 hover:border-success/30">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="text-sm font-semibold text-success">
          Settlement
        </h3>
        <p className="text-xs text-text-muted">
          from {item.debtor_id === userId ? "you" : item.debtor_name}
        </p>
      </div>

      <div className="flex-shrink-0">
        <Badge variant="success">
          {item.creditor_id === userId
            ? `You received ₹${item.amount}`
            : `${item.creditor_name} received ₹${item.amount}`}
        </Badge>
      </div>
    </div>
  </Card>
);

export default { Card, ExpenseCard, SettlementCard };
