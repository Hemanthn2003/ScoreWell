import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import Exam from "../models/Exam";
import QuestionSet from "../models/Question";
import User from "../models/User";
import SpecialExamStudent from "../models/SpecialExamStudent";

interface CreateExamBody {
  title?: string;
  description?: string;
  questionSetIds?: string[];
  questionCount?: number;
  durationMinutes?: number;
  marksPerQuestion?: number;
  negativeMarking?: {
    enabled?: boolean;
    penalty?: number;
  };
  mode?: "COMMON" | "SPECIAL";
  maxAttempts?: number;
  studentIds?: string[];
}

const validateObjectIds = (
  ids: string[]
): boolean => {
  return ids.every((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
};

const shuffle = <T>(
  array: T[]
): T[] => {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
};

const getInstructor = async (
  req: Request
) => {
  if (!req.user) {
    return null;
  }

  return User.findById(
    req.user.userId
  ).select(
    "name email role department"
  );
};

/* =========================================================
   GET MY EXAMS
========================================================= */

export const getMyExams =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.user ||
        req.user.role !== "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can access exams.",
        });

        return;
      }

      const exams =
        await Exam.find({
          instructorId:
            req.user.userId,
        }).sort({
          _id: -1,
        });

      const specialAssignments =
        await SpecialExamStudent.find({
          examId: {
            $in: exams.map(
              (exam) => exam._id
            ),
          },
        });

      const assignmentMap =
        new Map<
          string,
          typeof specialAssignments
        >();

      for (
        const assignment of
          specialAssignments
      ) {
        const key =
          assignment.examId.toString();

        if (
          !assignmentMap.has(key)
        ) {
          assignmentMap.set(
            key,
            []
          );
        }

        assignmentMap
          .get(key)!
          .push(assignment);
      }

      const formatted =
        exams.map((exam) => ({
          ...exam.toObject(),

          selectedStudents:
            assignmentMap
              .get(
                exam._id.toString()
              )
              ?.map(
                (student) => ({
                  _id:
                    student.studentId.toString(),
                  name:
                    student.studentName,
                  email:
                    student.studentEmail,
                  department:
                    student.department,
                })
              ) ?? [],
        }));

      res.status(200).json({
        success: true,
        exams: formatted,
      });
    } catch (error) {
      console.error(
        "Get exams error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load exams.",
      });
    }
  };

/* =========================================================
   GET AVAILABLE QUESTION SETS
========================================================= */

export const getAvailableQuestionSets =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const instructor =
        await getInstructor(req);

      if (
        !instructor ||
        instructor.role !== "INSTRUCTOR"
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
          department:
            instructor.department,

          isActive: true,
        }).sort({
          _id: -1,
        });

      res.status(200).json({
        success: true,
        questionSets,
      });
    } catch (error) {
      console.error(
        "Get available question sets error:",
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
   GET STUDENTS OF INSTRUCTOR DEPARTMENT
========================================================= */

export const getDepartmentStudents =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const instructor =
        await getInstructor(req);

      if (
        !instructor ||
        instructor.role !== "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can access students.",
        });

        return;
      }

      const students =
        await User.find({
          role: "STUDENT",

          department:
            instructor.department,

          isPermitted: true,

          isActive: true,
        })
          .select(
            "_id name email department"
          )
          .sort({
            name: 1,
          });

      res.status(200).json({
        success: true,
        students,
      });
    } catch (error) {
      console.error(
        "Get department students error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load students.",
      });
    }
  };

/* =========================================================
   CREATE EXAM
========================================================= */

