import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const [spreadsheets, setSpreadsheets] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('userInfo');

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            const fetchSpreadsheets = async () => {
                try {
                    const userId = JSON.parse(token)._id; // Assuming the token contains user info as a JSON string
                    const response = await axios.get(`http://localhost:8000/api/spreadsheet/user/getsheet/${userId}`);
                    setSpreadsheets(response.data);
                } catch (error) {
                    console.error('Error fetching spreadsheets:', error);
                }
            };

            fetchSpreadsheets();
        }
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">My Saved Sheets</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spreadsheets.map(spreadsheet => (
                    <div key={spreadsheet._id} className="bg-white p-4 rounded-lg shadow-lg" 
                    onClick={() => navigate(`/spreadsheet/${spreadsheet._id}`)}>
                        <h2 className="text-xl font-bold mb-2">{spreadsheet.sheetTitle}</h2>
                        <div className="overflow-auto">
                            <table className="min-w-full bg-white">
                                <tbody>
                                    {spreadsheet.data && spreadsheet.data.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, colIndex) => (
                                                <td key={`${rowIndex}-${colIndex}`} className="border px-2 py-1">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;