import React, { useState, useRef, useEffect } from 'react';
import { ToolbarContext } from '../contexts/ToolbarContext';
import { useContext } from 'react';
import '../index.css';
import axios, { Axios } from 'axios';
import { Await } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const numRows = 10;
const numCols = 10;

const Spreadsheet = () => {
    const { spreadsheetId } = useParams();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const id = userInfo._id;

    const { isBold, isItalic, toggleBold, toggleItalic } = useContext(ToolbarContext);
    const [data, setData] = useState(
        Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => '')
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

    const [sheetTitle, setSheetTitle] = useState('');

    useEffect(() => {
        const fetchSheet = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/spreadsheet/${spreadsheetId}`);
                console.log(response.data.data);
                setData(response.data.data);
                setSheetTitle(response.data.sheetTitle);
            } catch (error) {
                console.log(error);
            }
        }
        fetchSheet();
    }, [spreadsheetId]);


    const handleInputChange = (row, col, e) => {
        e.preventDefault();
        const value = e.target.value;
        const updatedData = [...data];
        updatedData[row][col] = value;
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

    // const toggleSize = () => {
    //     console.log('size', fontSize);
    // }

    const toggleColor = () => {
        setFontColorValue(!toggleColorValue);
        console.log('color', fontColor);
    }

    // const changeSize = (e) => {

    //     console.log('size', fontSize);
    // }

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

    const saveUpdate = () => {
        try{
            axios.put(`http://localhost:8000/api/spreadsheet/${spreadsheetId}`, {
                data: data,
                sheetTitle: sheetTitle
            });
            alert('Sheet updated successfully!');
        }
        catch{
            alert('Sheet update failed');
        }
    }

    const formulaTyping = (e) => {
        e.preventDefault();
        setFormula(e.target.value);
    }


    const formulaTyped = (e) => {
        e.preventDefault();

        if ((formula.substring(0, 3) === 'SUM' || formula.substring(0, 3) === 'sum') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle SUMROW
            let row = parseInt(formula.substring(7, formula.length - 1));
            let sum = 0;
            let count = 0;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i]);
                if (!isNaN(dat)) {
                    sum += dat;
                    count++;
                }
            }
            setCalculatedResult(sum);
        } else if ((formula.substring(0, 3) === 'SUM' || formula.substring(0, 3) === 'sum') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle SUMCOL
            let col = parseInt(formula.substring(7, formula.length - 1));
            let sum1 = 0;
            let count = 0;
            for (let i = 0; i < numRows; i++) {
                let datt = parseFloat(data[i][col]);
                if (!isNaN(datt)) {
                    sum1 += datt;
                    count++;
                }
            }
            setCalculatedResult(sum1);
        } else if ((formula.substring(0, 3) === 'AVG' || formula.substring(0, 3) === 'avg') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle AVGR
            let row = parseInt(formula.substring(7, formula.length - 1));
            let sum = 0;
            let count = 0;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i]);
                if (!isNaN(dat)) {
                    sum += dat;
                    count++;
                }
            }
            setCalculatedResult(count > 0 ? sum / count : 0);
        } else if ((formula.substring(0, 3) === 'AVG' || formula.substring(0, 3) === 'avg') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle AVGC
            let col = parseInt(formula.substring(7, formula.length - 1));
            let sum = 0;
            let count = 0;
            for (let i = 0; i < numRows; i++) {
                let dat = parseFloat(data[i][col]);
                if (!isNaN(dat)) {
                    sum += dat;
                    count++;
                }
            }
            setCalculatedResult(count > 0 ? sum / count : 0);
        } else if ((formula.substring(0, 3) === 'MAX' || formula.substring(0, 3) === 'max') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle MAXR
            let row = parseInt(formula.substring(7, formula.length - 1));
            let max = -Infinity;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i]);
                if (!isNaN(dat) && dat > max) {
                    max = dat;
                }
            }
            setCalculatedResult(max === -Infinity ? "No valid data" : max);
        } else if ((formula.substring(0, 3) === 'MAX' || formula.substring(0, 3) === 'max') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle MAXC
            let col = parseInt(formula.substring(7, formula.length - 1));
            let max = -Infinity;
            for (let i = 0; i < numRows; i++) {
                let dat = parseFloat(data[i][col]);
                if (!isNaN(dat) && dat > max) {
                    max = dat;
                }
            }
            setCalculatedResult(max === -Infinity ? "No valid data" : max);
        } else if ((formula.substring(0, 3) === 'MIN' || formula.substring(0, 3) === 'min') &&
            (formula.substring(3, 6) === 'ROW' || formula.substring(3, 6) === 'row')) {
            // Handle MINR
            let row = parseInt(formula.substring(7, formula.length - 1));
            let min = Infinity;
            for (let i = 0; i < numCols; i++) {
                let dat = parseFloat(data[row][i]);
                if (!isNaN(dat) && dat < min) {
                    min = dat;
                }
            }
            setCalculatedResult(min === Infinity ? "No valid data" : min);
        } else if ((formula.substring(0, 3) === 'MIN' || formula.substring(0, 3) === 'min') &&
            (formula.substring(3, 6) === 'COL' || formula.substring(3, 6) === 'col')) {
            // Handle MINC
            let col = parseInt(formula.substring(7, formula.length - 1));
            let min = Infinity;
            for (let i = 0; i < numRows; i++) {
                let dat = parseFloat(data[i][col]);
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
            let row = parseInt(formula.substring(9, formula.length - 1));
            let count = 0;
            for (let i = 0; i < numCols; i++) {
                let dat = data[row][i];
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
            let col = parseInt(formula.substring(9, formula.length - 1));
            let count = 0;
            for (let i = 0; i < numRows; i++) {
                let dat = data[i][col];
                if (dat !== '') {
                    count++;
                }
            }
            setCalculatedResult(count);
        } else {
            setCalculatedResult('Invalid formula');
        }
    };

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

    useEffect(() => {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            if (cell.value !== '') return;
            cell.style.fontSize = `${fontSize}px`;
        }, [fontSize])
    });

    return (
        <div>
            <div className="spreadsheet-container p-4">
                <h1 className="text-4xl font-bold text-left text-purple-700 mb-6">{sheetTitle}</h1>
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
                            onClick={formulaTyped}
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
                        </div>
                    )}
                    <div className="toolbar flex space-x-2 mb-4">
                        <button className="toolbar-button bg-green-500 hover:bg-green-400 text-white font-semibold 
                rounded-lg px-4 py-2 absolute right-10"
                            onClick={saveUpdate}>
                            Update
                        </button>
                    </div>
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
                                className={`grid-cell p-2 border border-green-800 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSelected(rowIndex, colIndex) ? 'bg-blue-100' : 'bg-white'}`}
                                value={cell}
                                onInput={(e) => handleInputChange(rowIndex, colIndex, e)}
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Spreadsheet;
