import React, { useEffect, useState } from "react";
import axios from "axios";


export default function ExpenseCard({ totalExpenses, updateTotalExpenses }) {
  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const [expenses, setExpenses] = useState();
  const [tempExpenses, setTempExpenses] = useState(totalExpenses);  
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user", 
        { withCredentials: true });
        console.log("DEBUG: Fetched userId in ExpenseCard:", response.data.id);
        setUserId(response.data.id);
      } catch (error) {
        console.error("DEBUG: Error fetching userId in ExpenseCard:", error.response?.data || error.message);
      }
    };
  
    fetchUserId();
  }, []); 
  
  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
    }
  }, [userId]); 
  
  

  const fetchExpenses = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/expenses/${userId}`,
        { withCredentials: true }
      );
  
      if (response.data.length > 0) {
        const totalExpensesFromDB = response.data.reduce(
          (sum, expense) => sum + parseFloat(expense.amount),
          0
        );
        console.log('--------')
        console.log(totalExpensesFromDB.toFixed(2))
        setExpenses(totalExpensesFromDB.toFixed(2));
        updateTotalExpenses(totalExpensesFromDB - totalExpenses); // Adjust by the difference
      } else {
        console.log("DEBUG: No expenses found for this user.");
        setExpenses(0);
        updateTotalExpenses(-totalExpenses); // Reset totalExpenses to 0
      }
    } catch (error) {
      console.error("DEBUG: Error fetching expenses:", error.response?.data || error.message);
    }
  };
  


// Allow for expenses input
  const handleEditExpenses = () => {
    setIsEditingExpenses(true);
    setTempExpenses(expenses || 0); // Ensure it defaults to 0 if expenses is undefined
  };

  // const handleSaveExpenses = async () => {
  //   try {
  //     console.log("DEBUG: userId before saving expense:", userId);
  //     const newExpense = parseFloat(tempExpenses);
  //     console.log("DEBUG: newExpense before saving expense:", newExpense);
  //     if (!userId) {
  //       alert("User ID is not available. Please log in again.");
  //       return;
  //     }
  
  //     // Save the expense to the backend
  //     await axios.post(
  //       "http://localhost:5000/api/expenses",
  //       {
  //         user_id: userId,
  //         amount: parseFloat(tempExpenses), // Convert string to a number
  //         description: "Updated expenses for this month",
  //       },
  //       { withCredentials: true }
  //     );
  
  //     console.log("DEBUG: Expense saved successfully");
      
  //     updateTotalExpenses(newExpense);
  //     fetchExpenses(userId);

  //     setIsEditingExpenses(false); // Exit editing mode
  //   } catch (error) {
  //     console.error("Error saving expenses:", error.response?.data || error.message);
  //     alert("Failed to save expenses. Please try again.");
  //   }
  // };
  
  
  const handleSaveExpenses = async () => {
    try {
      console.log("DEBUG: userId before saving expense:", userId);
      const newExpense = parseFloat(tempExpenses);
      if (!userId) {
        alert("User ID is not available. Please log in again.");
        return;
      }
      
      // Save the expense to the backend
      await axios.post(
        "http://localhost:5000/api/expenses",
        {
          user_id: userId,
          amount: newExpense,
          description: "Updated expenses for this month",
        },
        { withCredentials: true }
      );
      
      console.log("DEBUG: Expense saved successfully");
  
      // Recalculate totalExpenses by fetching updated expenses
      await fetchExpenses(userId);
  
      // Reset tempExpenses to avoid stale data
      setTempExpenses(0);
  
      setIsEditingExpenses(false); // Exit editing mode
    } catch (error) {
      console.error("Error saving expenses:", error.response?.data || error.message);
      alert("Failed to save expenses. Please try again.");
    }
  };
  
  

  const handleCancelExpenses = () => {
    setIsEditingExpenses(false);
    setTempExpenses(totalExpenses); 
  };

 // Only allows for 2 decimal places
  const handleInputChange = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setTempExpenses(value);
    }
  };

  // Keybinds "Escape" key to trigger the "Cancel" key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveExpenses(); 
    } else if (e.key === "Escape") {
      handleCancelExpenses();
    }
  };

  // Format Card
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-[300px] w-[800px] flex flex-col justify-between">
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          Total Expenses:
        </label>
        {isEditingExpenses ? (
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={tempExpenses}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} 
              className="flex-1 px-3 py-2 text-lg border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSaveExpenses}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancelExpenses}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</span>
            <button
              onClick={handleEditExpenses}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <img
                src="/summaryPage/editButton.png"
                alt="Edit"
                className="w-6 h-6"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
