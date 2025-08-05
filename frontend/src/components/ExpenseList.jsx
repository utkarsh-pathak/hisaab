const ExpenseList = ({ expenses }) => {
  return (
    <div className="space-y-4 mt-6">
      {expenses.length === 0 ? (
        <p className="text-gray-500">No expenses added yet.</p>
      ) : (
        expenses.map((expense, index) => (
          <div
            key={index}
            className="border border-gray-medium p-4 rounded-lg bg-dark-surface shadow-md"
          >
            <h3 className="font-bold text-purple">{expense.description}</h3>
            <p>
              Amount:{" "}
              <span className="font-semibold">
                ${expense.amount.toFixed(2)}
              </span>
            </p>
            <p>
              Participants:{" "}
              <span className="italic">{expense.participants.join(", ")}</span>
            </p>
            <p>
              Group: <span className="font-semibold">{expense.groupTag}</span>
            </p>
          </div>
        ))
      )}
    </div>
  );
};
