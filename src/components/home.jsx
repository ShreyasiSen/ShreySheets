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

    const text = "Developed by Shreyasi Sen";
    const [displayedText, setDisplayedText] = React.useState("");
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.substring(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            } else {

                setTimeout(() => {
                    setDisplayedText("");
                    setCurrentIndex(0);
                }, 3000); // Pause for 2 seconds before restarting
            }
        }, 100);

        return () => clearTimeout(timer); // Clean up on unmount
    }, [currentIndex, text]);

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
                    {userInfo && <h1 className="text-4xl font-serif mt-20 pr-6 font-bold mb-2">Hello, {userInfo.username}</h1>}
                    <h1 className="text-5xl mt-10 font-serif font-bold mb-4">Welcome to Spreadsheet App</h1>
                    <p className="text-xl mb-8">Create and manage your spreadsheets with ease</p>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg mr-6 shadow-lg hover:bg-blue-700 transition duration-300"
                        onClick={handleCreateSpreadsheet}
                    >
                        Create Spreadsheet
                    </motion.button>
                    {!userInfo && (
                        <Link to="/register">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                 className="bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg mr-6 shadow-lg hover:bg-blue-700 transition duration-300"
                            >
                                Register Now
                            </motion.button>
                        </Link>
                    )}
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-28"
                >
                </motion.div>
                <div className="flex justify-center items-center text-black font-medium text-2xl"> {/* Added some basic styling */}
                    <span className="animate-pulse">{/* Optional: Add a subtle pulse animation */}
                        {displayedText}
                        <span className="inline-block w-1 h-6 ml-1 bg-gray-800 animate-blink"></span> {/* Typing cursor */}
                    </span>
                </div>
            </div>
            <footer className="bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-800 text-white py-4 text-center">
                <p>&copy; {new Date().getFullYear()} ShreySheets. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;