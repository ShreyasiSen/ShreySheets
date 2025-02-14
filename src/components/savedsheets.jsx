import React, { useState, useRef, useEffect, } from 'react';
import { ToolbarContext } from '../contexts/ToolbarContext';
import { useContext } from 'react';
import '../index.css';
import axios, { Axios } from 'axios';
import { ChevronDown } from "lucide-react";
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
    const startCell = useRef(null);
    const [fontSize, setFontSize] = useState(12);
    const [fontColor, setFontColor] = useState('black');
    const [toggleColorValue, setFontColorValue] = useState(false);
    const [calculatedResult, setCalculatedResult] = useState('');
    const [prompt, setPrompt] = useState('');
    const [geminiResponse, setGeminiResponse] = useState('');
    const [finalResult, setFinalResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [save, toggleSave] = useState(false);
    const [sheetTitle, setSheetTitle] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
        const [showFontSizeOptions, setShowFontSizeOptions] = useState(false);
        const dropdownRef = useRef(null);

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

    const isSelected = (row, col) => {
        return selectedCells.some((cell) => cell.row === row && cell.col === col);
    };

    const handleFormulaClick = () => {
        setIsOpen(!isOpen);
    };

    const toggleColor = () => {
        setFontColorValue(!toggleColorValue);
        console.log('color', fontColor);
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
    useEffect(() => {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            if (cell.value !== '') return;
            cell.style.fontSize = `${fontSize}px`;
        }, [fontSize])
    });


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
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };

    const handleGeminiRequest = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/gemini`, { description: prompt });
            const generatedFormula = response.data.response;

            setGeminiResponse(generatedFormula);

            // Compute the result based on the generated formula
            formulaTyped(generatedFormula);
        } catch (error) {
            console.error('Error processing request:', error);
            setGeminiResponse('Error processing request');
            setFinalResult('');
        } finally {
            setLoading(false);
        }
    };

    // Function to process formulas
    const formulaTyped = (formula) => {
        if ((formula.substring(0, 3) === 'SUM' || formula.substring(0, 3) === 'sum') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle SUMROW
            let row = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let sum = 0;
            let count = 0;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i].value);
                if (!isNaN(dat)) {
                    sum += dat;
                    count++;
                }
            }
            setCalculatedResult(sum);
        } else if ((formula.substring(0, 3) === 'SUM' || formula.substring(0, 3) === 'sum') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle SUMCOL
            let col = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let sum1 = 0;
            let count = 0;
            for (let i = 1; i <= numRows; i++) {
                let datt = parseFloat(data[i][col].value);
                if (!isNaN(datt)) {
                    sum1 += datt;
                    count++;
                }
            }
            setCalculatedResult(sum1);
        } else if ((formula.substring(0, 3) === 'AVG' || formula.substring(0, 3) === 'avg') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle AVGR
            let row = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let sum = 0;
            let count = 0;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i].value);
                if (!isNaN(dat)) {
                    sum += dat;
                    count++;
                }
            }
            setCalculatedResult(count > 0 ? sum / count : 0);
        } else if ((formula.substring(0, 3) === 'AVG' || formula.substring(0, 3) === 'avg') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle AVGC
            let col = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let sum = 0;
            let count = 0;
            for (let i = 0; i < numRows; i++) {
                let dat = parseFloat(data[i][col].value);
                if (!isNaN(dat)) {
                    sum += dat;
                    count++;
                }
            }
            setCalculatedResult(count > 0 ? sum / count : 0);
        } else if ((formula.substring(0, 3) === 'MAX' || formula.substring(0, 3) === 'max') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle MAXR
            let row = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let max = -Infinity;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i].value);
                if (!isNaN(dat) && dat > max) {
                    max = dat;
                }
            }
            setCalculatedResult(max === -Infinity ? "No valid data" : max);
        } else if ((formula.substring(0, 3) === 'MAX' || formula.substring(0, 3) === 'max') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle MAXC
            let col = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let max = -Infinity;
            for (let i = 0; i < numRows; i++) {
                let dat = parseFloat(data[i][col].value);
                if (!isNaN(dat) && dat > max) {
                    max = dat;
                }
            }
            setCalculatedResult(max === -Infinity ? "No valid data" : max);
        } else if ((formula.substring(0, 3) === 'MIN' || formula.substring(0, 3) === 'min') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle MINR
            let row = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let min = Infinity;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i].value);
                if (!isNaN(dat) && dat < min) {
                    min = dat;
                }
            }
            setCalculatedResult(min === Infinity ? "No valid data" : min);
        } else if ((formula.substring(0, 3) === 'MIN' || formula.substring(0, 3) === 'min') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle MINC
            let col = parseInt(formula.substring(7, formula.length - 1)) - 1;
            let min = Infinity;
            for (let i = 0; i < numRows; i++) {
                let dat = parseFloat(data[i][col].value);
                if (!isNaN(dat) && dat < min) {
                    min = dat;
                }
            }
            setCalculatedResult(min === Infinity ? "No valid data" : min);
        } else if ((formula.substring(0, 3) === 'COU' || formula.substring(0, 3) === 'cou') &&
            (formula.substring(3, 4) === 'N' || formula.substring(3, 4) === 'n') &&
            (formula.substring(4, 5) === 'T' || formula.substring(4, 5) === 't') &&
            (formula.substring(5, 8) === 'ROW' || formula.substring(5, 8) === 'row')) {
            // Handle COUNTR
            let row = parseInt(formula.substring(9, formula.length - 1)) - 1;
            let count = 0;
            for (let i = 0; i < numCols; i++) {
                let dat = data[row][i].value;
                if (dat !== '') {
                    count++;
                }
            }
            setCalculatedResult(count);
        } else if ((formula.substring(0, 3) === 'COU' || formula.substring(0, 3) === 'cou') &&
            (formula.substring(3, 4) === 'N' || formula.substring(3, 4) === 'n') &&
            (formula.substring(4, 5) === 'T' || formula.substring(4, 5) === 't') &&
            (formula.substring(5, 8) === 'COL' || formula.substring(5, 8) === 'col')) {
            // Handle COUNTC
            let col = parseInt(formula.substring(9, formula.length - 1)) - 1;
            let count = 0;
            for (let i = 0; i < numRows; i++) {
                let dat = data[i][col].value;
                if (dat !== '') {
                    count++;
                }
            }
            setCalculatedResult(count);
        } else {
            setCalculatedResult('NA');
        }
    };

    const cancelSave = () => {
        toggleSave(false);
    }

    const settingTitle = (e) => {
        setSheetTitle(e.target.value);
    }

    let previousColorButton = null;

    const changeFontColor = (e) => {
        e.preventDefault();
        const selectedButton = e.target;
        document.querySelectorAll('.color-button').forEach((button) => {
            button.classList.remove('border-black');
        });

        selectedButton.classList.add('border-black');
        const backgroundColor = window.getComputedStyle(selectedButton).backgroundColor;
        const color = backgroundColor.replace(/^rgba?\(0, 0, 0, 0\)/, 'transparent').trim();

        previousColorButton = selectedButton;

        document.querySelectorAll('.grid-cell').forEach((cell) => {
            if (cell.value !== '') return;
            cell.style.color = color;
        });
    };

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
                <h1 className="text-4xl font-bold text-left ml-6 text-blue-600 mb-4">{sheetTitle}</h1>
                {/*add a formula bar here*/}
                <div className="flex items-center ml-6 mt-4 mb-6 space-x-2">
                    {/* Formula Button */}
                    <div className="relative inline-block" ref={dropdownRef}>
                        {/* Formula Button with Dropdown Icon */}
                        <button
                            className="flex items-center justify-between font-semibold text-lg w-32 h-9 bg-gray-200 text-black rounded-sm px-3 border border-gray-400 shadow-md hover:bg-gray-300 transition-all duration-300"
                            onClick={handleFormulaClick}
                        >
                            Formula
                            <ChevronDown className="w-5 h-5 ml-2 transition-transform duration-300"
                                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                            />
                        </button>

                        {/* Components appear side by side when isOpen is true */}
                        {isOpen && (
                            <div className="absolute flex mt-2 ml-4">
                                {/* Prompt Bar */}
                                <div className="prompt-bar flex items-center justify-between p-2 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-blue-700 text-white">
                                    <input
                                        type="text"
                                        className="flex-grow mr-2 bg-transparent font-semibold border-none outline-none text-white placeholder-white"
                                        placeholder="Enter your prompt..."
                                        value={prompt}
                                        onChange={handlePromptChange}
                                    />
                                    <button
                                        className="font-bold text-l mr-2 w-18 h-8 bg-white text-black rounded-lg px-4 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleGeminiRequest}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : 'Apply'}
                                    </button>
                                </div>

                                <div className="response-bar flex items-center ml-4 p-2 h-12 font-semibold rounded-lg bg-gradient-to-r from-green-400 to-blue-500 border-2 border-green-700 text-white whitespace-nowrap">
                                    <span className="truncate">Formula: {geminiResponse}</span>
                                </div>

                                {/* Computed Result */}
                                <div className="result-bar flex items-center ml-4 p-2 h-12 font-semibold rounded-lg bg-gradient-to-r from-red-400 to-yellow-500 border-2 border-red-700 text-white whitespace-nowrap">
                                    <span className="truncate">Result: {calculatedResult}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="toolbar-button-bld font-semibold text-lg w-10 h-9 bg-gray-200 text-black rounded-sm hover:bg-gray-300 px-2 py-1"
                        onClick={toggleBold}
                    >
                        <b>B</b>
                    </button>
                    <button
                        className="toolbar-button-idi font-bold text-lg w-10 h-9 bg-gray-200 text-black rounded-sm hover:bg-gray-300 px-2 py-1"
                        onClick={toggleItalic}
                    >
                        <i>I</i>
                    </button>

                    <div className="relative inline-block" ref={dropdownRef}>
                        {/* Font Size Button with Dropdown Icon */}
                        <button
                            className="flex items-center justify-between font-semibold text-lg w-32 h-9 bg-gray-200 text-black rounded-sm px-3 border border-gray-400 shadow-md hover:bg-gray-300 transition-all duration-300"
                            onClick={() => setShowFontSizeOptions(!showFontSizeOptions)}
                        >
                            Font Size
                            <ChevronDown className={`w-5 h-5 ml-2 transition-transform duration-300 ${showFontSizeOptions ? "rotate-180" : "rotate-0"}`} />
                        </button>

                        {showFontSizeOptions && (
                            <div className="absolute ml-4 mt-2 w-24 flex bg-white border-2 border-purple-700 rounded shadow-lg">
                                <button
                                    className="block  w-8 text-centre p-2 hover:bg-blue-400"
                                    onClick={() => { minusSize(); setShowFontSizeOptions(true); }}
                                >
                                    -
                                </button>
                                <div className="block border-e-2 border-s-2 border-blue-400 p-2">
                                    {fontSize}
                                </div>
                                <button
                                    className="block w-8 text-center p-2 hover:bg-blue-400"
                                    onClick={() => { plusSize(); setShowFontSizeOptions(true); }}
                                >
                                    +
                                </button>
                            </div>
                        )}

                    </div>
                    {/* <button className="toolbar-button bg-gray-200 p-2 rounded" onClick={toggleSize}>Font Size</button> */}
                    <div className="relative inline-block" ref={dropdownRef}>
                        {/* Color Button with Dropdown Icon */}
                        <button
                            className="flex items-center justify-between font-semibold text-lg w-24 h-9 bg-gray-200 text-black rounded-sm px-3 border border-gray-400 shadow-md hover:bg-gray-300 transition-all duration-300"
                            onClick={() => toggleColor(!toggleColorValue)}
                        >
                            Color
                            <ChevronDown className={`w-5 h-5 ml-2 transition-transform duration-300 ${toggleColorValue ? "rotate-180" : "rotate-0"}`} />
                        </button>
                        {toggleColorValue && (
                            <div className="absolute flex mt-2 p-2 bg-white border border-gray-400 rounded shadow-sm">

                                <button
                                    className="w-6 h-6 rounded-full bg-red-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600 "
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-orange-500 mr-1 mb-1 border-2 border-transparent  hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-yellow-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-green-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-teal-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-blue-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-indigo-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-purple-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-pink-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-gray-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-black mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                                <button
                                    className="w-6 h-6 rounded-full bg-white mr-1 mb-1 border-2 border-gray-300  hover:border-gray-600"
                                    onClick={changeFontColor}
                                ></button>
                            </div>
                        )}
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