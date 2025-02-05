import React, { useState, useRef, useEffect } from 'react';
import { ToolbarContext } from '../contexts/ToolbarContext';
import { useContext } from 'react';
import '../index.css';
import axios, { Axios } from 'axios';
import { Await } from 'react-router-dom';

const numRows = 50;
const numCols = 15;

const Spreadsheet = () => {
    const API_URL= import.meta.env.PROD? 'https://shreysheets-backend.onrender.com': 'http://localhost:8000';
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const id = userInfo._id;

    const { isBold, isItalic, toggleBold, toggleItalic } = useContext(ToolbarContext);
    const [data, setData] = useState(
        Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => ({ isBold: false, isItalic: false,value: '' }))
        )
    );

    const [selectedCells, setSelectedCells] = useState([]);
    const [dragging, setDragging] = useState(false);
    const startCell = useRef(null);
    const [formula, setFormula] = useState('');
    const [calculatedResult, setCalculatedResult] = useState(0);
    const [save, toggleSave] = useState(false);
    const [sheetTitle, setSheetTitle] = useState('');

    const handleInputChange = (row, col, e) => {
        e.preventDefault();
        const value = e.target.value;
        const updatedData = [...data];
        const bold=document.getElementById(`${row}-${col}`).style.fontWeight;
        const italic=document.getElementById(`${row}-${col}`).style.fontStyle;
        updatedData[row][col]={value:value, isBold: bold==='bold'?true:false, isItalic: italic==='italic'?true:false};
        setData(updatedData);
        //console.log(data);
    };

    const handleMouseDown = (row, col) => {
        startCell.current = { row, col };
        setDragging(true);
        setSelectedCells([{ row, col }]);
    };

    const handleMouseOver = (row, col) => {
        if (dragging) {
            const newSelection = [];
            const startRow = Math.min(startCell.current.row, row);
            const endRow = Math.max(startCell.current.row, row);
            const startCol = Math.min(startCell.current.col, col);
            const endCol = Math.max(startCell.current.col, col);

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startCol; c <= endCol; c++) {
                    newSelection.push({ row: r, col: c });
                }
            }
            setSelectedCells(newSelection);
        }
    };

    const handleMouseUp = () => {
        setDragging(false);

        // Copy content from start cell to all selected cells
        if (selectedCells.length > 1) {
            const { row: startRow, col: startCol } = startCell.current;
            const contentToCopy = data[startRow][startCol];

            const updatedData = [...data];
            selectedCells.forEach(({ row, col }) => {
                updatedData[row][col] = contentToCopy;
            });
            setData(updatedData);
        }

        setSelectedCells([]);
        startCell.current = null;
    };

    const isSelected = (row, col) => {
        return selectedCells.some((cell) => cell.row === row && cell.col === col);
    };

    

    const saveClick = () => {
        toggleSave(!save);
    }

    const cancelSave = () => {
        toggleSave(false);
    }

    const settingTitle = (e) => {
        setSheetTitle(e.target.value);
    }

    const saveSheet = () => {
        try {
            axios.post(`${API_URL}/api/spreadsheet/${id}`, {userid:id, sheetTitle: sheetTitle, data: data });
            toggleSave(false);
        } catch (error) {
            console.log('Error saving sheet');
        }
    }

    const formulaTyping = (e) => {
        e.preventDefault();
        setFormula(e.target.value);
    }

    useEffect(() => {
        if (isBold && isItalic) {
            document.querySelector('.toolbar-button-idi').style.backgroundColor = 'blue';
            document.querySelector('.toolbar-button-bld').style.backgroundColor = 'blue';
            document.querySelectorAll('.grid-cell').forEach(cell => {
                if (cell.value !== '') return;
                cell.style.fontWeight = 'bold';
                cell.style.fontStyle = 'italic';
            });
        }
        else if (isBold && !isItalic) {
            document.querySelector('.toolbar-button-bld').style.backgroundColor = 'blue';
            document.querySelector('.toolbar-button-idi').style.backgroundColor = 'lightgray';
            document.querySelectorAll('.grid-cell').forEach(cell => {
                if (cell.value !== '') return;
                cell.style.fontWeight = 'bold';
                cell.style.fontStyle = 'normal';
            });
        }
        else if (!isBold && isItalic) {
            document.querySelector('.toolbar-button-idi').style.backgroundColor = 'blue';
            document.querySelector('.toolbar-button-bld').style.backgroundColor = 'lightgray';
            document.querySelectorAll('.grid-cell').forEach(cell => {
                if (cell.value !== '') return;
                cell.style.fontWeight = 'normal';
                cell.style.fontStyle = 'italic';
            });
        } else {
            document.querySelectorAll('.grid-cell').forEach(cell => {
                document.querySelector('.toolbar-button-idi').style.backgroundColor = 'lightgray';
                document.querySelector('.toolbar-button-bld').style.backgroundColor = 'lightgray';
                if (cell.value !== '') return;
                cell.style.fontWeight = 'normal';
                cell.style.fontStyle = 'normal';
            });
        }
    }, [isBold, isItalic]);

    return (
        <div className="spreadsheet-container p-4">
            <h1 className="text-4xl font-bold text-left text-blue-600 mb-6">{userInfo.username}&apos;s sheet</h1>
            {/*add a formula bar here*/}
            <div className='flex '>
                <div className="formula-bar flex items-center justify-between p-2 mb-5 w-1/2 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-blue-700 text-white">
                    <input
                        type="text"
                        className="flex-grow mr-2 bg-transparent font-semibold border-none outline-none text-white placeholder-white"
                        placeholder="Enter formula..."
                        onChange={formulaTyping}
                    />
                    <button
                        className="formula-button font-bold text-l mr-2 w-18 h-8 bg-white text-black rounded-lg px-4 hover:bg-gray-100"
                        
                    >
                        Apply
                    </button>
                </div>

                <div className="result-bar font-semibold flex ml-96 items-center p-5 mb-5 w-56 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-blue-700 text-white">
                    <span>RESULT : {calculatedResult}</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar flex space-x-2 mb-4">
                <div className="toolbar flex space-x-2 mb-4">
                    <button
                        className="toolbar-button-bld bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-2 py-1"
                        onClick={toggleBold}
                    >
                        <b>B</b>
                    </button>
                    <button
                        className="toolbar-button-idi bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-2 py-1"
                        onClick={toggleItalic}
                    >
                        <i>I</i>
                    </button>
                    
                </div>
                
                <button className='toolbar-button bg-red-600 hover:bg-red-500 text-white font-semibold 
                rounded-lg px-4 py-2 absolute right-10' onClick={saveClick}>
                    Save As
                </button>
                {save && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                            <h2 className="text-xl font-semibold mb-4">Save As</h2>
                            <input
                                type="text"
                                className="w-full p-2 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                                placeholder="Enter file name" onChange={settingTitle}
                            />
                            <div className="flex justify-end space-x-4">
                                <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg px-4 py-2" onClick={cancelSave}>
                                    Cancel
                                </button>
                                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2" onClick={saveSheet}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid */}
    <div className="sticky top-0 left-0 bg-white z-10 w-5">
        <div 
            className="grid" 
            style={{
                gridTemplateColumns: `50px repeat(${data[0].length}, 100px)`, // Adjust for row numbers
            }}
        >
            {/* Empty top-left cell */}
            <div className="w-12 h-10"></div>
            {/* Column Headers */}
            {data[0].map((_, colIndex) => (
                <div 
                    key={`col-${colIndex}`} 
                    className="w-24 h-5 flex items-center justify-center font-bold"
                >
                    {colIndex + 1}
                </div>
            ))}
        </div>
    </div>

    {/* Grid Content (With Row Headers) */}
    <div 
        className="grid" 
        style={{
            gridTemplateColumns: `50px repeat(${data[0].length}, 100px)`, // Ensure row numbers
            gridAutoRows: 'minmax(10px, auto)',
        }}
    >
        {data.map((row, rowIndex) => (
            <>
                {/* Row Number (Fixed on Scroll) */}
                <div 
                    key={`row-${rowIndex}`} 
                    className="sticky left-0 w-9 h-10 mt-3 flex items-center justify-center font-bold"
                >
                    {rowIndex + 1}
                </div>

                {/* Grid Cells */}
                {row.map((cell, colIndex) => (
                    <textarea
                        key={`${rowIndex}-${colIndex}`}
                        id={`${rowIndex}-${colIndex}`}
                        className={`grid-cell p-2 border border-green-800 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isSelected(rowIndex, colIndex) ? 'bg-white' : 'bg-white'
                        }`}
                        onInput={(e) => handleInputChange(rowIndex, colIndex, e)}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                        style={{ fontSize: `${cell.fontSize}px` }}
                    >
                        {cell.text}
                    </textarea>
                ))}
            </>
        ))}
    </div>
</div>
    );
};

export default Spreadsheet;