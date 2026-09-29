import type {
  Request,
  Response,
} from "express";

import QuestionSet from "../models/Question";
import User from "../models/User";
import pdfParse from "pdf-parse";

/* =========================================================
   TYPES
========================================================= */

interface QuestionInput {
  _id?: string;
  question: string;
  options: string[];
  questionType:
    | "SINGLE"
    | "MULTI";
  answer: string[];
}

/* =========================================================
   HELPERS
========================================================= */

const generateQuestionSetId =
  (): string => {
    return `QS${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;
  };

const generateQuestionId = (
  questionIndex: number
): string => {
  return `Q${Date.now()}${questionIndex}${Math.floor(
    Math.random() * 1000
  )}`;
};

const validateQuestions = (
  questions: QuestionInput[]
): string | null => {
  if (
    !Array.isArray(questions) ||
    questions.length === 0
  ) {
    return "At least one question is required.";
  }

  for (
    let i = 0;
    i < questions.length;
    i++
  ) {
    const question =
      questions[i];

    if (
      !question.question?.trim()
    ) {
      return `Question ${
        i + 1
      } cannot be empty.`;
    }

    if (
      !Array.isArray(
        question.options
      ) ||
      question.options.length < 2
    ) {
      return `Question ${
        i + 1
      } must have at least 2 options.`;
    }

    const options =
      question.options
        .map((option) =>
          option.trim()
        )
        .filter(Boolean);

    if (options.length < 2) {
      return `Question ${
        i + 1
      } must have at least 2 valid options.`;
    }

    if (
      question.questionType !==
        "SINGLE" &&
      question.questionType !==
        "MULTI"
    ) {
      return `Invalid question type for question ${
        i + 1
      }.`;
    }

    if (
      !Array.isArray(
        question.answer
      ) ||
      question.answer.length === 0
    ) {
      return `Please select at least one correct answer for question ${
        i + 1
      }.`;
    }

    const invalidAnswers =
      question.answer.some(
        (answer) =>
          !options.includes(answer)
      );

    if (invalidAnswers) {
      return `Invalid answer selected for question ${
        i + 1
      }.`;
    }

    if (
      question.questionType ===
        "SINGLE" &&
      question.answer.length !== 1
    ) {
      return "A SINGLE question must have exactly one correct answer.";
    }
  }

  return null;
};

/* =========================================================
   PDF QUESTION IMPORT
========================================================= */

interface ParsedPdfQuestion {
  question: string;
  options: string[];
  questionType: "SINGLE" | "MULTI";
  answer: string[];
}

const cleanPdfLine = (line: string): string =>
  line
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

const normalizeAnswerToken = (token: string): string =>
  token
    .trim()
    .replace(/^[\[\](){}]+|[\[\](){}]+$/g, "")
    .replace(/[.)]$/, "")
    .trim();

const parseCorrectAnswers = (
  answerText: string,
  options: string[]
): string[] => {
  const normalized = answerText
    .replace(/^(correct\s*)?answer\s*[:\-]?/i, "")
    .trim();

  if (!normalized) {
    return [];
  }

  const tokens = normalized
    .split(/\s*(?:,|\/|&|\band\b)\s*/i)
    .map(normalizeAnswerToken)
    .filter(Boolean);

  const answers: string[] = [];

  for (const token of tokens) {
    const letterMatch = token.match(/^([A-H])$/i);

    if (letterMatch) {
      const optionIndex =
        letterMatch[1].toUpperCase().charCodeAt(0) -
        65;

      if (options[optionIndex]) {
        answers.push(options[optionIndex]);
        continue;
      }
    }

    const optionWithLetter = token.match(
      /^([A-H])[.)]\s*(.+)$/i
    );

    if (optionWithLetter) {
      const optionIndex =
        optionWithLetter[1].toUpperCase().charCodeAt(0) -
        65;

      if (options[optionIndex]) {
        answers.push(options[optionIndex]);
        continue;
      }
    }

    const exactOption = options.find(
      (option) =>
        option.trim().toLowerCase() ===
        token.trim().toLowerCase()
    );

    if (exactOption) {
      answers.push(exactOption);
    }
  }

  return [...new Set(answers)];
};

const parsePdfQuestions = (
  text: string
): {
  questions: ParsedPdfQuestion[];
  warnings: string[];
} => {
  const normalizedText = text
    .replace(/\r/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ");

  const lines = normalizedText
    .split("\n")
    .map(cleanPdfLine)
    .filter(Boolean);

  const questionStart = /^(?:Q(?:uestion)?\s*)?(\d{1,4})[.)\-:]\s+(.+)$/i;
  const optionStart = /^([A-H])[.)\-:]\s+(.+)$/i;
  const answerStart = /^(?:correct\s+answer|correct\s+answers|answer|answers|ans)\s*[:\-]?\s*(.*)$/i;

  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    const questionMatch = line.match(questionStart);

    if (questionMatch) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }

      currentBlock = [line];
      continue;
    }

    if (currentBlock.length > 0) {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  const questions: ParsedPdfQuestion[] = [];
  const warnings: string[] = [];

  blocks.forEach((block, blockIndex) => {
    const first = block[0].match(questionStart);

    if (!first) {
      return;
    }

    const questionLines: string[] = [first[2]];
    const options: string[] = [];
    let answerText = "";
    let readingAnswerContinuation = false;

    for (let index = 1; index < block.length; index += 1) {
      const line = block[index];
      const optionMatch = line.match(optionStart);
      const answerMatch = line.match(answerStart);

      if (answerMatch) {
        answerText = answerMatch[1].trim();
        readingAnswerContinuation = true;
        continue;
      }

      if (readingAnswerContinuation) {
        // Continue a wrapped answer line only when it does not
        // look like another option/question.
        if (!optionMatch && !questionStart.test(line)) {
          answerText = `${answerText} ${line}`.trim();
          continue;
        }
        readingAnswerContinuation = false;
      }

      if (optionMatch) {
        options.push(optionMatch[2].trim());
        continue;
      }

      if (options.length === 0) {
        questionLines.push(line);
      }
    }

    const question = questionLines
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!question || options.length < 2) {
      warnings.push(
        `Question ${blockIndex + 1} could not be parsed completely.`
      );
      return;
    }

    const answers = parseCorrectAnswers(
      answerText,
      options
    );

    if (answers.length === 0) {
      warnings.push(
        `Question ${blockIndex + 1} has no recognizable correct answer. Review it before saving.`
      );
    }

    questions.push({
      question,
      options,
      questionType:
        answers.length > 1 ? "MULTI" : "SINGLE",
      answer: answers,
    });
  });

  return { questions, warnings };
};

export const importQuestionsFromPdf =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (req.user.role !== "INSTRUCTOR") {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can import question PDFs.",
        });
        return;
      }

      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: "Please upload a PDF file.",
        });
        return;
      }

      if (
        file.mimetype !== "application/pdf" &&
        !file.originalname.toLowerCase().endsWith(".pdf")
      ) {
        res.status(400).json({
          success: false,
          message: "Only PDF files are supported.",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          message: "PDF size must be 10 MB or less.",
        });
        return;
      }

      const pdf = await pdfParse(file.buffer);
      const parsed = parsePdfQuestions(pdf.text || "");

      if (parsed.questions.length === 0) {
        res.status(422).json({
          success: false,
          message:
            "No questions could be detected. Use the supported format: numbered question, A/B/C/D options, and Correct Answer.",
          warnings: parsed.warnings,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Detected ${parsed.questions.length} question(s) from the PDF.`,
        questions: parsed.questions,
        warnings: parsed.warnings,
      });
    } catch (error) {
      console.error(
        "Import question PDF error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to read the PDF. Make sure it is a valid text-based PDF.",
      });
    }
  };

