import React from 'react';

import ToolbarProvider from './contexts/ToolbarContext';
import Spreadsheet from './components/Spreadsheet';
import {BrowserRouter as Router, Route, BrowserRouter, Routes} from 'react-router-dom';

function App() {
  return (
      <ToolbarProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Spreadsheet/>}/>
        </Routes>
          </BrowserRouter>
      </ToolbarProvider>
  );
}

export default App;
