import { useCallback, useEffect, useState } from "react";

export const Countdown = ({ deadline }: { deadline?: string | null }) => {
  const calculateTime = useCallback(() => {
    if (!deadline) {
      return null;
    }

    const difference = new Date(deadline).getTime() - Date.now();

    if (difference <= 0) {
      return {
        expired: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const totalSeconds = Math.floor(difference / 1000);

    return {
      expired: false,

      days: Math.floor(totalSeconds / 86400),

      hours: Math.floor((totalSeconds % 86400) / 3600),

      minutes: Math.floor((totalSeconds % 3600) / 60),

      seconds: totalSeconds % 60,
    };
  }, [deadline]);

  const [time, setTime] = useState(calculateTime);

  useEffect(() => {
    setTime(calculateTime());

    const interval = window.setInterval(() => {
      setTime(calculateTime());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [calculateTime]);

  if (!deadline || !time) {
    return (
      <span className="text-[9px] font-semibold text-slate-400 sm:text-[10px]">
        No deadline
      </span>
    );
  }

  if (time.expired) {
    return (
      <span className="text-[9px] font-bold text-red-500 sm:text-[10px]">
        Deadline passed
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap font-mono text-[8px] font-bold text-orange-600 sm:text-[9px] md:text-[10px]">
      {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
    </span>
  );
};
