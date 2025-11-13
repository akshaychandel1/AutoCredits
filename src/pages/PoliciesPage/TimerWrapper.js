// TimerWrapper.js - COMPLETELY SEPARATE COMPONENT
import React, { useState, useEffect, useRef } from 'react';

const TimerWrapper = ({ policyId, isEditMode, isDataLoaded }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const timeSpentRef = useRef(0);

  // Load saved time
  useEffect(() => {
    if (policyId) {
      const savedTime = localStorage.getItem(`form_timer_${policyId}`);
      if (savedTime) {
        const savedTimeInt = parseInt(savedTime);
        setTimeSpent(savedTimeInt);
        timeSpentRef.current = savedTimeInt;
      }
    }
  }, [policyId]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  useEffect(() => {
    let timerId;
    
    const startTimer = () => {
      if (isEditMode) {
        if (isDataLoaded) {
          timerId = setTimeout(() => {
            setIsRunning(true);
            
            let lastSaveTime = Date.now();
            
            intervalRef.current = setInterval(() => {
              timeSpentRef.current += 1;
              
              // Only update display every 10 seconds to prevent re-renders
              const currentTime = Date.now();
              if (currentTime - lastSaveTime > 10000) {
                setTimeSpent(timeSpentRef.current);
                localStorage.setItem(`form_timer_${policyId}`, timeSpentRef.current.toString());
                lastSaveTime = currentTime;
              }
            }, 1000);
          }, 3000);
        }
      } else {
        timerId = setTimeout(() => {
          setIsRunning(true);
          
          let lastSaveTime = Date.now();
          
          intervalRef.current = setInterval(() => {
            timeSpentRef.current += 1;
            
            const currentTime = Date.now();
            if (currentTime - lastSaveTime > 10000) {
              setTimeSpent(timeSpentRef.current);
              localStorage.setItem(`form_timer_${policyId}`, timeSpentRef.current.toString());
              lastSaveTime = currentTime;
            }
          }, 1000);
        }, 2000);
      }
    };
    
    startTimer();
    
    return () => {
      if (timerId) clearTimeout(timerId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        // Save final time
        localStorage.setItem(`form_timer_${policyId}`, timeSpentRef.current.toString());
      }
    };
  }, [policyId, isEditMode, isDataLoaded]);

  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-sm font-medium text-blue-700">Time Spent:</span>
      </div>
      <div className="text-lg font-bold text-blue-800 font-mono">
        {formatTime(timeSpent)}
      </div>
      <div className="text-xs text-blue-600">
        {isRunning ? 'Running' : 'Paused'}
      </div>
    </div>
  );
};

export default React.memo(TimerWrapper);