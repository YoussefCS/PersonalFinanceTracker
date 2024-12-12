import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserProvider";
import axios from "axios";
import Sidebar from "../components/Sidebar";

function PersonalInfo() {
  const { resetUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user details on component load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user", { withCredentials: true });
        const { username, email } = response.data;
        setUserInfo({ username, email });
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user details:", error.response?.data || error.message);
        alert("Failed to fetch user details. Redirecting to login.");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle input change for profile editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated profile details
  const handleUpdate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/edit",
        { username: userInfo.username, email: userInfo.email },
        { withCredentials: true }
      );
      alert(response.data.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error.response?.data || error.message);
      alert("Failed to update profile. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
      resetUser();
      navigate("/home");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      alert("Logout failed. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="flex h-screen justify-center items-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar />

      {/* Profile Section */}
      <main className="flex-1 flex items-center justify-center bg-gray-200">
        <section className="bg-white p-8 rounded-lg shadow-md w-full h-full flex flex-col items-center justify-center">
          {/* Logo */}
          <img
            src="./logoIcon.png"
            alt="Company Logo"
            className="w-28 h-28 object-cover mb-6"
          />
          <h1 className="text-4xl font-semibold mb-6">Personal Info</h1>
          
          <div className="space-y-6 w-full max-w-lg flex flex-col items-center">
            {/* Username Field */}
            <div className="flex items-center border border-gray-300 rounded p-4 w-full bg-white">
              <img
                src="./personIcon.png"
                alt="Person Icon"
                className="w-10 h-10"
              />
              <input
                type="text"
                name="username"
                value={userInfo.username}
                onChange={handleChange}
                placeholder="Username"
                className="block w-full bg-white text-black text-lg p-3 border-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email Field */}
            <div className="flex items-center border border-gray-300 rounded p-4 w-full bg-white">
              <img
                src="./emailIcon.png"
                alt="Email Icon"
                className="w-10 h-10"
              />
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                placeholder="Email"
                className="block w-full bg-white text-black text-lg p-3 border-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white py-4 px-10 text-xl rounded-full mt-8 hover:bg-green-600"
          >
            Save Changes
          </button>

          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white py-4 px-10 text-xl rounded-full mt-8 hover:bg-gray-600"
          >
            Log Out
          </button>
        </section>
      </main>
    </div>
  );
}

export default PersonalInfo;
