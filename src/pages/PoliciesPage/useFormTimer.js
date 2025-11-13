// useFormTimer.js - COMPLETELY ISOLATED VERSION
import { useState, useEffect, useRef, useCallback } from "react";

const useFormTimer = (policyId, isEditMode, isDataLoaded = false) => {
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Load saved time from localStorage when component mounts
  useEffect(() => {
    if (policyId) {
      const savedTime = localStorage.getItem(`form_timer_${policyId}`);
      if (savedTime) {
        setTimeSpent(parseInt(savedTime));
      }
    }
  }, [policyId]);

  // Save time to localStorage whenever it changes
  useEffect(() => {
    if (policyId) {
      localStorage.setItem(`form_timer_${policyId}`, timeSpent.toString());
    }
  }, [timeSpent, policyId]);

  // Start timer - COMPLETELY ISOLATED
  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      
      // Use requestAnimationFrame for better performance and isolation
      const startTime = Date.now();
      let lastSaveTime = startTime;
      
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        setTimeSpent(prev => {
          const newTime = prev + 1;
          
          // Save to localStorage every 30 seconds to prevent performance issues
          if (currentTime - lastSaveTime > 30000 && policyId) {
            localStorage.setItem(`form_timer_${policyId}`, newTime.toString());
            lastSaveTime = currentTime;
          }
          
          return newTime;
        });
      }, 1000);
    }
  }, [isRunning, policyId]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning]);

  // Reset timer
  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimeSpent(0);
    if (policyId) {
      localStorage.removeItem(`form_timer_${policyId}`);
    }
  }, [pauseTimer, policyId]);

  // Format time to MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // FIXED: Completely isolated timer start with longer delays
  useEffect(() => {
    let timerId;
    
    const initializeTimer = () => {
      if (isEditMode) {
        // For edit mode, wait longer to ensure form is completely ready
        if (isDataLoaded) {
          timerId = setTimeout(() => {
            console.log("🕒 Starting timer for edit mode");
            startTimer();
          }, 2000); // 2 second delay for edit mode
        }
      } else {
        // For new forms, start with delay
        timerId = setTimeout(() => {
          console.log("🕒 Starting timer for new form");
          startTimer();
        }, 1500); // 1.5 second delay for new forms
      }
    };
    
    initializeTimer();
    
    return () => {
      if (timerId) clearTimeout(timerId);
      pauseTimer();
    };
  }, [isEditMode, isDataLoaded, startTimer, pauseTimer]);

  return {
    timeSpent,
    isRunning,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer
  };
};

export default useFormTimer;