export const createExam =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const instructor =
        await getInstructor(req);

      if (
        !instructor ||
        instructor.role !== "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can create exams.",
        });

        return;
      }

      const {
        title,
        description = "",
        questionSetIds = [],
        questionCount,
        durationMinutes,
        marksPerQuestion,
        negativeMarking,
        mode = "COMMON",
        maxAttempts = 1,
        studentIds = [],
      } =
        req.body as CreateExamBody;

      if (!title?.trim()) {
        res.status(400).json({
          success: false,
          message:
            "Exam name is required.",
        });

        return;
      }

      if (
        !Array.isArray(
          questionSetIds
        ) ||
        questionSetIds.length === 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Select at least one question set.",
        });

        return;
      }

      if (
        !Number.isInteger(
          questionCount
        ) ||
        questionCount! < 1
      ) {
        res.status(400).json({
          success: false,
          message:
            "Question count must be at least 1.",
        });

        return;
      }

      if (
        !Number.isInteger(
          durationMinutes
        ) ||
        durationMinutes! < 1
      ) {
        res.status(400).json({
          success: false,
          message:
            "Duration must be at least 1 minute.",
        });

        return;
      }

      if (
        typeof marksPerQuestion !==
          "number" ||
        marksPerQuestion < 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Marks per question are invalid.",
        });

        return;
      }

      if (
        !Number.isInteger(
          maxAttempts
        ) ||
        maxAttempts! < 1
      ) {
        res.status(400).json({
          success: false,
          message:
            "Maximum attempts must be at least 1.",
        });

        return;
      }

      if (
        mode !== "COMMON" &&
        mode !== "SPECIAL"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid exam mode.",
        });

        return;
      }

      if (
        mode === "SPECIAL" &&
        (!Array.isArray(
          studentIds
        ) ||
          studentIds.length === 0)
      ) {
        res.status(400).json({
          success: false,
          message:
            "Select at least one student for a special exam.",
        });

        return;
      }

      if (
        !validateObjectIds(
          studentIds
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "One or more student IDs are invalid.",
        });

        return;
      }

      /*
       * Only published question sets
       * belonging to the instructor's
       * department can be used.
       */
      const questionSets =
        await QuestionSet.find({
          _id: {
            $in: questionSetIds,
          },

          department:
            instructor.department,

          isActive: true,
        });

      if (
        questionSets.length !==
        questionSetIds.length
      ) {
        res.status(400).json({
          success: false,
          message:
            "One or more selected question sets are unavailable for this department.",
        });

        return;
      }

      /*
       * Gather every question from all
       * selected question sets.
       */
      const allQuestions =
        questionSets.flatMap(
          (set) =>
            set.questions.map(
              (question) => ({
                questionSetId:
                  set._id,

                questionId:
                  question._id,
              })
            )
        );

      if (
        questionCount! >
        allQuestions.length
      ) {
        res.status(400).json({
          success: false,
          message:
            `Maximum available questions are ${allQuestions.length}.`,
        });

        return;
      }

      /*
       * Random selection across ALL
       * selected question sets.
       */
      const selectedQuestions =
        shuffle(
          allQuestions
        ).slice(
          0,
          questionCount
        );

      /*
       * Special exam students must
       * belong to the same department.
       */
      let selectedStudents:
        Array<{
          _id: mongoose.Types.ObjectId;
          name: string;
          email: string;
          department: string;
        }> = [];

      if (
        mode === "SPECIAL"
      ) {
        selectedStudents =
          await User.find({
            _id: {
              $in: studentIds,
            },

            role: "STUDENT",

            department:
              instructor.department,

            isPermitted: true,
          }).select(
            "_id name email department"
          );

        if (
          selectedStudents.length !==
          studentIds.length
        ) {
          res.status(400).json({
            success: false,
            message:
              "One or more selected students do not belong to your department.",
          });

          return;
        }
      }

      const exam =
        await Exam.create({
          title:
            title.trim(),

          description:
            description?.trim() ?? "",

          questionSetIds,

          questionIds:
            selectedQuestions.map(
              (question) =>
                question.questionId
            ),

          department:
            instructor.department,

          instructorId:
            req.user!.userId,

          durationMinutes:
            durationMinutes!,

          questionCount:
            questionCount!,

          marksPerQuestion:
            marksPerQuestion!,

          negativeMarking: {
            enabled:
              Boolean(
                negativeMarking?.enabled
              ),

            penalty:
              negativeMarking?.enabled
                ? Number(
                    negativeMarking.penalty ??
                      0
                  )
                : 0,
          },

          mode,

          maxAttempts:
            maxAttempts!,

          status:
            "UNPUBLISHED",
        });

      /*
       * Store special exam student
       * assignments in separate collection.
       */
      if (
        mode === "SPECIAL"
      ) {
        await SpecialExamStudent.insertMany(
          selectedStudents.map(
            (student) => ({
              examId:
                exam._id,

              studentId:
                student._id,

              studentEmail:
                student.email,

              studentName:
                student.name,

              department:
                student.department,

              assignedBy:
                req.user!.userId,
            })
          )
        );
      }

      res.status(201).json({
        success: true,
        message:
          "Exam created successfully.",
        exam,
      });
    } catch (error) {
      console.error(
        "Create exam error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create exam.",
      });
    }
  };

/* =========================================================
   UPDATE EXAM
========================================================= */

