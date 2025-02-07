import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';

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
            <h1 className="text-3xl font-bold mb-6 mt-20 text-center text-blue-600">My Saved Sheets</h1>
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-green-500"></div>
                        <span className="text-green-500 text-xl font-semibold">Loading!</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spreadsheets.map(spreadsheet => (
                        <div key={spreadsheet._id} className="bg-white p-4 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-2">{spreadsheet.sheetTitle}</h2>
                            <button className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                                onClick={() => navigate(`/spreadsheet/${spreadsheet._id}`)}>Open</button>
                            <button className="bg-red-500 ml-3 text-white px-2 py-1 rounded-lg" onClick={(e) => onDelete(e, spreadsheet)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
            {showPopup && (
                <div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg w-full max-w-xs mx-4 sm:mx-auto sm:w-auto">
                    Sheet deleted successfully!
                </div>
            )}
        </div>
    );
}

export default Dashboard;