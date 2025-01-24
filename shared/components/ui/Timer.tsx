"use client"

import React, { useState, useEffect } from "react";

interface TimerProps {
  initialTimes: number[];
  onComplete?: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTimes, onComplete }) => {
  const [timers, setTimers] = useState<number[]>(initialTimes);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = prevTimers.map((time) => (time > 0 ? time - 1 : 0));
        if (updatedTimers.every((time) => time === 0)) {
          clearInterval(interval);
          onComplete?.();
        }
        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <>
      {timers.map((time, index) => (
        <span key={index}>
          {time > 0 ? `${formatTime(time)}` : "Processing..."}
        </span>
      ))}
    </>
  );
};

const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};  

export default Timer;
