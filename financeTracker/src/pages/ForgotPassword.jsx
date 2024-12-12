import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('http://localhost:5000/request-reset', {
        email,
      });

      if (response.status === 200) {
        alert('Password reset link sent to your email');
        navigate('/login');
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      alert(error.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <>
      <header className="bg-black w-full fixed top-0 left-0 z-50">
        <div className="flex items-center p-4">
          <Link to = "/home">
            <img
              src="logoIcon.png"
              alt="Logo"
              className="w-12 h-12 object-cover rounded-full"
            />
          </Link>
          <span className="ml-4 text-lg font-semibold text-white">BudgetBuddy</span>
        </div>
      </header>
      <div className="flex justify-center items-center h-screen w-screen">
        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-56 h-56 rounded-full z-0 flex items-center justify-center">
            <img
              src="logoIcon.png"
              alt="Circle Image"
              className="w-32 h-32 object-cover rounded-full -mt-24"
            />
          </div>

          <div className="bg-white w-full max-w-2xl h-85 p-12 rounded-lg shadow-lg z-10 relative">
            <h1 className="text-green-500 text-4xl font-bold mb-8 text-center">Forgot Password/Username</h1>
            <div className="flex flex-col items-center space-y-4 w-full mt-6">
              <div className="bg-gray-200 w-96 h-20 rounded-lg shadow-md flex items-center p-4">
                <img
                  src="emailIcon.png"
                  alt="Email Icon"
                  className="w-12 h-12 object-cover rounded-full mr-4"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-200 w-full h-full rounded-lg pl-1 outline-none text-black placeholder-black text-xl"
                />
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <div className="bg-green-500 w-48 h-12 rounded-full flex items-center justify-center shadow-lg">
                <button
                  onClick={handleForgotPassword}
                  className="bg-green-500 w-48 h-12 rounded-full flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-lg font-semibold">Submit</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Link to="/login" className="text-green-500 text-sm">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
