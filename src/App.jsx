import React from 'react';
import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/dashboard';
import ToolbarProvider from './contexts/ToolbarContext';
import Spreadsheet from './components/Spreadsheet';
import {BrowserRouter as Router, Route, BrowserRouter, Routes} from 'react-router-dom';
import Home from './components/home';
import SpreadsheetDetail from './components/savedsheets';

function App() {
  return (
      <ToolbarProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/spreadsheet" element={<Spreadsheet/>}/>
          <Route path="/spreadsheet/:spreadsheetId" element={<SpreadsheetDetail/>} />
        </Routes>
          </BrowserRouter>
      </ToolbarProvider>
  );
}

export default App;
