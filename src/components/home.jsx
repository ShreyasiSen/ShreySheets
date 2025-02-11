import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const handleCreateSpreadsheet = () => {
        if (userInfo) {
            navigate('/spreadsheet');
        } else {
            alert('Please login to create a spreadsheet');
            navigate('/login');
        }
    };

    return (
        <div>
            <Navbar />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-700 text-white">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center"
                >
                    {userInfo && <h1 className="text-5xl font-bold mb-4">Hello, {userInfo.username}</h1>}
                    <h1 className="text-5xl font-bold mb-4">Welcome to Spreadsheet App</h1>
                    <p className="text-xl mb-8">Create and manage your spreadsheets with ease</p>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg mr-6 shadow-lg hover:bg-gray-100 transition duration-300"
                            onClick={handleCreateSpreadsheet}
                        >
                            Create Spreadsheet
                        </motion.button>
                    <Link to="/register">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
                        >
                           Register Now
                        </motion.button>
                    </Link>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-12"
                >
                    {/* <img
                    src="https://via.placeholder.com/600x400"
                    alt="Spreadsheet Preview"
                    className="rounded-lg shadow-lg"
                /> */}
                </motion.div>
            </div>
        </div>
    );
};

export default Home;