import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Element from './Element';
import periodicTableData from './periodicTable.json';
import ElectronModel from './ElectronModel';

function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const mainContainerRef = useRef(null);

  const filteredElements = elements.filter(element =>
    element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (periodicTableData && Array.isArray(periodicTableData.elements)) {
      setElements(periodicTableData.elements);
    } else {
      console.error("Error: periodicTableData.elements is not an array or is missing.", periodicTableData);
      setElements([]);
    }
  }, []);

  useEffect(() => {
    if (filteredElements.length > 0) {
      // Chỉ cập nhật selectedElement nếu nó chưa được đặt hoặc không còn trong filteredElements
      if (!selectedElement || !filteredElements.some(el => el.number === selectedElement.number)) {
        setSelectedElement(filteredElements[0]);
      }
    } else {
      setSelectedElement(null);
    }
  }, [filteredElements, selectedElement]);

  const handleElementClick = (element) => {
    setSelectedElement(element);
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
      // Xử lý phím Escape để xóa tìm kiếm khi input đang focus
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        if (!mainContainerRef.current) return;

        const focusableElements = Array.from(
          mainContainerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey) {
          // Shift + Tab
          if (activeElement === firstFocusableElement || !mainContainerRef.current.contains(activeElement)) {
            lastFocusableElement.focus();
          } else {
            const index = focusableElements.indexOf(activeElement);
            if (index > 0) {
              focusableElements[index - 1].focus();
            }
          }
        } else {
          // Tab
          if (activeElement === lastFocusableElement || !mainContainerRef.current.contains(activeElement)) {
            firstFocusableElement.focus();
          } else {
            const index = focusableElements.indexOf(activeElement);
            if (index !== -1 && index < focusableElements.length - 1) {
              focusableElements[index + 1].focus();
            }
          }
        }
        return;
      }

      const currentFilteredElements = elements.filter(element =>
        element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );

      let currentSelectedElement = selectedElement;

      // Nếu không có selectedElement hoặc selectedElement hiện tại không nằm trong filteredElements, đặt nó là phần tử đầu tiên của filteredElements
      if (!currentSelectedElement || !currentFilteredElements.some(el => el.number === currentSelectedElement.number)) {
        if (currentFilteredElements.length > 0) {
          currentSelectedElement = currentFilteredElements[0];
          setSelectedElement(currentSelectedElement);
        } else {
          currentSelectedElement = null;
          setSelectedElement(null);
        }
      }

      if (!currentSelectedElement) return; // Không có gì để chọn, thoát

      if (event.key === '/') {
        event.preventDefault();
        searchInputRef.current.focus();
        return;
      }

      let newX = currentSelectedElement.xpos;
      let newY = currentSelectedElement.ypos;

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
          handleElementClick(currentSelectedElement);
          event.preventDefault();
          return;
        default:
          return;
      }

      if (moved) {
        const nextElement = findNextFilteredElement(currentSelectedElement, event.key, currentFilteredElements);
        if (nextElement) {
          setSelectedElement(nextElement);
        }
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, elements, handleElementClick, searchTerm, filteredElements, findNextFilteredElement]);

  const handleClearSearch = () => {
    setSearchTerm('');
    // Khi xóa tìm kiếm, useEffect sẽ tự động cập nhật focusedElement về phần tử đầu tiên của filteredElements (toàn bộ bảng)
  };

  return (
    <div className="main-container" ref={mainContainerRef}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhấn [/] để bắt đầu tìm kiếm"
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
          />
        ))}
      </div>
      <div className="info-panel">
        {selectedElement ? (
          <>
            <div className="element-info-header">
              <h2>{selectedElement.name} ({selectedElement.symbol}) {selectedElement.atomicNumber}</h2>
              <p className="element-category">{selectedElement.category}</p>
            </div>
            <div className="element-model-container">
              <ElectronModel element={selectedElement} />
            </div>
            <div className="element-details">
              <h2>{selectedElement.name}</h2>
              <p><strong>Ký hiệu:</strong> {selectedElement.symbol}</p>
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
            </div>
          </>
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
