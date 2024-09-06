// components/Card.tsx
"use client";

import React from 'react';

interface CardProps {
  id: string;
  position: { x: number, y: number };
  flipped: boolean;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ id, position, flipped, onDragEnd }) => {
  return (
    <div
      className={`card ${flipped ? 'flipped' : ''}`}
      style={{ transform: `translate(${position.x * 100}vw, ${position.y * 100}vh)` }}
      draggable
      onDragEnd={onDragEnd}
    >
      {/* Card content here */}GG
    </div>
  );
};

export default Card;