export const updateExam =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const instructor =
        await getInstructor(req);

      if (
        !instructor ||
        instructor.role !== "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can update exams.",
        });

        return;
      }

     const id = Array.isArray(
  req.params.id
)
  ? req.params.id[0]
  : req.params.id;

            if (
            !id ||
            !mongoose.Types.ObjectId.isValid(
                id
            )
            ) {
            res.status(400).json({
                success: false,
                message:
                "Invalid exam ID.",
            });

            return;
            }

      const existing =
        await Exam.findOne({
          _id: id,
          instructorId:
            req.user!.userId,
        });

      if (!existing) {
        res.status(404).json({
          success: false,
          message:
            "Exam not found.",
        });

        return;
      }

      const body =
        req.body as CreateExamBody;

      const {
        title,
        description = "",
        questionSetIds = [],
        questionCount,
        durationMinutes,
        marksPerQuestion,
        negativeMarking,
        mode = "COMMON",
        maxAttempts = 1,
        studentIds = [],
      } = body;

      if (!title?.trim()) {
        res.status(400).json({
          success: false,
          message:
            "Exam name is required.",
        });

        return;
      }

      if (
        !questionSetIds.length
      ) {
        res.status(400).json({
          success: false,
          message:
            "Select at least one question set.",
        });

        return;
      }

      const questionSets =
        await QuestionSet.find({
          _id: {
            $in: questionSetIds,
          },

          department:
            instructor.department,

          isActive: true,
        });

      if (
        questionSets.length !==
        questionSetIds.length
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid question-set selection.",
        });

        return;
      }

      const allQuestions =
        questionSets.flatMap(
          (set) =>
            set.questions.map(
              (question) => ({
                questionSetId:
                  set._id,

                questionId:
                  question._id,
              })
            )
        );

      if (
        !Number.isInteger(
          questionCount
        ) ||
        questionCount! < 1 ||
        questionCount! >
          allQuestions.length
      ) {
        res.status(400).json({
          success: false,
          message:
            `Question count must be between 1 and ${allQuestions.length}.`,
        });

        return;
      }

      if (
        mode === "SPECIAL" &&
        !studentIds.length
      ) {
        res.status(400).json({
          success: false,
          message:
            "Select at least one student.",
        });

        return;
      }

      if (
        mode === "SPECIAL" &&
        !validateObjectIds(
          studentIds
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid student selection.",
        });

        return;
      }

      let selectedStudents:
        Array<{
          _id: mongoose.Types.ObjectId;
          name: string;
          email: string;
          department: string;
        }> = [];

      if (
        mode === "SPECIAL"
      ) {
        selectedStudents =
          await User.find({
            _id: {
              $in: studentIds,
            },

            role: "STUDENT",

            department:
              instructor.department,

            isPermitted: true,
          }).select(
            "_id name email department"
          );

        if (
          selectedStudents.length !==
          studentIds.length
        ) {
          res.status(400).json({
            success: false,
            message:
              "All selected students must belong to your department.",
          });

          return;
        }
      }

      const selectedQuestions =
        shuffle(
          allQuestions
        ).slice(
          0,
          questionCount
        );

      existing.title =
        title.trim();

      existing.description =
        description?.trim() ?? "";

      existing.questionSetIds =
        questionSetIds;

      existing.questionIds =
        selectedQuestions.map(
          (question) =>
            question.questionId
        );

      existing.durationMinutes =
        durationMinutes!;

      existing.questionCount =
        questionCount!;

      existing.marksPerQuestion =
        marksPerQuestion!;

      existing.negativeMarking = {
        enabled:
          Boolean(
            negativeMarking?.enabled
          ),

        penalty:
          negativeMarking?.enabled
            ? Number(
                negativeMarking.penalty ??
                  0
              )
            : 0,
      };

      existing.mode =
        mode;

      existing.maxAttempts =
        maxAttempts!;

      /*
       * Keep current publication
       * state when editing.
       */
      await existing.save();

      await SpecialExamStudent.deleteMany(
        {
          examId:
            existing._id,
        }
      );

      if (
        mode === "SPECIAL"
      ) {
        await SpecialExamStudent.insertMany(
          selectedStudents.map(
            (student) => ({
              examId:
                existing._id,

              studentId:
                student._id,

              studentEmail:
                student.email,

              studentName:
                student.name,

              department:
                student.department,

              assignedBy:
                req.user!.userId,
            })
          )
        );
      }

      res.status(200).json({
        success: true,
        message:
          "Exam updated successfully.",
        exam: existing,
      });
    } catch (error) {
      console.error(
        "Update exam error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update exam.",
      });
    }
  };

/* =========================================================
   DELETE EXAM
========================================================= */

export const deleteExam =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.user ||
        req.user.role !== "INSTRUCTOR"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Only instructors can delete exams.",
        });

        return;
      }

      const { id } =
        req.params;

      const exam =
        await Exam.findOneAndDelete({
          _id: id,
          instructorId:
            req.user.userId,
        });

      if (!exam) {
        res.status(404).json({
          success: false,
          message:
            "Exam not found.",
        });

        return;
      }

      await SpecialExamStudent.deleteMany(
        {
          examId:
            exam._id,
        }
      );

      res.status(200).json({
        success: true,
        message:
          "Exam deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete exam error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete exam.",
      });
    }
  };

/* =========================================================
   PUBLISH
========================================================= */

export const publishExam =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const exam =
        await Exam.findOne({
          _id: req.params.id,
          instructorId:
            req.user?.userId,
        });

      if (!exam) {
        res.status(404).json({
          success: false,
          message:
            "Exam not found.",
        });

        return;
      }

      exam.status =
        "PUBLISHED";

      await exam.save();

      res.status(200).json({
        success: true,
        message:
          "Exam published successfully.",
        exam,
      });
    } catch (error) {
      console.error(
        "Publish exam error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to publish exam.",
      });
    }
  };

/* =========================================================
   UNPUBLISH
========================================================= */

export const unpublishExam =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const exam =
        await Exam.findOne({
          _id: req.params.id,
          instructorId:
            req.user?.userId,
        });

      if (!exam) {
        res.status(404).json({
          success: false,
          message:
            "Exam not found.",
        });

        return;
      }

      exam.status =
        "UNPUBLISHED";

      await exam.save();

      res.status(200).json({
        success: true,
        message:
          "Exam unpublished successfully.",
        exam,
      });
    } catch (error) {
      console.error(
        "Unpublish exam error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to unpublish exam.",
      });
    }
  };