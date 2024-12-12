import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar"; // Import Sidebar

const BudgetBot = () => {
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const genAI = new GoogleGenerativeAI("AIzaSyDzSTXab-1xDNFF56CxNjv8WxcPb8hgLzU");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Financial advising prompt
  const advisingPrompt = `You are BudgetBot, a highly intelligent financial advisor. 
  Your role is to help users with budgeting, saving, investing, and planning their finances effectively.
  Always provide concise, actionable, and easy-to-understand advice tailored to the user's needs.`;

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    if (inputValue.trim() === "") return;

    // Add user input to chat history
    setChatHistory([...chatHistory, { sender: "User", text: inputValue }]);
    setInputValue(""); // Clear input after submission

    // Generate response from BudgetBot
    try {
      const result = await model.generateContent(advisingPrompt + "\nUser: " + inputValue);
      setChatHistory((prev) => [
        ...prev,
        { sender: "BudgetBot", text: result.response.text() },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-screen h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content section */}
      <div className="flex-1 p-6 pl-56"> {/* Add left padding to avoid overlap */}
        {/* Title section */}
        <div className="flex flex-col items-center mb-5">
          <img
            src="botIcon.png"
            alt="Bot Icon"
            className="w-12 h-12 mr-4"
          />
          <h1 className="text-2xl font-semibold">BudgetBot</h1>
        </div>

        {/* Chat container */}
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-100">
          <div className="max-h-96 overflow-y-auto mb-4">
            {chatHistory.map((message, index) => (
              <div key={index} className="mb-4">
                <div
                  className={`font-bold ${
                    message.sender === "User" ? "text-blue-500" : "text-green-600"
                  }`}
                >
                  {message.sender}:
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "User" ? "bg-blue-100" : "bg-green-100"
                  } text-black`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full p-3 rounded-md border border-gray-300 mb-4 bg-white text-black"
          />
          <button
            onClick={handleSubmit}
            className="w-full p-3 rounded-md bg-green-500 text-white cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetBot;
