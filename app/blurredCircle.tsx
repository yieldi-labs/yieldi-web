"use client";

import React from 'react';

const GradientBlurredCircle = ({ size = 100, color = 'rgba(59, 130, 246, 0.2)' }) => {
  const circleStyle = {
    width: `${size}px`,
    height: `${size}px`,
    opacity: 0.1
  };

  return (
    <div className="relative" style={circleStyle}>
      <div 
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ 
          background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)` 
        }}
      ></div>
      <div 
        className="absolute inset-0 rounded-full blur-xl"
        style={{ 
          background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 60%)` 
        }}
      ></div>
      <div 
        className="absolute inset-0 rounded-full blur-lg"
        style={{ 
          background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 50%)` 
        }}
      ></div>
    </div>
  );
};

export default GradientBlurredCircle;