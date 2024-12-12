import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from "../context/UserProvider";
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate(); // For navigation after login
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      console.log("DEBUG: Sending login request with:", { username, password });
      const response = await axios.post(
        "http://localhost:5000/login",
        {
          username,
          password,
        },
        { withCredentials: true } // Important for session-based authentication
      );

      if (response.status === 200) {
        setUser(username);
        navigate('/home'); // Redirect to the dashboard or home page
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
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
          {/* Circle behind the box */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-56 h-56 rounded-full z-0 flex items-center justify-center"
          >
            <img
              src="logoIcon.png" // Add your image path here
              alt="Circle Image"
              className="w-32 h-32 object-cover rounded-full -mt-24"
            />
          </div>

          {/* White Box */}
          <div className="bg-white w-full max-w-2xl h-[450px] p-12 rounded-lg shadow-lg z-10 relative">
            <h1 className="text-green-500 text-4xl font-bold mb-2 text-center">Login</h1> {/* Green Login Text */}
            {/* Two Gray Boxes */}
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="bg-gray-200 w-96 h-20 rounded-lg shadow-md flex items-center p-4"> {/* Increased width */}
                <img
                  src="personIcon.png" // Replace with your image path
                  alt="Image"
                  className="w-12 h-12 object-cover rounded-full mr-4" // Adjust image size and margin
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-200 w-full h-full rounded-lg pl-1 outline-none text-black placeholder-black text-xl" // Updated className
                />
              </div>
              <div className="bg-gray-200 w-96 h-20 rounded-lg shadow-md flex items-center p-4"> {/* Increased width */}
                <img
                  src="passwordIcon.png" // Replace with your image path
                  alt="Image"
                  className="w-12 h-12 object-cover rounded-full mr-4" // Adjust image size and margin
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-200 w-full h-full rounded-lg pl-1 outline-none text-black placeholder-black text-xl" // Updated className
                />
              </div>
            </div>
            <div className="flex-1 flex justify-end mt-6"> 
              <span className="text-sm text-green-500 cursor-pointer">
                <Link to="/forgot">
                  <span className="text-green-500 cursor-pointer"> Forgot Username/Password?</span>
                </Link>
              </span>
            </div>
            <div className="flex justify-center mt-4"> {/* Center the button below the text */}
              <div className="bg-green-500 w-48 h-12 rounded-full flex items-center justify-center shadow-lg">
                <button
                  onClick={handleLogin}  
                  className="bg-green-500 w-48 h-12 rounded-full flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-lg font-semibold">Login</span>
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-6"> {/* Increased margin-top for better spacing */}
              <span className="text-sm text-gray-600">Don't have an account?
                <Link to="/signup">
                  <span className="text-green-500 cursor-pointer"> Join Now</span>
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
