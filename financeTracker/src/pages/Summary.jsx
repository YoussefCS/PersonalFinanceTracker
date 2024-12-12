import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ExpenseCard from "../components/ExpenseCard";
import SavingCard from "../components/SavingCard";
import ComparisonCard from "../components/ComparisonCard";
import BreakdownCard from "../components/BreakdownCard";
import ReadWords from "./ReadWords";

export default function Summary() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isScannerActive, setIsScannerActive] = useState(false);


  const updateTotalExpenses = (amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.error("Invalid amount provided to updateTotalExpenses:", amount);
      return;
    }
    console.log("DEBUG: updateTotalExpenses called with:", parsedAmount);
    setTotalExpenses((prev) => {
      const newTotal = prev + parsedAmount;
      console.log("Updated totalExpenses:", newTotal);
      return newTotal;
    });
  };
  
  const updateTotalSavings = (amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.error("Invalid amount provided to updateTotalSavings:", amount);
      return;
    }
    setTotalSavings((prev) => {
      const newTotal = prev + parsedAmount;
      console.log("Updated totalSavings:", newTotal);
      return newTotal;
    });
  };
  




  return (
    <div className="h-screen flex flex-row justify-start w-[100vw] bg-neutral-200 relative">
      <Sidebar />

      {/* Summary content */}
      <div className="flex-1 ml-48 w-full h-full flex text-black overflow-y-scroll">
        <div className="pt-10 grid gap-4 sm:gap-6 md:gap-8 w-full h-full pr-4 grid-cols-1 md:grid-cols-2 md:px-10">
          {/* Assigning different sizes using grid column and row spans */}
          <ExpenseCard
            totalExpenses={totalExpenses}
            updateTotalExpenses={updateTotalExpenses}
          />
          <SavingCard
            totalSavings={totalSavings}
            updateTotalSavings={updateTotalSavings}
          />
          <ComparisonCard 
           totalExpenses={totalExpenses} 
           totalSavings={totalSavings} 
          
          />
          {/* <BreakdownCard
            updateTotalExpenses={updateTotalExpenses}
            updateTotalSavings={updateTotalSavings}
          /> */}

          {/* <ReadWords 
          updateTotalExpenses={updateTotalExpenses} 
          /> */}
          <BreakdownCard
            updateTotalExpenses={updateTotalExpenses}
            updateTotalSavings={updateTotalSavings}
            setIsScannerActive={setIsScannerActive} // Pass function to toggle scanner
          />

          {/* Conditionally render ReadWords */}
          {isScannerActive && (
            <div className="mt-4">
              <ReadWords updateTotalExpenses={updateTotalExpenses} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}