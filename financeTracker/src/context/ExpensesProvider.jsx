import React, { createContext, useState } from "react";

export const ExpensesContext = createContext();

export const ExpensesProvider = ({ children }) => {
  const [totalExpenses, setTotalExpenses] = useState(0);

  const updateTotalExpenses = (amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.error("Invalid amount provided to updateTotalExpenses:", amount);
      return;
    }
    setTotalExpenses((prev) => prev + parsedAmount);
  };

  return (
    <ExpensesContext.Provider value={{ totalExpenses, updateTotalExpenses }}>
      {children}
    </ExpensesContext.Provider>
  );
};