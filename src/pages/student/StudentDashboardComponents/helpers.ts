import type {
  DashboardExam,
  DashboardAttempt,
  ExamType,
} from "./types";

export const formatDate = (
  value?: string | null
): string => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export const formatTime = (
  value?: string | null
): string => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export const formatDuration = (
  seconds?: number
): string => {
  if (
    seconds === undefined ||
    seconds === null ||
    Number.isNaN(seconds)
  ) {
    return "—";
  }

  const totalMinutes =
    Math.floor(
      seconds / 60
    );

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

export const getExamType = (
  item:
    | DashboardExam
    | DashboardAttempt
): ExamType => {
  if (
    item.examType ===
      "STRICT" ||
    item.type === "STRICT" ||
    item.strict === true
  ) {
    return "STRICT";
  }

  return "NORMAL";
};

export const getDeadline = (
  exam: DashboardExam
): string | null => {
  if (
    exam.strictDeadlineDate
  ) {
    return exam.strictDeadlineDate;
  }

  if (
    exam.strictExamDeadline
  ) {
    return exam.strictExamDeadline;
  }

  return (
    exam.deadlineDate ??
    null
  );
};

export const getNegativeMarkingText =
  (
    exam: DashboardExam
  ): string => {
    if (
      !exam.negativeMarking ||
      exam.negativeMarking
        .enabled === false
    ) {
      return "None";
    }

    if (
      exam.negativeMarking
        .penalty !==
        undefined &&
      exam.negativeMarking
        .penalty !== null
    ) {
      return `${exam.negativeMarking.penalty}`;
    }

    return "Enabled";
  };