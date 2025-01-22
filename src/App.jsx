import React, { useState, useRef, useEffect } from 'react';
import './index.css';

const numRows = 10;
const numCols = 10;

const App = () => {
  const [data, setData] = useState(
    Array.from({ length: numRows }, () =>
      Array.from({ length: numCols }, () => '')
    )
  );

  const [selectedCells, setSelectedCells] = useState([]);
  const [dragging, setDragging] = useState(false);
  const startCell = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [fontColor, setFontColor] = useState('black');
  const [toggleColorValue, setFontColorValue] = useState(false);

  const handleInputChange = (row, col, e) => {
    e.preventDefault();
    const value = e.target.value;
    const updatedData = [...data];
    updatedData[row][col] = value;
    setData(updatedData);
    // console.log(data);
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

  const toggleBold = () => {
    setIsBold(!isBold);
    console.log('bold', isBold);
  };

  const toggleItalic = () => {
    setIsItalic(!isItalic);
    console.log('italic', isItalic);
  }

  // const toggleSize = () => {
  //   console.log('size',fontSize);
  // } 
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

  let previousColorButton = null;

  const changeFontColor = (e) => {
    e.preventDefault();
    const selectedButton = e.target;
    document.querySelectorAll('.color-button').forEach((button) => {
      button.classList.remove('border-black');
    });

    selectedButton.classList.add('border-black');
    const backgroundColor = window.getComputedStyle(selectedButton).backgroundColor;
    const color = backgroundColor.replace(/^rgba?\(0, 0, 0, 0\)/, 'transparent').trim(); // Handle transparent color

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

  useState(() => {

  });

  return (
    <div className="spreadsheet-container p-4">
      <h1 className="text-4xl font-bold text-left text-blue-600 mb-6">Shrey Sheets</h1>
      {/* Toolbar */}
      <div className="toolbar flex space-x-2 mb-4">
        <button className="toolbar-button-bld  bg-gray-200 p-2 rounded" onClick={toggleBold}>Bold</button>
        <button className="toolbar-button-idi bg-gray-200 p-2 rounded" onClick={toggleItalic}>Italic</button>
        <button className="toolbar-minus bg-gray-200 p-2 rounded" onClick={minusSize}>-</button>
        <div className="toolbar-button bg-gray-200 p-2 rounded flex items-center justify-center" onChange={changeSize}>{fontSize}</div>
        <button className="toolbar-plus bg-gray-200 p-2 rounded" onClick={plusSize}>+</button>
        {/* <button className="toolbar-button bg-gray-200 p-2 rounded" onClick={toggleSize}>Font Size</button> */}
        <button className="toolbar-button bg-gray-200 p-2 rounded" onClick={toggleColor}>Color</button>
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
              onInput={(e) => handleInputChange(rowIndex, colIndex, e)}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
            >
              {cell}
            </textarea>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
