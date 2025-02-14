import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';
import { motion } from 'framer-motion';

function Dashboard() {
    const API_URL = import.meta.env.PROD ? 'https://shreysheets-backend.onrender.com' : 'http://localhost:8000';
    const [spreadsheets, setSpreadsheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const token = localStorage.getItem('userInfo');

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            const fetchSpreadsheets = async () => {
                try {
                    const userId = JSON.parse(token)._id; // Assuming the token contains user info as a JSON string
                    const response = await axios.get(`${API_URL}/api/spreadsheet/user/getsheet/${userId}`);
                    setSpreadsheets(response.data);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching spreadsheets:', error);
                    setLoading(false);
                }
            };

            fetchSpreadsheets();
        }
    }, [token, navigate]);

    const onDelete = async (e, spreadsheet) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`${API_URL}/api/spreadsheet/${spreadsheet._id}`);
            console.log(response.data);
            navigate('/dashboard');
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
        } catch (error) {
            console.error('Error deleting spreadsheet:', error);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Navbar />
            <main className="flex-grow mt-20">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">My Saved Sheets</h1>
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-t-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
                        <span className="text-green-500 text-xl font-semibold mt-4">Loading!</span>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, staggerChildren: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" // Added xl breakpoint
                    >
                        {spreadsheets.map(spreadsheet => (
                            <motion.div
                                key={spreadsheet._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white p-6 rounded-lg shadow-lg hover:scale-105 transition duration-300 relative" // Added relative for absolute positioning of buttons
                            >
                                <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-1">{spreadsheet.sheetTitle}</h2> {/* Added line-clamp */}
                                <div className="absolute bottom-4 right-4 flex space-x-2"> {/* Moved buttons inside, absolute positioning */}
                                    <button
                                        className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded-lg transition duration-300 text-sm" // Smaller text
                                        onClick={() => navigate(`/spreadsheet/${spreadsheet._id}`)}
                                    >Open</button>
                                    <button
                                        className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded-lg transition duration-300 text-sm" // Smaller text
                                        onClick={(e) => onDelete(e, spreadsheet)}
                                    >Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {showPopup && (
                    <div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg w-full max-w-xs mx-4 sm:mx-auto sm:w-auto transform translate-y-20 transition-transform duration-300">
                        Sheet deleted successfully!
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
