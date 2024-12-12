import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLinkValid, setIsLinkValid] = useState(false); // Track link validity
  const navigate = useNavigate();
  const { email, uniqueKey } = useParams();

  useEffect(() => {
    const checkLinkValidity = async () => {
      try {
        // Send GET request to check if the reset link is valid
        const response = await axios.get(
          `http://localhost:5000/reset/${email}/${uniqueKey}` // Adjusted backend URL
        );
        
        if (response.status === 200) {
          setIsLinkValid(true); // Set link valid if response is successful
        }
      } catch (error) {
        console.error('Error checking link validity:', error);
        setErrorMessage('The reset link is invalid or expired.');
        setIsLinkValid(false); // Ensure link is invalid if there's an error
      }
    };

    checkLinkValidity(); // Call the function on component mount
  }, [email, uniqueKey]);

  const handleResetPassword = async () => {
    if (!newPassword) {
      alert('Password cannot be empty.');
      return;
    }

    try {
      // Send POST request to reset the password
      const response = await axios.post(
        `http://localhost:5000/reset/${email}/${uniqueKey}`,
        { new_password: newPassword }
      );

      if (response.status === 200) {
        alert('Password has been updated successfully');
        navigate('/login'); // Redirect to the login page after password reset
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrorMessage(error.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <>
      <header className="bg-black w-full fixed top-0 left-0 z-50">
        <div className="flex items-center p-4">
          <img
            src="/logoIcon.png"
            alt="Logo"
            className="w-12 h-12 object-cover rounded-full"
          />
          <span className="ml-4 text-lg font-semibold text-white">BudgetBuddy</span>
        </div>
      </header>

      <div className="flex justify-center items-center h-screen w-screen">
        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-56 h-56 rounded-full z-0 flex items-center justify-center">
            <img
              src="/logoIcon.png"
              alt="Circle Image"
              className="w-32 h-32 object-cover rounded-full -mt-24"
            />
          </div> 

          <div className="bg-white w-full max-w-2xl h-85 p-12 rounded-lg shadow-lg z-10 relative">
            <h1 className="text-green-500 text-4xl font-bold mb-8 text-center">
              Reset Password
            </h1>

            {errorMessage && (
              <div className="text-red-500 text-center mb-4">
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Only show form if link is valid */}
            {isLinkValid ? (
              <div className="flex flex-col items-center space-y-4 w-full mt-6">
                <div className="bg-gray-200 w-96 h-20 rounded-lg shadow-md flex items-center p-4">
                  <img
                    src="/passwordIcon.png"
                    alt="Password Icon"
                    className="w-12 h-12 object-cover rounded-full mr-4"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-200 w-full h-full rounded-lg pl-1 outline-none text-black placeholder-black text-xl"
                  />
                </div>
              </div>
            ) : (
              <div className="text-red-500 text-center mt-4">
                <p>The reset link is invalid or expired.</p>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <div className=" w-48 h-12 rounded-full flex items-center justify-center shadow-lg">
                <button
                  onClick={handleResetPassword}
                  className="text-white text-lg font-semibold"
                  disabled={!isLinkValid} // Disable if link is invalid
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
