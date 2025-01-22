import React, { createContext, useState, useRef, useEffect } from 'react';

export const ToolbarContext = createContext();

const ToolbarProvider = ({ children }) => {

    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    const toggleBold = () => {
        setIsBold(!isBold);
        console.log('bold', isBold);
    };

    const toggleItalic = () => {
        setIsItalic(!isItalic);
        console.log('italic', isItalic);
    }
    
    return (
        
        <ToolbarContext.Provider value={{ isBold, isItalic, toggleBold, toggleItalic }}>
            {children}
        </ToolbarContext.Provider>
    )
}

export default ToolbarProvider;