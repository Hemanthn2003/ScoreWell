import { useEffect, useMemo, useState } from "react";

import { Clock3 } from "lucide-react";

interface CountdownTimerProps {
  deadline: string | null;
}

interface Countdown {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateCountdown = (
  deadline: string | null,
  currentTime: number,
): Countdown => {
  if (!deadline) {
    return {
      expired: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(deadlineTime)) {
    return {
      expired: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const remaining = deadlineTime - currentTime;

  if (remaining <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const totalSeconds = Math.floor(remaining / 1000);

  const days = Math.floor(totalSeconds / 86400);

  const hours = Math.floor((totalSeconds % 86400) / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
  };
};

const CountdownTimer = ({ deadline }: CountdownTimerProps) => {
  /*
   * Browser's current time.
   *
   * This is initialized ONCE when the
   * component is mounted.
   */
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  /*
   * This interval only updates the browser
   * clock displayed on the screen.
   *
   * IMPORTANT:
   *
   * There is NO fetch()
   * There is NO axios()
   * There is NO API request.
   *
   * The deadline was already received from
   * MongoDB during the initial page API call.
   */
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  /*
   * Recalculate only when the browser
   * time changes or the DB deadline
   * supplied by the parent changes.
   */
  const countdown = useMemo(
    () => calculateCountdown(deadline, currentTime),
    [deadline, currentTime],
  );

  if (!deadline) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold text-slate-500">
          No result release time is configured.
        </p>
      </div>
    );
  }

  if (countdown.expired) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <Clock3 size={17} />

          <span className="text-xs font-extrabold uppercase tracking-wider">
            Result Release
          </span>
        </div>

        <p className="mt-2 text-sm font-black text-emerald-800">
          Result release time has arrived.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4">
      <div className="flex items-center gap-2 text-purple-700">
        <Clock3 size={17} />

        <span className="text-xs font-extrabold uppercase tracking-wider">
          Time Remaining
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <TimeBox value={countdown.days} label="Days" />

        <TimeBox value={countdown.hours} label="Hours" />

        <TimeBox value={countdown.minutes} label="Minutes" />

        <TimeBox value={countdown.seconds} label="Seconds" />
      </div>
    </div>
  );
};

interface TimeBoxProps {
  value: number;
  label: string;
}

const TimeBox = ({ value, label }: TimeBoxProps) => {
  return (
    <div className="rounded-xl border border-purple-100 bg-white px-2 py-3 text-center shadow-sm">
      <p className="text-lg font-black tabular-nums text-purple-700 sm:text-xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
        {label}
      </p>
    </div>
  );
};

export default CountdownTimer;
