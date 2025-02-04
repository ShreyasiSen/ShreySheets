import React, { useState, useRef, useEffect, } from 'react';
import { ToolbarContext } from '../contexts/ToolbarContext';
import { useContext } from 'react';
import '../index.css';
import axios, { Axios } from 'axios';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { use } from 'react';

const numRows = 10;
const numCols = 10;

const Spreadsheet = () => {
    const { spreadsheetId } = useParams();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const id = userInfo._id;

    const { isBold, isItalic, toggleBold, toggleItalic, } = useContext(ToolbarContext);
    const [data, setData] = useState(
        Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => ({ isBold: false, isItalic: false,value: '' }))
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
    
        const navigate = useNavigate();

        useEffect(() => {
            const fetchSheet = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/api/spreadsheet/${spreadsheetId}`);
                    console.log(response.data.data);
                    setData(response.data.data);
                    response.data.data.map((row, rowIndex) => {
                        row.map((cell, colIndex) => {
                            if(cell.value==='') return;
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
        try{
            const dataToSend = {
                data: data,
                sheetTitle: sheetTitle,
                userid: id
            }
            axios.put(`http://localhost:8000/api/spreadsheet/${spreadsheetId}`, dataToSend);
            alert('Sheet updated successfully');
        }
        catch(error){
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
                    <button
                        className="toolbar-minus bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-2 py-1"
                        onClick={minusSize}
                    >
                        -
                    </button>
                    <div className="toolbar-button bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-2 py-1 flex items-center justify-center">
                        {fontSize}
                    </div>
                    <button
                        className="toolbar-plus bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-2 py-1"
                        onClick={plusSize}
                    >
                        +
                    </button>
                    <button
                        className="toolbar-button bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-2 py-1"
                        onClick={toggleColor}>
                        Color
                    </button>
                    <button className="toolbar-trim bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-2 py-1">
                        TRIM
                    </button>
                </div>
                {toggleColorValue && (
                    <div className="absolute mt-12 p-2 bg-white border border-gray-400 rounded shadow-sm">
                        <div className="flex flex-wrap ">
                            <button
                                className="w-6 h-6 rounded-full bg-red-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600 "
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-orange-500 mr-1 mb-1 border-2 border-transparent  hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-yellow-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-green-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-teal-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-blue-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-indigo-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-purple-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-pink-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-gray-500 mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                               
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-black mr-1 mb-1 border-2 border-transparent hover:border-gray-600"
                                
                            ></button>
                            <button
                                className="w-6 h-6 rounded-full bg-white mr-1 mb-1 border-2 border-gray-300  hover:border-gray-600"
                                
                            ></button>
                        </div>
                    </div>
                )}
                <button className='toolbar-button bg-red-600 hover:bg-red-500 text-white font-semibold 
                rounded-lg px-4 py-2 absolute right-10' onClick={saveClick}>
                   Update
                </button>
                
            </div>

            {/* Grid */}
            <div
                className="grid gap-1"
                onMouseUp={handleMouseUp}
                style={{
                    gridTemplateColumns: `repeat(${data[0].length}, 1fr)`,
                }}
            >
                {data.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <textarea
                            key={`${rowIndex}-${colIndex}`}
                            id={`${rowIndex}-${colIndex}`}
                            className={`grid-cell p-2 border border-green-800 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSelected(rowIndex, colIndex) ? 'bg-blue-100' : 'bg-white'}`}
                            onInput={(e) => handleInputChange(rowIndex, colIndex, e)}
                            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                            onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                        >
                            {cell.value}
                        </textarea>
                    ))
                )}
            </div>
        </div>
    );
};

export default Spreadsheet;