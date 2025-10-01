import React from 'react';
import './Element.css';

const Element = ({ atomicNumber, symbol, name, atomicMass, xpos, ypos, onClick, isSelected, onMouseEnter, onMouseLeave, isFocused }) => {
  const style = {
    gridColumnStart: xpos,
    gridRowStart: ypos,
  };

  return (
    <div
      className={`element ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={isFocused ? 0 : -1} // Cho phép focus bằng bàn phím
    >
      <div className="number">{atomicNumber}</div>
      <div className="symbol">{symbol}</div>
      <div className="name">{name}</div>
      <div className="atomic-mass">{atomicMass ? atomicMass.toFixed(2) : ''}</div>
    </div>
  );
};

export default Element;