import React from 'react';
import './Element.css';

const Element = ({ atomicNumber, symbol, name, atomicMass, xpos, ypos, onClick, isSelected }) => {
  const elementStyle = {
    gridColumnStart: xpos,
    gridRowStart: ypos,
  };

  return (
    <div
      className={`element ${isSelected ? 'selected' : ''}`}
      style={elementStyle}
      onClick={onClick}
    >
      <div className="atomic-number">{atomicNumber}</div>
      <div className="symbol">{symbol}</div>
      <div className="name">{name}</div>
      <div className="atomic-mass">{atomicMass.toFixed(2)}</div>
    </div>
  );
};

export default Element;