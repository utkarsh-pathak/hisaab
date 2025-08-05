import React from "react";

const CurrencyAmount = ({ currency, setCurrency, amount, setAmount }) => {
  return (
    <div className="mb-4 flex space-x-4">
      <div className="w-1/3">
        <label className="block text-gray-700 font-semibold mb-2">
          Currency
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-dark"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>
      <div className="w-2/3">
        <label className="block text-gray-700 font-semibold mb-2">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-purple-dark"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};

export default CurrencyAmount;
