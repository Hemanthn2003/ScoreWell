import dayjs from "dayjs";

export const emptyQuestion = (): import("./types").Question => ({
  question: "",
  options: ["", ""],
  questionType: "SINGLE",
  answer: [],
});

export const formatCountdown = (
  deadline?: string | null,
  nowMs = Date.now()
): string => {
  if (!deadline) return "No deadline set";

  const deadlineMs = dayjs(deadline).valueOf();

  if (!Number.isFinite(deadlineMs)) return "Invalid deadline";

  const remaining = deadlineMs - nowMs;

  if (remaining <= 0) return "Expired";

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
