import React, { useState, useEffect } from "react";

const RestTimer = (props: {
  seconds:
    | { seconds: number; setIndex: number; exerciseIndex: number }
    | undefined;
  notify: () => void;
}) => {
  const [seconds, setSeconds] = useState(props.seconds?.seconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    console.log("seconds changed");
    setSeconds(props.seconds?.seconds);
    setIsRunning(true);
  }, [props.seconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (isRunning && seconds) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => (prevSeconds ? prevSeconds - 1 : 94));
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(props.seconds?.seconds);
  };

  return (
    <div>
      <h1>Timer: {seconds}</h1>
      <button onClick={startTimer}>Start</button>
      <button onClick={pauseTimer}>Pause</button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
};

export default RestTimer;
