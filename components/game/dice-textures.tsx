import React from 'react'

const DiceFace = ({ dots }: { dots: [number, number][] }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="black" />
    {dots.map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="10" fill="#e1ff01" />
    ))}
  </svg>
)

export const DiceFaces = [
  <DiceFace key={1} dots={[[64, 64]]} />,
  <DiceFace key={2} dots={[[32, 32], [96, 96]]} />,
  <DiceFace key={3} dots={[[32, 32], [64, 64], [96, 96]]} />,
  <DiceFace key={4} dots={[[32, 32], [32, 96], [96, 32], [96, 96]]} />,
  <DiceFace key={5} dots={[[32, 32], [32, 96], [64, 64], [96, 32], [96, 96]]} />,
  <DiceFace key={6} dots={[[32, 32], [32, 64], [32, 96], [96, 32], [96, 64], [96, 96]]} />,
]
