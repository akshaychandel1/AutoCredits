// TimerDisplay.js
import React from 'react';

const TimerDisplay = ({ timeSpent, formatTime, isRunning }) => {
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

export default TimerDisplay;