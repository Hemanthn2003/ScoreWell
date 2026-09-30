import type { Question } from "./types";

export const createEmptyQuestion = (): Question => ({
  question: "",
  options: ["", ""],
  questionType: "SINGLE",
  answer: [],
});
