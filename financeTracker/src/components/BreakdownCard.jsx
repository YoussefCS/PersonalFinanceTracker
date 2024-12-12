import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableHeader, TableRow } from "./TableComponents";
import axios from "axios";

export default function BreakdownCard({ updateTotalExpenses, updateTotalSavings }) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isAddItemOn, setIsAddItemOn] = React.useState(false);
  const [isDeleteItemOn, setIsDeleteItemOn] = React.useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isAddItemDropdownOpen, setIsAddItemDropdownOpen] = React.useState(false);


  const [newItem, setNewItem] = React.useState({
    title: "",
    tagName: "",
    amount: "",
    date: "",
    type: "Expense",
  });

  const predefinedTags = [
    "Food",
    "Rent",
    "Utilities",
    "Transportation",
    "Healthcare",
    "Leisure",
    "Paycheck",
    "Other",
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user", { withCredentials: true });
        console.log("DEBUG: Fetched userId in BreakdownCard:", response.data.id);
        setUserId(response.data.id);
      } catch (error) {
        console.error("DEBUG: Error fetching userId in BreakdownCard:", error.response?.data || error.message);
      }
    };

    fetchUserId();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/summary", {
        withCredentials: true,
      });
      if (response.status === 200) {
        const mappedItems = response.data.map((item) => ({
          ...item,
          tagName: item.tag, // Map `tag` to `tagName`
        }));
        setItems(mappedItems);
        setIsLoading(false);
      } else {
        console.error("DEBUG: No summary data found:", response.data.message);
        setItems([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("DEBUG: Error fetching items:", error.response?.data || error.message);
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (userId) {
      fetchItems();
    } else {
      console.error("DEBUG: User ID is null, skipping fetchItems.");
    }
  }, [userId]);


  const handleSaveSummary = async (item) => {
    if (!userId) {
      console.error("DEBUG: Cannot save item, userId is null.");
      alert("User is not logged in. Please log in to save items.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/summary",
        {
          user_id: userId, // Send userId to associate the item with the current user
          title: item.title,
          tag: item.tagName,
          amount: item.amount,
          date: item.date,
          type: item.type,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        console.log("DEBUG: Item saved to database successfully:", response.data);
        await fetchItems();
        if (item.type === "Expense") {
          updateTotalExpenses(parseFloat(item.amount));
        } else if (item.type === "Earnings") {
          updateTotalSavings(parseFloat(item.amount));
        }

      }
    } catch (error) {
      console.error("DEBUG: Error saving item to database:", error.response?.data || error.message);
      alert("Failed to save item. Please try again.");
    }
  };

  const [errors, setErrors] = React.useState({});

  // Add Item Logic (Manually)----------------------------------------------

  const handleAddItemButtonClick = () => {
    setIsAddItemDropdownOpen(true);
  };

  const handleScannerAdd = () => {
    setIsAddItemDropdownOpen(false);
    setIsScannerActive(true);
    navigate("/scanner2");
  };

  const handleManualAdd = () => {
    setIsAddItemDropdownOpen(false);
    setIsScannerActive(false);
    setIsAddItemOn(!isAddItemOn);
  };

  const validateFields = (name, value) => {
    const errorMsgs = { ...errors };

    if (name === "title" || name === "tagName") {
      if (!value.trim()) {
        errorMsgs[name] = `${name} cannot be empty`;
      } else {
        delete errorMsgs[name];
      }
    }

    if (name === "amount") {
      if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        errorMsgs[name] = "Amount should be a valid number";
      } else {
        delete errorMsgs[name];
      }
    }

    if (name === "date") {
      if (!value) {
        errorMsgs[name] = "Please select a date";
      } else {
        delete errorMsgs[name];
      }
    }

    setErrors(errorMsgs);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({ ...prevItem, [name]: value }));
    validateFields(name, value);
  };

  const handleAddNewItem = async () => {
    const isValid = Object.keys(newItem).every(
      (key) => newItem[key] && newItem[key].trim() !== ""
    );

    if (isValid) {
      setItems((prevItems) => [...prevItems, newItem]);
      await handleSaveSummary(newItem); // Save the item to the database
      setNewItem({
        title: "",
        tagName: "",
        amount: "",
        date: "",
        type: "Expense",
      });
      setIsAddItemOn(false);
    } else {
      alert("Please fill in all fields.");
    }
  };

  // Delete Item Logic (Manually)----------------------------------------------
  const handleRemoveItemClick = () => {
    setIsDeleteItemOn(!isDeleteItemOn);
  };

  const handleDeleteItem = async (id, amount, type) => {
    try {
      console.log("DEBUG: Deleting item with id:", id, "amount:", amount, "type:", type);
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        console.error("DEBUG: Invalid amount parsed in handleDeleteItem:", amount);
        return;
      }
      console.log("DEBUG: Parsed amount:", parsedAmount);

      await axios.delete(`http://localhost:5000/api/summary/${id}`, { withCredentials: true });

      setItems((prevItems) => prevItems.filter((item) => item.id !== id));

      if (type === "Expense") {
        console.log("DEBUG: Calling updateTotalExpenses");
        updateTotalExpenses(-parsedAmount); // Pass parsedAmount here
      } else if (type === "Earnings") {
        updateTotalSavings(-parsedAmount);
      }
      console.log("DEBUG: Item deleted successfully and totals updated");
    } catch (error) {
      console.error("DEBUG: Error deleting item:", error.response?.data || error.message);
      alert("Failed to delete item. Please try again.");
    }
  };

  // Sort Logic-----------------------------------------------------
  const handleSortLogic = (type) => {
    if (type === "newest") {
      setItems((prevItems) =>
        [...prevItems].sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    } else if (type === "oldest") {
      setItems((prevItems) =>
        [...prevItems].sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    } else if (type === "alphabetically") {
      setItems((prevItems) =>
        [...prevItems].sort((a, b) => a.title.localeCompare(b.title))
      );
    }

    setIsFilterOpen(false);
  };

  return (
    <div className={`p-4 bg-white shadow-md rounded-md md:col-span-2`}>
      <div className="flex flex-col md:flex-row md:justify-between">
        {/* Title */}
        <h1 className="text-lg md:text-xl font-bold">
          Earning/Expenses Breakdown:
        </h1>

        {/* Right Buttons */}
        <div className="relative flex">
          <button
            className="bg-transparent border-none focus:outline-none"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <img
              src="./summaryPage/filterIcon.png"
              alt="Filter Icon"
              className="w-4 h-4 object-contain flex-shrink-0"
            />
          </button>
          <button
            className="bg-transparent border-none focus:outline-none"
            onClick={handleRemoveItemClick}
          >
            <img
              src="./summaryPage/removeItemIcon.png"
              alt="Add Item Button"
              className="w-4 h-4 object-contain flex-shrink-0"
            />
          </button>
          <button
            className="bg-transparent border-none focus:outline-none"
            onClick={handleAddItemButtonClick}
          >
            <img
              src="./summaryPage/addItemIcon.png"
              alt="Add Item Button"
              className="w-4 h-4 object-contain flex-shrink-0"
            />
          </button>

          {/* Add Item Option Dropdown */}
          {isAddItemDropdownOpen && (
            <div className="absolute bg-white shadow-lg rounded p-2 z-10 text-center md:right-0">
              <ul>
                <li
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={handleScannerAdd}
                >
                  Scanner
                </li>
                <li
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={handleManualAdd}
                >
                  Manual
                </li>
              </ul>
            </div>
          )}

          {/* Filter options Dropdown */}
          {isFilterOpen && (
            <div className="absolute mr-10 bg-white shadow-lg rounded p-2 z-10 text-center md:right-0">
              <ul>
                <li className="p-1 hover:bg-gray-200 cursor-pointer" onClick={() => handleSortLogic('newest')}>
                  Newest
                </li>
                <li className="p-1 hover:bg-gray-200 cursor-pointer" onClick={() => handleSortLogic('oldest')}>
                  Oldest
                </li>
                <li className="p-1 hover:bg-gray-200 cursor-pointer" onClick={() => handleSortLogic('alphabetically')}>
                  Alphabetically
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Error Message (Displayed during add item mode) */}
      {Object.keys(errors).length > 0 && isAddItemOn && (
        <div className="bg-red-100 text-red-700 p-2 rounded-md my-4">
          <ul>
            {Object.values(errors).map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table */}
      {/* Table Components are in TableComponents file for encapsulation */}
      <div className="overflow-x-auto flex lg:justify-center px-1">
        <table className="min-w-[95%] mt-4 px-4">
          <TableHeader />
          <tbody className="bg-white">
            {items.map((item, index) => (
              <TableRow
                key={index}
                title={item.title}
                tagName={item.tagName}
                amount={`$${item.amount}`}
                date={item.date}
                type={item.type}
                isDeleteOn={isDeleteItemOn}
                onDelete={() => handleDeleteItem(item.id, item.amount, item.type)}
              />
            ))}

            {/* Add Item Row */}
            {isAddItemOn && (
              <tr className="w-auto">
                <td className="">
                  <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    className="w-full bg-white h-8 px-2 border border-gray-300 text-center"
                    value={newItem.title}
                    onChange={handleNewItemChange}
                  />
                </td>
                <td className="">
                  <select
                    name="tagName"
                    className="w-full bg-white h-8 px-2 border border-gray-300 text-center"
                    value={newItem.tagName}
                    onChange={handleNewItemChange}
                    disabled={newItem.type === "Expense" && newItem.tagName === "Paycheck"}
                  >
                    <option value="">Select Tag</option>
                    {predefinedTags
                      .filter(tag => {
                        if (newItem.type === "Expense") {
                          return tag !== "Paycheck";  // Disable "Paycheck" for Expense type
                        } else if (newItem.type === "Earnings") {
                          return tag === "Paycheck" || tag === "Other"; // Allow "Paycheck" and "Other" for Earnings type
                        }
                        return true;  // Allow all tags if no type is selected
                      })
                      .map((tag, index) => (
                        <option key={index} value={tag.toUpperCase()}>
                          {tag}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="">
                  <input
                    type="text"
                    name="amount"
                    placeholder="Amount"
                    className="w-full bg-white h-8 px-2 border border-gray-300 text-center"
                    value={newItem.amount}
                    onChange={handleNewItemChange}
                  />
                </td>
                <td className="">
                  <input
                    type="date"
                    name="date"
                    className="w-full bg-white h-8 px-2 border border-gray-300 text-center"
                    value={newItem.date}
                    onChange={handleNewItemChange}
                  />
                </td>
                <td>
                  <select
                    name="type"
                    className="w-28 xl:w-full bg-white h-8 px-2 border border-gray-300 text-center flex-shrink-0"
                    value={newItem.type}
                    onChange={handleNewItemChange}
                  >
                    <option value="Expense">Expense</option>
                    <option value="Earnings">Earnings</option>
                  </select>
                </td>

                {/* Add/Cancel Button of Add Item Dropdown*/}
                <td className="">
                  {/* If all fields are empty except "type" field, show cancel button */}
                  {/* Else, show add button */}
                  {Object.entries(newItem).every(
                    ([key, value]) => key === "type" || value.trim() === ""
                  ) ? (
                    <button
                      onClick={() => {
                        handleManualAdd();
                        setErrors({});
                      }}
                      className="bg-red-500 text-white px-4 py-1 w-[8vw] rounded-md"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const isValid = Object.keys(newItem).every(
                          (key) => newItem[key].trim() !== ""
                        );
                        if (isValid) {
                          await handleAddNewItem();
                        } else {
                          alert("Please fill in all fields");
                        }
                      }}
                      className="bg-green-500 text-white px-4 py-1 w-[8vw] rounded-md"
                    >
                      Add
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}