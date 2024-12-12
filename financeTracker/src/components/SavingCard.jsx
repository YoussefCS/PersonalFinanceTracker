import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SavingCard({totalSavings, updateTotalSavings}) {
  const [isEditingSavings, setIsEditingSavings] = useState(false);
  const [savings, setSavings] = useState(totalSavings);
  const [tempSavings, setTempSavings] = useState(totalSavings);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user", {
          withCredentials: true,
        });
        setUserId(response.data.id);
      } catch (error) {
        console.error(
          "DEBUG: Error fetching userId in SavingCard:",
          error.response?.data || error.message
        );
      }
    };

    fetchUserId();
  }, []);


  useEffect(() => {
    if (userId) {
      fetchSavings(userId);
    }
  }, [userId]); 

  const fetchSavings = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/savings/${userId}`,
        { withCredentials: true }
      );
  
      if (response.data.length > 0) {
        const totalSavingsFromDB = response.data.reduce(
          (sum, saving) => sum + parseFloat(saving.amount),
          0
        );
        setSavings(totalSavingsFromDB.toFixed(2));
        updateTotalSavings(totalSavingsFromDB - totalSavings); // Adjust only the difference
      } else {
        console.log("DEBUG: No savings found for this user.");
        setSavings(0);
        updateTotalSavings(-totalSavings); // Reset to 0
      }
    } catch (error) {
      console.error(
        "DEBUG: Error fetching savings:",
        error.response?.data || error.message
      );
    }
  };
  


// Allow for savings input
  const handleEditSavings = () => {
    setIsEditingSavings(true);
    setTempSavings(savings); 
  };


  const handleSaveSavings = async () => {
    try {


      if (!userId) {
        alert("User not logged in. Please log in to save savings.");
        return;
      }

      // Save the savings to the backend
      await axios.post(
        "http://localhost:5000/api/savings",
        { user_id: userId, amount: parseFloat(tempSavings) },
        { withCredentials: true }
      );

      console.log("DEBUG: Savings saved successfully");

      // Fetch the latest savings after saving
      fetchSavings(userId);
      setIsEditingSavings(false); // Exit edit mode
    } catch (error) {
      console.error("DEBUG: Error saving savings:", error.response?.data || error.message);
      alert("Failed to save savings. Please try again.");
    }
  };


  const handleCancelSavings = () => {
    setIsEditingSavings(false);
    setTempSavings(savings); 
  };

  // Only allows for 2 decimal places
  const handleInputChange = (e) => {
    const value = e.target.value;

    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setTempSavings(value);
    }
  };

  // Keybinds "Enter" key to trigger the "Save" key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveSavings(); 
    } else if (e.key === "Escape") {
      handleCancelSavings(); 
    }
  };


  
  

  // Format Card
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-[300px] w-[800px] flex flex-col justify-between">
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          Savings:
        </label>
        {isEditingSavings ? (
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={tempSavings}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}  
              className="flex-1 px-3 py-2 text-lg border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSaveSavings}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancelSavings}
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-800">${totalSavings.toFixed(2)}</span>
            <button
              onClick={handleEditSavings}
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
