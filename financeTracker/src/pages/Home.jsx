import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from "../context/UserProvider";

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-black shadow-md py-4 px-6 flex justify-between items-center">

        {/* Logo and Company Name */}
        <div className="flex items-center space-x-3">
          <img src="/logoIcon.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold">BudgetBuddy</span>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:text-[#1FC978] text-white">Home</Link></li>
          <li><Link to="/summary" className="hover:text-[#1FC978] text-white">Summary</Link></li>
          <li><Link to="/budgetbot" className="hover:text-[#1FC978] text-white">BudgetBot</Link></li>
          {user ? (
            <li
              className="px-4 bg-green-500 text-white rounded-full shadow-md hover:bg-green-700 transition duration-300 cursor-pointer"
              title="Go to Profile"
              onClick={() => navigate("/personal-info")}
            >
              {user}
            </li> // Display username with rounded border and hover effect
          ) : (
            <li>
              <Link to="/login" className="hover:text-[#1FC978] text-white">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Header */}
      <header className="flex flex-col items-start justify-center text-left py-20 px-6 bg-black text-white bg-[url('background1.png')] bg-cover bg-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Manage Your Finance,<br />
            Expand Your Savings
          </h1>
          <img src="/increaseIcon1.png" alt="Finance Image" className="w-16 h-16 md:w-24 md:h-24 object-contain" />
        </div>
        <p className="text-xl md:text-m">
          Track your savings and expenses effortlessly with our finance tool.<br />
          Visualize your financial health through interactive charts, helping you stay on top of your budget.
        </p>
        <Link to="/Signup">
          <button className="mt-4 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300">
            Register Now →
          </button>
        </Link>
        <img src="/pigMoneyIcon1.png" alt="Finance Image" className="mt-2 ml-auto w-32 h-32 md:w-44 md:h-44 object-contain rounded-lg shadow-md" />
      </header>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 px-6 md:px-20">
        {/* Card 1 */}
        <div className="bg-white p-6 shadow-lg rounded-lg transform transition-transform duration-300 hover:scale-105">
          <img src="/savingsIcon.png" alt="Savings Icon" className="h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-3 text-green-500 text-center">Savings</h3>
          <p className="text-gray-600">
            Easily track your savings and watch your progress over time. Visualize your growth with clear charts to stay motivated and reach your financial goals.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 shadow-lg rounded-lg transform transition-transform duration-300 hover:scale-105">
          <img src="/summaryIcon.png" alt="Summary Icon" className="h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-3 text-green-500 text-center">Summary</h3>
          <p className="text-gray-600">
            See a complete snapshot of your finances with a comparison of your savings and expenses. Use interactive charts to quickly assess your budget and adjust as needed.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 shadow-lg rounded-lg transform transition-transform duration-300 hover:scale-105">
          <img src="/expensesIcon.png" alt="Expenses Icon" className="h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-3 text-green-500 text-center">Expenses</h3>
          <p className="text-gray-600">
            Manage your spending by tracking all your expenses in one place. Get detailed breakdowns to identify areas for improvement and stay in control of your finances.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;