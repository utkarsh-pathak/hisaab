import React from "react";
import { ArrowRight } from "lucide-react";

const Card = ({ children, className, ...props }) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br from-dark-surface to-dark/60 
    backdrop-blur-md rounded-2xl
    transition-all duration-300 ease-in-out
    border border-gray-800/40 hover:border-gray-700/40
    group cursor-pointer w-full shadow-xl hover:shadow-2xl 
    hover:-translate-y-1 ${className}`}
    {...props}
  >
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-dark/10 to-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Content */}
    <div className="relative z-10 p-6 space-y-4">{children}</div>
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

const Badge = ({ children, variant = "purple" }) => {
  const variants = {
    purple: "bg-purple-500/15 text-purple-300 ring-purple-400/20",
    green: "bg-green-500/15 text-green-300 ring-green-400/20",
    teal: "bg-teal-500/15 text-teal-300 ring-teal-400/20",
  };

  return (
    <span
      className={`
      text-sm font-medium px-4 py-1.5 rounded-full
      ring-1 backdrop-blur-sm
      transition-all duration-300
      group-hover:ring-opacity-50
      ${variants[variant]}
    `}
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
      return `You lent ₹${item.amount}`;
    } else if (isUserPayer && userIsParticipant) {
      const totalLent = item.participants.reduce(
        (sum, participant) =>
          sum + (participant.id !== userId ? participant.amount_owed : 0),
        0
      );
      return `You lent ₹${totalLent.toFixed(2)}`;
    } else if (!isUserPayer && userIsParticipant) {
      const amountOwed =
        item.participants.find((participant) => participant.id === userId)
          ?.amount_owed || 0;
      return `${item.paid_by.name} lent you ₹${amountOwed.toFixed(2)}`;
    }
    return "No participation";
  };

  return (
    <Card onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-200 transition-colors duration-300">
              {item.description}
            </h3>
            <span
              className={`text-sm font-medium ${
                isUserPayer ? "text-teal-400" : "text-gray-400"
              }`}
            >
              {isUserPayer ? (
                <span className="flex items-center gap-2">
                  You paid
                  <Badge variant="teal">₹{item.amount}</Badge>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {item.paid_by.name} paid
                  <Badge variant="teal">₹{item.amount}</Badge>
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="purple">{getLendingInfo()}</Badge>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors duration-300" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export const SettlementCard = ({ item, userId }) => (
  <Card className="from-gray-900/80 to-gray-800/80 border-green-800/30 hover:border-green-700/40">
    <CardHeader>
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-green-200 transition-colors duration-300">
            Settlement
          </h3>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <Badge variant="green">
            {item.creditor_id === userId
              ? `You received ₹${item.amount}`
              : `${item.creditor_name} received ₹${item.amount}`}
          </Badge>
          <span className="text-gray-400 text-sm font-medium">
            from {item.debtor_id === userId ? "you" : item.debtor_name}
          </span>
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default { Card, ExpenseCard, SettlementCard };
