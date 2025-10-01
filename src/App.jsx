import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Element from './Element';
import periodicTableData from './periodicTable.json';

function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [focusedElement, setFocusedElement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  const filteredElements = elements.filter(element =>
    element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setElements(periodicTableData.elements);
  }, []);

  useEffect(() => {
    if (filteredElements.length > 0) {
      // Chỉ cập nhật focusedElement nếu nó chưa được đặt hoặc không còn trong filteredElements
      if (!focusedElement || !filteredElements.some(el => el.number === focusedElement.number)) {
        setFocusedElement(filteredElements[0]);
        setSelectedElement(filteredElements[0]);
      }
    } else {
      setFocusedElement(null);
      setSelectedElement(null);
    }
  }, [filteredElements, focusedElement]);

  const handleElementClick = (element) => {
    setSelectedElement(element);
    setIsPopupOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsPopupOpen(false);
      setIsModalClosing(false);
    }, 300);
  };

  const handleMouseEnter = (element) => {
    setHoveredElement(element);
  };

  const handleMouseLeave = () => {
    setHoveredElement(null);
  };

  // Helper để tìm nguyên tố theo vị trí xpos và ypos trong toàn bộ mảng elements
  const findElementByPosition = (x, y) => {
    return elements.find(el => el.xpos === x && el.ypos === y);
  };

  // Helper để tìm nguyên tố tiếp theo trong filteredElements theo hướng
  const findNextFilteredElement = useCallback((currentElement, directionKey, filteredElements) => {
    if (!currentElement || filteredElements.length === 0) return null;

    const currentX = currentElement.xpos;
    const currentY = currentElement.ypos;

    let candidates = [];

    switch (directionKey) {
      case 'ArrowUp':
        candidates = filteredElements.filter(el => el.ypos < currentY);
        candidates.sort((a, b) => {
          if (a.ypos !== b.ypos) return b.ypos - a.ypos; // Higher ypos (closer to current) first
          return Math.abs(a.xpos - currentX) - Math.abs(b.xpos - currentX); // Then by xpos proximity
        });
        break;
      case 'ArrowDown':
        candidates = filteredElements.filter(el => el.ypos > currentY);
        candidates.sort((a, b) => {
          if (a.ypos !== b.ypos) return a.ypos - b.ypos; // Lower ypos (closer to current) first
          return Math.abs(a.xpos - currentX) - Math.abs(b.xpos - currentX); // Then by xpos proximity
        });
        break;
      case 'ArrowLeft':
        candidates = filteredElements.filter(el => el.ypos === currentY && el.xpos < currentX);
        if (candidates.length === 0) {
          candidates = filteredElements.filter(el => el.ypos < currentY);
          candidates.sort((a, b) => {
            if (a.ypos !== b.ypos) return b.ypos - a.ypos; // Higher ypos (closer to current) first
            return b.xpos - a.xpos; // Then by xpos descending (rightmost in previous row)
          });
        } else {
          candidates.sort((a, b) => b.xpos - a.xpos); // Sort by xpos descending (closest left)
        }
        break;
      case 'ArrowRight':
        candidates = filteredElements.filter(el => el.ypos === currentY && el.xpos > currentX);
        if (candidates.length === 0) {
          candidates = filteredElements.filter(el => el.ypos > currentY);
          candidates.sort((a, b) => {
            if (a.ypos !== b.ypos) return a.ypos - b.ypos; // Lower ypos (closest to current) first
            return a.xpos - b.xpos; // Then by xpos ascending (leftmost in next row)
          });
        } else {
          candidates.sort((a, b) => a.xpos - b.xpos); // Sort by xpos ascending (closest right)
        }
        break;
    }

    return candidates.length > 0 ? candidates[0] : null;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isPopupOpen) {
        if (event.key === 'Escape') {
          handleCloseModal();
        }
        return;
      }

      const currentFilteredElements = elements.filter(element =>
        element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );

      let currentFocusedElement = focusedElement;

      // Nếu không có focusedElement hoặc focusedElement hiện tại không nằm trong filteredElements, đặt nó là phần tử đầu tiên của filteredElements
      if (!currentFocusedElement || !currentFilteredElements.some(el => el.number === currentFocusedElement.number)) {
        if (currentFilteredElements.length > 0) {
          currentFocusedElement = currentFilteredElements[0];
          setFocusedElement(currentFocusedElement);
          setSelectedElement(currentFocusedElement);
        } else {
          currentFocusedElement = null;
          setFocusedElement(null);
          setSelectedElement(null);
        }
      }

      if (!currentFocusedElement) return; // Không có gì để focus, thoát

      if (event.key === '/') {
        event.preventDefault();
        searchInputRef.current.focus();
        return;
      }

      if (event.key === 'Tab' && document.activeElement === searchInputRef.current) {
        event.preventDefault();
        if (currentFilteredElements.length > 0) {
          setFocusedElement(currentFilteredElements[0]);
          setSelectedElement(currentFilteredElements[0]);
        }
        return;
      }

      let newX = currentFocusedElement.xpos;
      let newY = currentFocusedElement.ypos;

      let moved = false;

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          moved = true;
          break;
        case ' ': // Space
        case 'Enter':
          handleElementClick(currentFocusedElement);
          event.preventDefault();
          return;
        case 'Escape':
          handleCloseModal();
          event.preventDefault();
          return;
        default:
          return;
      }

      if (moved) {
        const nextElement = findNextFilteredElement(currentFocusedElement, event.key, currentFilteredElements);
        if (nextElement) {
          setFocusedElement(nextElement);
          setSelectedElement(nextElement);
        }
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedElement, elements, isPopupOpen, handleElementClick, handleCloseModal, searchTerm, filteredElements, findNextFilteredElement]);

  const handleClearSearch = () => {
    setSearchTerm('');
    // Khi xóa tìm kiếm, useEffect sẽ tự động cập nhật focusedElement về phần tử đầu tiên của filteredElements (toàn bộ bảng)
  };

  return (
    <div className="main-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm nguyên tố..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          ref={searchInputRef}
        />
        {searchTerm && (
          <button className="clear-search-button" onClick={handleClearSearch}>X</button>
        )}
      </div>
      <div className="periodic-table-container">
        {filteredElements.map(element => (
          <Element
            key={element.number}
            atomicNumber={element.number}
            symbol={element.symbol}
            name={element.name}
            atomicMass={element.atomic_mass}
            xpos={element.xpos}
            ypos={element.ypos}
            onClick={() => handleElementClick(element)}
            isSelected={selectedElement && selectedElement.number === element.number}
            onMouseEnter={() => handleMouseEnter(element)}
            onMouseLeave={handleMouseLeave}
            isFocused={focusedElement && focusedElement.number === element.number}
          />
        ))}

        {isPopupOpen && !isModalClosing && selectedElement && (
          <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`} onClick={handleCloseModal}>
            <div className={`modal-content ${isModalClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
              <h2>{selectedElement.name} ({selectedElement.symbol})</h2>
              <p><strong>Số nguyên tử:</strong> {selectedElement.number}</p>
              <p><strong>Khối lượng nguyên tử:</strong> {selectedElement.atomic_mass}</p>
              <p><strong>Category:</strong> {selectedElement.category}</p>
              <p><strong>Phase:</strong> {selectedElement.phase}</p>
              <p><strong>Summary:</strong> {selectedElement.summary}</p>
              {selectedElement.boil && <p><strong>Điểm sôi:</strong> {selectedElement.boil} K</p>}
              {selectedElement.melt && <p><strong>Điểm nóng chảy:</strong> {selectedElement.melt} K</p>}
              {selectedElement.density && <p><strong>Mật độ:</strong> {selectedElement.density} g/cm³</p>}
              {selectedElement.discovered_by && <p><strong>Phát hiện bởi:</strong> {selectedElement.discovered_by}</p>}
              {selectedElement.source && <p><strong>Nguồn:</strong> <a href={selectedElement.source} target="_blank" rel="noopener noreferrer">Wikipedia</a></p>}
              <button onClick={handleCloseModal}>Đóng</button>
            </div>
          </div>
        )}
      </div>
      <div className="info-panel">
        {(selectedElement || hoveredElement) ? (
          <div className="element-details">
            <h2>{(selectedElement || hoveredElement).name}</h2>
            <p><strong>Ký hiệu:</strong> {(selectedElement || hoveredElement).symbol}</p>
            <p><strong>Số nguyên tử:</strong> {(selectedElement || hoveredElement).number}</p>
            <p><strong>Khối lượng nguyên tử:</strong> {(selectedElement || hoveredElement).atomic_mass}</p>
            <p><strong>Category:</strong> {(selectedElement || hoveredElement).category}</p>
            <p><strong>Phase:</strong> {(selectedElement || hoveredElement).phase}</p>
            <p><strong>Summary:</strong> {(selectedElement || hoveredElement).summary}</p>
            {(selectedElement || hoveredElement).boil && <p><strong>Điểm sôi:</strong> {(selectedElement || hoveredElement).boil} K</p>}
            {(selectedElement || hoveredElement).melt && <p><strong>Điểm nóng chảy:</strong> {(selectedElement || hoveredElement).melt} K</p>}
            {(selectedElement || hoveredElement).density && <p><strong>Mật độ:</strong> {(selectedElement || hoveredElement).density} g/cm³</p>}
            {(selectedElement || hoveredElement).discovered_by && <p><strong>Phát hiện bởi:</strong> {(selectedElement || hoveredElement).discovered_by}</p>}
            {(selectedElement || hoveredElement).source && <p><strong>Nguồn:</strong> <a href={(selectedElement || hoveredElement).source} target="_blank" rel="noopener noreferrer">Wikipedia</a></p>}
          </div>
        ) : (
          <div className="welcome-message">
            <h2>Chào mừng đến với Bảng Tuần Hoàn</h2>
            <p>Hãy nhấp vào một nguyên tố để xem thông tin chi tiết.</p>
            <p>Hiệu ứng công nghệ cao đang chờ bạn khám phá!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
