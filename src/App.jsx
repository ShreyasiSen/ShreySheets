import React from 'react';
import Login from './components/login';
import ToolbarProvider from './contexts/ToolbarContext';
import Spreadsheet from './components/Spreadsheet';
import {BrowserRouter as Router, Route, BrowserRouter, Routes} from 'react-router-dom';
import ForgotPassword from './components/forgotPassword';
import ResetPassword from './components/resetPassword';

function App() {
  return (
      <ToolbarProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Spreadsheet/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
          </BrowserRouter>
      </ToolbarProvider>
  );
}

export default App;