/* =========================================================
   GET MY QUESTION SETS
========================================================= */

export const getMyQuestionSets =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });

        return;
      }

      if (
        req.user.role !==
        "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can access question sets.",
        });

        return;
      }

      const questionSets =
        await QuestionSet.find({
          createdBy:
            req.user.userId,
        }).sort({
          _id: -1,
        });

      res.status(200).json({
        success: true,
        questionSets,
      });
    } catch (error) {
      console.error(
        "Get question sets error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load question sets.",
      });
    }
  };

/* =========================================================
   CREATE QUESTION SET
========================================================= */

export const createQuestionSet =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });

        return;
      }

      if (
        req.user.role !==
        "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can create question sets.",
        });

        return;
      }

      const {
        questionSetName,
        questions,
      } = req.body as {
        questionSetName?: string;
        questions?: QuestionInput[];
      };

      /* -----------------------------------------------
         QUESTION SET NAME
      ----------------------------------------------- */

      if (
        !questionSetName?.trim()
      ) {
        res.status(400).json({
          success: false,
          message:
            "Question set name is required.",
        });

        return;
      }

      /* -----------------------------------------------
         VALIDATE QUESTIONS
      ----------------------------------------------- */

      const questionError =
        validateQuestions(
          questions ?? []
        );

      if (questionError) {
        res.status(400).json({
          success: false,
          message: questionError,
        });

        return;
      }

      /* -----------------------------------------------
         FIND INSTRUCTOR
      ----------------------------------------------- */

      const instructor =
        await User.findById(
          req.user.userId
        ).select(
          "department role"
        );

      if (
        !instructor ||
        instructor.role !==
          "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Instructor account not found.",
        });

        return;
      }

      /* -----------------------------------------------
         DEPARTMENT
      ----------------------------------------------- */

      if (!instructor.department) {
        res.status(400).json({
          success: false,
          message:
            "Instructor department is not available.",
        });

        return;
      }

      /* -----------------------------------------------
         PREPARE QUESTIONS
      ----------------------------------------------- */

      const newQuestions = (
        questions as QuestionInput[]
      ).map(
        (
          question,
          index
        ) => ({
          _id:
            question._id ||
            generateQuestionId(
              index
            ),

          question:
            question.question.trim(),

          options:
            question.options
              .map(
                (option) =>
                  option.trim()
              )
              .filter(Boolean),

          questionType:
            question.questionType,

          answer:
            question.answer,
        })
      );

      /* -----------------------------------------------
         CREATE QUESTION SET
      ----------------------------------------------- */

      const questionSet =
        await QuestionSet.create(
          {
            _id:
              generateQuestionSetId(),

            questionSetName:
              questionSetName.trim(),

            department:
              instructor.department,

            questions:
              newQuestions,

            createdBy:
              req.user.userId,

            /*
              Newly created question sets
              remain unpublished.
            */
            isActive: false,
          }
        );

      res.status(201).json({
        success: true,
        message:
          "Question set created successfully.",
        questionSet,
      });
    } catch (error) {
      console.error(
        "Create question set error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create question set.",
      });
    }
  };

