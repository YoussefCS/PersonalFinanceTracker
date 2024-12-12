// api.jsx
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust if your Flask app runs on a different port

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data; // { message: 'User registered successfully' }
    } catch (error) {
        throw error.response.data; // Handle error response
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        return response.data; // { message: 'Login successful' }
    } catch (error) {
        throw error.response.data; // Handle error response
    }
};

export const requestPasswordReset = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/request-reset`, { email });
        return response.data; // { message: 'Password reset email sent' }
    } catch (error) {
        throw error.response.data; // Handle error response
    }
};

export const resetPassword = async (resetData) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, resetData);
        return response.data; // { message: 'Password updated successfully' }
    } catch (error) {
        throw error.response.data; // Handle error response
    }
}
export const filterExpenses = async (userId, filters) => {
    try {
        const response = await axios.get(`${API_URL}/api/expenses/filter`, {
            params: {
                user_id: userId,
                sort_by: filters.sortBy || 'date',  // Default to 'date' if not provided
                order: filters.order || 'desc'      // Default to 'desc' if not provided
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error fetching filtered expenses' };
    }
};
