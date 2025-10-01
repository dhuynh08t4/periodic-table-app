import React, { useState, useEffect } from 'react';
import './App.css';
import Element from './Element';
import periodicTableData from './periodicTable.json';

function App() {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    setElements(periodicTableData.elements);
  }, []);

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const handleCloseModal = () => {
    setSelectedElement(null);
  };

  return (
    <div className="main-container">
      <div className="periodic-table-container">
        {elements.map(element => (
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

        {selectedElement && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedElement.name} ({selectedElement.symbol})</h2>
              <p><strong>Số nguyên tử:</strong> {selectedElement.number}</p>
              <p><strong>Khối lượng nguyên tử:</strong> {selectedElement.atomic_mass}</p>
              <p><strong>Category:</strong> {selectedElement.category}</p>
              <p><strong>Phase:</strong> {selectedElement.phase}</p>
              <p><strong>Summary:</strong> {selectedElement.summary}</p>
              <button onClick={handleCloseModal}>Đóng</button>
            </div>
          </div>
        )}
      </div>
      <div className="info-panel">
        {selectedElement ? (
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
