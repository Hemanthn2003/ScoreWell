import type {
  Request,
  Response,
} from "express";

import QuestionSet from "../models/Question";
import User from "../models/User";

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