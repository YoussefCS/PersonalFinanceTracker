import React from "react";
import {Link} from 'react-router-dom';
export default function Sidebar() {
  return (
    <div className="flex flex-col w-44 fixed left-0 top-0 h-full items-center bg-black">
      {/* Icon */}
      <div className="pt-3">
        <Link to="/home">
          <img
            src="./logoIcon.png"
            alt="Company Logo"
            className="h-[70px] w-[70px] object-center"
          />
        </Link>
      </div>
      {/* Navigation */}
      <nav className="pt-10">
        <ul className="flex flex-col">
          <li className="flex gap-2 items-center">
            <img
              src={"./summaryPage/homeNavIcon.png"}
              alt="Home Icon"
              className="h-[35px] w-[35px] object-center"
            />
            <a href="/home">Home</a>
          </li>
          <li className="flex gap-2 items-center">
            <img
              src={"./summaryPage/summaryNavIcon.png"}
              alt="Summary Icon"
              className="h-[35px] w-[35px] object-center"
            />
            <a href="/summary">Summary</a>
          </li>
          <li className="flex gap-2 items-center">
            <img
              src={"./summaryPage/budgetBotNavIcon.png"}
              alt="BudgetBot Icon"
              className="h-[35px] w-[35px] object-center"
            />
            <a href="/budgetbot">BudgetBot</a>
          </li>
          <li className="flex gap-2 items-center">
            <img
              src={"./summaryPage/settingNavIcon.png"}
              alt="Setting Icon"
              className="h-[35px] w-[35px] object-center"
            />
            <a href="/personal-Info">Settings</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