/* =========================================================
   UPDATE QUESTION SET
========================================================= */

export const updateQuestionSet =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });

        return;
      }

      if (
        req.user.role !==
        "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can update question sets.",
        });

        return;
      }

      const { id } =
        req.params;

      const {
        questionSetName,
        questions,
      } = req.body as {
        questionSetName?: string;
        questions?: QuestionInput[];
      };

      if (
        !questionSetName?.trim()
      ) {
        res.status(400).json({
          success: false,
          message:
            "Question set name is required.",
        });

        return;
      }

      const questionError =
        validateQuestions(
          questions ?? []
        );

      if (questionError) {
        res.status(400).json({
          success: false,
          message: questionError,
        });

        return;
      }

      const existing =
        await QuestionSet.findOne({
          _id: id,
          createdBy:
            req.user.userId,
        });

      if (!existing) {
        res.status(404).json({
          success: false,
          message:
            "Question set not found.",
        });

        return;
      }

      const updatedQuestions = (
        questions as QuestionInput[]
      ).map(
        (
          question,
          index
        ) => ({
          _id:
            question._id ||
            generateQuestionId(
              index
            ),

          question:
            question.question.trim(),

          options:
            question.options
              .map(
                (option) =>
                  option.trim()
              )
              .filter(Boolean),

          questionType:
            question.questionType,

          answer:
            question.answer,
        })
      );

      existing.questionSetName =
        questionSetName.trim();

      existing.questions =
        updatedQuestions;

      await existing.save();

      res.status(200).json({
        success: true,
        message:
          "Question set updated successfully.",
        questionSet:
          existing,
      });
    } catch (error) {
      console.error(
        "Update question set error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update question set.",
      });
    }
  };

/* =========================================================
   DELETE QUESTION SET
========================================================= */

export const deleteQuestionSet =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });

        return;
      }

      if (
        req.user.role !==
        "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can delete question sets.",
        });

        return;
      }

      const { id } =
        req.params;

      const deleted =
        await QuestionSet.findOneAndDelete(
          {
            _id: id,
            createdBy:
              req.user.userId,
          }
        );

      if (!deleted) {
        res.status(404).json({
          success: false,
          message:
            "Question set not found.",
        });

        return;
      }

      res.status(200).json({
        success: true,
        message:
          "Question set deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete question set error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete question set.",
      });
    }
  };

/* =========================================================
   PUBLISH QUESTION SET
========================================================= */

export const publishQuestionSet =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });

        return;
      }

      if (
        req.user.role !==
        "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can publish question sets.",
        });

        return;
      }

      const { id } =
        req.params;

      const questionSet =
        await QuestionSet.findOne({
          _id: id,
          createdBy:
            req.user.userId,
        });

      if (!questionSet) {
        res.status(404).json({
          success: false,
          message:
            "Question set not found.",
        });

        return;
      }

      if (
        questionSet.questions
          .length === 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "A question set must contain at least one question.",
        });

        return;
      }

      questionSet.isActive =
        true;

      await questionSet.save();

      res.status(200).json({
        success: true,
        message:
          "Question set published successfully.",
        questionSet,
      });
    } catch (error) {
      console.error(
        "Publish question set error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to publish question set.",
      });
    }
  };

/* =========================================================
   UNPUBLISH QUESTION SET
========================================================= */

export const unpublishQuestionSet =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });

        return;
      }

      if (
        req.user.role !==
        "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can unpublish question sets.",
        });

        return;
      }

      const { id } =
        req.params;

      const questionSet =
        await QuestionSet.findOne({
          _id: id,
          createdBy:
            req.user.userId,
        });

      if (!questionSet) {
        res.status(404).json({
          success: false,
          message:
            "Question set not found.",
        });

        return;
      }

      questionSet.isActive =
        false;

      await questionSet.save();

      res.status(200).json({
        success: true,
        message:
          "Question set unpublished successfully.",
        questionSet,
      });
    } catch (error) {
      console.error(
        "Unpublish question set error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to unpublish question set.",
      });
    }
  };