import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const isAuthenticated = localStorage.getItem('userInfo');

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            localStorage.removeItem('userInfo');
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <nav className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white shadow-md p-4">
            <div className=" flex items-center justify-between">
                {/* Logo */}
                <div className="text-xl font-bold ">
                    <Link to="/" className="text-white hover:text-indigo-300 transition duration-300">
                        ShreySheets
                    </Link>
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-4 items-center ml-auto">
                    <Link to="/" className="hover:text-indigo-300 transition duration-300">Home</Link>
                    <Link to="/Dashboard" className="hover:text-indigo-300 transition duration-300">Profile</Link>
                    <Link to="/pricing" className="hover:text-indigo-300 transition duration-300">Pricing</Link>
                    {isAuthenticated ? (
                        <button 
                            onClick={handleLogout} 
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="hover:text-indigo-300 transition duration-300">Login</Link>
                    )}
                </div>
                
                {/* Mobile Hamburger Icon */}
                <div className="md:hidden flex items-center">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="text-white focus:outline-none">
                        {!isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-purple-700 text-white p-4 space-y-4">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="block hover:text-indigo-300 transition duration-300">Home</Link>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block hover:text-indigo-300 transition duration-300">Dashboard</Link>
                    <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="block hover:text-indigo-300 transition duration-300">Pricing</Link>
                    {isAuthenticated ? (
                        <button 
                            onClick={(e) => { handleLogout(e); setIsMenuOpen(false); }} 
                            className="block w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block hover:text-indigo-300 transition duration-300">Login</Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;