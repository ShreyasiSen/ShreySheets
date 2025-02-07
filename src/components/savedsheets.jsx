import React, { useState, useRef, useEffect, } from 'react';
import { ToolbarContext } from '../contexts/ToolbarContext';
import { useContext } from 'react';
import '../index.css';
import axios, { Axios } from 'axios';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { use } from 'react';
import Navbar from './navbar';

const numRows = 10;
const numCols = 10;

const Spreadsheet = () => {
    const API_URL = import.meta.env.PROD ? 'https://shreysheets-backend.onrender.com' : 'http://localhost:8000';
    const { spreadsheetId } = useParams();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const id = userInfo._id;

    const { isBold, isItalic, toggleBold, toggleItalic, } = useContext(ToolbarContext);
    const [data, setData] = useState(
        Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => ({ isBold: false, isItalic: false, value: '' }))
        )
    );

    const [selectedCells, setSelectedCells] = useState([]);
    const [dragging, setDragging] = useState(false);
    const startCell = useRef(null);
    const [fontSize, setFontSize] = useState(12);
    const [fontColor, setFontColor] = useState('black');
    const [toggleColorValue, setFontColorValue] = useState(false);
    const [formula, setFormula] = useState('');
    const [calculatedResult, setCalculatedResult] = useState(0);
    const [save, toggleSave] = useState(false);
    const [sheetTitle, setSheetTitle] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const handleInputChange = (row, col, e) => {
        e.preventDefault();
        const value = e.target.value;
        const updatedData = [...data];
        const bold = document.getElementById(`${row}-${col}`).style.fontWeight;
        const italic = document.getElementById(`${row}-${col}`).style.fontStyle;
        updatedData[row][col] = { value: value, isBold: bold === 'bold' ? true : false, isItalic: italic === 'italic' ? true : false };
        setData(updatedData);
        //console.log(data);
    };

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSheet = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/spreadsheet/${spreadsheetId}`);
                console.log(response.data);
                setData(response.data.data);
                setSheetTitle(response.data.sheetTitle);
                response.data.data.map((row, rowIndex) => {
                    row.map((cell, colIndex) => {
                        if (cell.value === '') return;
                        document.getElementById(`${rowIndex}-${colIndex}`).style.fontWeight = cell.isBold ? 'bold' : 'normal';
                        document.getElementById(`${rowIndex}-${colIndex}`).style.fontStyle = cell.isItalic ? 'italic' : 'normal';
                        document.getElementById(`${rowIndex}-${colIndex}`).value = cell.value;
                    });
                });

                setSheetTitle(response.data.sheetTitle);
            } catch (error) {
                console.log(error);
            }
        }
        fetchSheet();
    }, [navigate, spreadsheetId]);

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

    const toggleSize = () => {
        console.log('size', fontSize);
    }

    const toggleColor = () => {
        setFontColorValue(!toggleColorValue);
        console.log('color', fontColor);
    }

    const changeSize = (e) => {

        console.log('size', fontSize);
    }

    const plusSize = () => {
        setFontSize(fontSize + 1);
    }

    const minusSize = () => {
        setFontSize(fontSize - 1);
        if (fontSize <= 1) {
            setFontSize(1);
            alert('Minimum font size reached');
        }
    }

    const saveClick = () => {
        try {
            const dataToSend = {
                data: data,
                sheetTitle: sheetTitle,
                userid: id
            }
            axios.put(`${API_URL}/api/spreadsheet/${spreadsheetId}`, dataToSend);
            setShowSuccessDialog(true);
            setTimeout(() => {
                setShowSuccessDialog(false);
            }, 1500);
        }
        catch (error) {
            console.log(error);
        }
    }

    const cancelSave = () => {
        toggleSave(false);
    }

    const settingTitle = (e) => {
        setSheetTitle(e.target.value);
    }

    const formulaTyping = (e) => {
        e.preventDefault();
        setFormula(e.target.value);
    }

    let previousColorButton = null;

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
        <div>
            <Navbar />
            <div className="spreadsheet-container mt-20">
                <h1 className="text-4xl font-bold text-left ml-6 text-blue-600 mb-6">{sheetTitle}</h1>
                {/*add a formula bar here*/}
                <div className='flex ml-4 '>
                    <div className="formula-bar flex items-center justify-between p-2 mb-5 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-blue-700 text-white">
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

                    <div className="result-bar font-semibold flex items-center p-1 mb-5 ml-6 w-60 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-blue-700 text-white">
                        <span>Result: {calculatedResult}</span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="toolbar flex space-x-2 mb-4">
                    <div className="toolbar flex ml-6 space-x-2 mb-4">
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
                        Update
                    </button>

                </div>

                <div className="top-0 left-0 bg-white z-10 w-5">
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
                                    className={`grid-cell p-2 border border-green-800 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSelected(rowIndex, colIndex) ? 'bg-white' : 'bg-white'
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
            {showSuccessDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm mx-4 sm:mx-auto">
                        <h2 className="text-xl font-semibold mb-4 text-center text-green-500">Update Successful!</h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Spreadsheet;