import type { Request, Response } from "express";

import mongoose from "mongoose";

import Exam from "../models/Exam";
import QuestionSet from "../models/Question";
import User from "../models/User";
import SpecialExamStudent from "../models/SpecialExamStudent";
import StrictExam from "../models/StrictExam";

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
  strictMode?: boolean;
  strictAttemptChances?: number;
  strictDeadlineDate?: string;
  studentIds?: string[];
  startDate?: string;
  deadlineDate?: string;
}

const parseDateTime = (value?: string): Date | null => {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const syncExamStatuses = async (): Promise<void> => {
  const now = new Date();

  await Exam.updateMany(
    {
      status: "UNPUBLISHED",
      startDate: {
        $ne: null,
        $lte: now,
      },
    },
    {
      $set: {
        status: "PUBLISHED",
      },
    },
  );

  await Exam.updateMany(
    {
      status: "PUBLISHED",
      deadlineDate: {
        $ne: null,
        $lte: now,
      },
    },
    {
      $set: {
        status: "EXPIRED",
      },
    },
  );
};

void syncExamStatuses();

setInterval(() => {
  void syncExamStatuses().catch((error) => {
    console.error("Exam status scheduler error:", error);
  });
}, 30_000);

const validateObjectIds = (ids: string[]): boolean => {
  return ids.every((id) => mongoose.Types.ObjectId.isValid(id));
};

const normalizeDepartment = (department?: string | null): string => {
  return (department ?? "").trim().replace(/\s+/g, " ").toLowerCase();
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const getInstructor = async (req: Request) => {
  if (!req.user) {
    return null;
  }

  return User.findById(req.user.userId).select(
    "name email role department isActive",
  );
};

/* =========================================================
   GET MY EXAMS
========================================================= */

export const getMyExams = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await syncExamStatuses();

    if (!req.user || req.user.role !== "INSTRUCTOR") {
      res.status(403).json({
        success: false,
        message: "Only instructors can access exams.",
      });

      return;
    }

    const exams = await Exam.find({
      instructorId: req.user.userId,
    }).sort({
      _id: -1,
    });

    const specialAssignments = await SpecialExamStudent.find({
      examId: {
        $in: exams.map((exam) => exam._id),
      },
    });

    const strictExams = await StrictExam.find({
      examId: {
        $in: exams.map((exam) => exam._id),
      },

      instructorId: req.user.userId,
    });

    const strictExamMap = new Map<string, (typeof strictExams)[number]>();

    for (const strictExam of strictExams) {
      strictExamMap.set(strictExam.examId.toString(), strictExam);
    }

    const assignmentMap = new Map<string, typeof specialAssignments>();

    for (const assignment of specialAssignments) {
      const key = assignment.examId.toString();

      if (!assignmentMap.has(key)) {
        assignmentMap.set(key, []);
      }

      assignmentMap.get(key)!.push(assignment);
    }

    const formatted = exams.map((exam) => ({
      ...exam.toObject(),

      strictExam: strictExamMap.get(exam._id.toString()) ?? null,

      selectedStudents:
        assignmentMap.get(exam._id.toString())?.map((student) => ({
          _id: student.studentId.toString(),

          name: student.studentName,

          email: student.studentEmail,

          department: student.department,
        })) ?? [],
    }));

    res.status(200).json({
      success: true,
      exams: formatted,
    });
  } catch (error) {
    console.error("Get exams error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load exams.",
    });
  }
};

/* =========================================================
   GET AVAILABLE QUESTION SETS
========================================================= */

export const getAvailableQuestionSets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const instructor = await getInstructor(req);

    if (!instructor || instructor.role !== "INSTRUCTOR") {
      res.status(403).json({
        success: false,
        message: "Only instructors can access question sets.",
      });

      return;
    }

    const questionSets = await QuestionSet.find({
      department: instructor.department,

      isActive: true,
    }).sort({
      _id: -1,
    });

    res.status(200).json({
      success: true,
      questionSets,
    });
  } catch (error) {
    console.error("Get available question sets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load question sets.",
    });
  }
};

/* =========================================================
   GET STUDENTS OF INSTRUCTOR DEPARTMENT
========================================================= */

export const getDepartmentStudents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const instructor = await getInstructor(req);

    if (!instructor || instructor.role !== "INSTRUCTOR") {
      res.status(403).json({
        success: false,
        message: "Only instructors can access students.",
      });

      return;
    }

    /*
     * IMPORTANT:
     *
     * We intentionally DO NOT check
     * instructor.isActive here.
     *
     * We also intentionally DO NOT
     * check student.isActive.
     *
     * Requirement:
     * Every STUDENT whose
     * isPermitted === true and whose
     * department matches the instructor
     * must be returned.
     */

    const instructorDepartment = normalizeDepartment(instructor.department);

    const allPermittedStudents = await User.find({
      role: "STUDENT",
      isPermitted: true,
    })
      .select("_id name email department")
      .sort({
        name: 1,
      });

    const students = allPermittedStudents
      .filter((student) => {
        return normalizeDepartment(student.department) === instructorDepartment;
      })
      .map((student) => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        department: student.department ?? "",
      }));

    console.log("Instructor department:", instructor.department);

    console.log("Normalized instructor department:", instructorDepartment);

    console.log("Total permitted students:", allPermittedStudents.length);

    console.log("Department students returned:", students.length);

    console.log(
      "Students returned:",
      students.map((student) => ({
        name: student.name,
        email: student.email,
        department: student.department,
      })),
    );

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get department students error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load students.",
    });
  }
};

/* =========================================================
   CREATE EXAM
========================================================= */

export const createExam = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const instructor = await getInstructor(req);

    if (!instructor || instructor.role !== "INSTRUCTOR") {
      res.status(403).json({
        success: false,
        message: "Only instructors can create exams.",
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
      strictMode = false,
      strictAttemptChances,
      strictDeadlineDate,
      studentIds = [],
      startDate,
      deadlineDate,
    } = req.body as CreateExamBody;

    if (!title?.trim()) {
      res.status(400).json({
        success: false,
        message: "Exam name is required.",
      });

      return;
    }

    if (!Array.isArray(questionSetIds) || questionSetIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Select at least one question set.",
      });

      return;
    }

    if (!Number.isInteger(questionCount) || questionCount! < 1) {
      res.status(400).json({
        success: false,
        message: "Question count must be at least 1.",
      });

      return;
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes! < 1) {
      res.status(400).json({
        success: false,
        message: "Duration must be at least 1 minute.",
      });

      return;
    }

    if (typeof marksPerQuestion !== "number" || marksPerQuestion < 0) {
      res.status(400).json({
        success: false,
        message: "Marks per question are invalid.",
      });

      return;
    }

    if (!Number.isInteger(maxAttempts) || maxAttempts! < 1) {
      res.status(400).json({
        success: false,
        message: "Maximum attempts must be at least 1.",
      });

      return;
    }

    const parsedStartDate = parseDateTime(startDate);

    const parsedDeadlineDate = parseDateTime(deadlineDate);

    if (startDate && !parsedStartDate) {
      res.status(400).json({
        success: false,
        message: "Start date and time is invalid.",
      });

      return;
    }

    if (deadlineDate && !parsedDeadlineDate) {
      res.status(400).json({
        success: false,
        message: "Deadline date and time is invalid.",
      });

      return;
    }

    if (parsedDeadlineDate && parsedDeadlineDate <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Deadline date and time must be in the future.",
      });

      return;
    }

    if (
      parsedStartDate &&
      parsedDeadlineDate &&
      parsedDeadlineDate <= parsedStartDate
    ) {
      res.status(400).json({
        success: false,
        message: "Deadline must be after the start date and time.",
      });

      return;
    }

    let parsedStrictDeadline: Date | null = null;

    if (strictMode) {
      if (
        !Number.isInteger(strictAttemptChances) ||
        strictAttemptChances! < 1
      ) {
        res.status(400).json({
          success: false,
          message: "Strict mode attempt chances must be at least 1.",
        });

        return;
      }

      if (!strictDeadlineDate) {
        res.status(400).json({
          success: false,
          message: "Strict mode deadline date is required.",
        });

        return;
      }

      parsedStrictDeadline = new Date(`${strictDeadlineDate}T23:59:59.999`);

      if (Number.isNaN(parsedStrictDeadline.getTime())) {
        res.status(400).json({
          success: false,
          message: "Strict mode deadline date is invalid.",
        });

        return;
      }

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (parsedStrictDeadline < today) {
        res.status(400).json({
          success: false,
          message: "Strict mode deadline cannot be in the past.",
        });

        return;
      }
    }

    if (mode !== "COMMON" && mode !== "SPECIAL") {
      res.status(400).json({
        success: false,
        message: "Invalid exam mode.",
      });

      return;
    }

    if (
      mode === "SPECIAL" &&
      (!Array.isArray(studentIds) || studentIds.length === 0)
    ) {
      res.status(400).json({
        success: false,
        message: "Select at least one student for a special exam.",
      });

      return;
    }

    if (!validateObjectIds(studentIds)) {
      res.status(400).json({
        success: false,
        message: "One or more student IDs are invalid.",
      });

      return;
    }

    const questionSets = await QuestionSet.find({
      _id: {
        $in: questionSetIds,
      },

      department: instructor.department,

      isActive: true,
    });

    if (questionSets.length !== questionSetIds.length) {
      res.status(400).json({
        success: false,
        message:
          "One or more selected question sets are unavailable for this department.",
      });

      return;
    }

    const allQuestions = questionSets.flatMap((set) =>
      set.questions.map((question) => ({
        questionSetId: set._id,

        questionId: question._id,
      })),
    );

    if (questionCount! > allQuestions.length) {
      res.status(400).json({
        success: false,
        message: `Maximum available questions are ${allQuestions.length}.`,
      });

      return;
    }

    const selectedQuestions = shuffle(allQuestions).slice(0, questionCount);

    let selectedStudents: Array<{
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
      department: string;
    }> = [];

    if (mode === "SPECIAL") {
      const instructorDepartment = normalizeDepartment(instructor.department);

      const permittedStudents = await User.find({
        _id: {
          $in: studentIds,
        },

        role: "STUDENT",

        isPermitted: true,
      }).select("_id name email department");

      selectedStudents = permittedStudents
        .filter(
          (student) =>
            normalizeDepartment(student.department) === instructorDepartment,
        )
        .map((student) => ({
          _id: student._id,

          name: student.name,

          email: student.email,

          department: student.department ?? "",
        }));

      if (selectedStudents.length !== studentIds.length) {
        res.status(400).json({
          success: false,
          message:
            "One or more selected students do not belong to your department or are not permitted.",
        });

        return;
      }
    }

    const exam = await Exam.create({
      title: title.trim(),

      description: description?.trim() ?? "",

      questionSetIds,

      questionIds: selectedQuestions.map((question) => question.questionId),

      department: instructor.department,

      instructorId: req.user!.userId,

      durationMinutes: durationMinutes!,

      questionCount: questionCount!,

      marksPerQuestion: marksPerQuestion!,

      negativeMarking: {
        enabled: Boolean(negativeMarking?.enabled),

        penalty: negativeMarking?.enabled
          ? Number(negativeMarking.penalty ?? 0)
          : 0,
      },

      mode,

      maxAttempts: maxAttempts!,

      startDate: parsedStartDate,

      deadlineDate: parsedDeadlineDate,

      status:
        parsedStartDate && parsedStartDate <= new Date()
          ? "PUBLISHED"
          : "UNPUBLISHED",
    });

    if (mode === "SPECIAL") {
      await SpecialExamStudent.insertMany(
        selectedStudents.map((student) => ({
          examId: exam._id,

          studentId: student._id,

          studentEmail: student.email,

          studentName: student.name,

          department: student.department,

          assignedBy: req.user!.userId,
        })),
      );
    }

    let strictExam = null;

    if (strictMode && parsedStrictDeadline) {
      strictExam = await StrictExam.create({
        examId: exam._id,

        questionSetIds,

        attemptChances: strictAttemptChances!,

        deadlineDate: parsedStrictDeadline,

        instructorId: req.user!.userId,

        durationMinutes: durationMinutes!,
      });
    }

    res.status(201).json({
      success: true,
      message: "Exam created successfully.",
      exam,
      strictExam,
    });
  } catch (error) {
    console.error("Create exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create exam.",
    });
  }
};

/* =========================================================
   UPDATE EXAM
========================================================= */

export const updateExam = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const instructor = await getInstructor(req);

    if (!instructor || instructor.role !== "INSTRUCTOR") {
      res.status(403).json({
        success: false,
        message: "Only instructors can update exams.",
      });

      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });

      return;
    }

    const existing = await Exam.findOne({
      _id: id,

      instructorId: req.user!.userId,
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Exam not found.",
      });

      return;
    }

    const body = req.body as CreateExamBody;

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
      strictMode = false,
      strictAttemptChances,
      strictDeadlineDate,
      studentIds = [],
      startDate,
      deadlineDate,
    } = body;

    const parsedStartDate = parseDateTime(startDate);

    const parsedDeadlineDate = parseDateTime(deadlineDate);

    if (startDate && !parsedStartDate) {
      res.status(400).json({
        success: false,
        message: "Start date and time is invalid.",
      });

      return;
    }

    if (deadlineDate && !parsedDeadlineDate) {
      res.status(400).json({
        success: false,
        message: "Deadline date and time is invalid.",
      });

      return;
    }

    if (parsedDeadlineDate && parsedDeadlineDate <= new Date()) {
      res.status(400).json({
        success: false,
        message: "Deadline date and time must be in the future.",
      });

      return;
    }

    if (
      parsedStartDate &&
      parsedDeadlineDate &&
      parsedDeadlineDate <= parsedStartDate
    ) {
      res.status(400).json({
        success: false,
        message: "Deadline must be after the start date and time.",
      });

      return;
    }

    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
      res.status(400).json({
        success: false,
        message: "Maximum attempts must be at least 1.",
      });

      return;
    }

    let parsedStrictDeadline: Date | null = null;

    if (strictMode) {
      if (
        !Number.isInteger(strictAttemptChances) ||
        strictAttemptChances! < 1
      ) {
        res.status(400).json({
          success: false,
          message: "Strict mode attempt chances must be at least 1.",
        });

        return;
      }

      if (!strictDeadlineDate) {
        res.status(400).json({
          success: false,
          message: "Strict mode deadline date is required.",
        });

        return;
      }

      parsedStrictDeadline = new Date(`${strictDeadlineDate}T23:59:59.999`);

      if (Number.isNaN(parsedStrictDeadline.getTime())) {
        res.status(400).json({
          success: false,
          message: "Strict mode deadline date is invalid.",
        });

        return;
      }

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (parsedStrictDeadline < today) {
        res.status(400).json({
          success: false,
          message: "Strict mode deadline cannot be in the past.",
        });

        return;
      }
    }

    if (!title?.trim()) {
      res.status(400).json({
        success: false,
        message: "Exam name is required.",
      });

      return;
    }

    if (!questionSetIds.length) {
      res.status(400).json({
        success: false,
        message: "Select at least one question set.",
      });

      return;
    }

    const questionSets = await QuestionSet.find({
      _id: {
        $in: questionSetIds,
      },

      department: instructor.department,

      isActive: true,
    });

    if (questionSets.length !== questionSetIds.length) {
      res.status(400).json({
        success: false,
        message: "Invalid question-set selection.",
      });

      return;
    }

    const allQuestions = questionSets.flatMap((set) =>
      set.questions.map((question) => ({
        questionSetId: set._id,

        questionId: question._id,
      })),
    );

    if (
      !Number.isInteger(questionCount) ||
      questionCount! < 1 ||
      questionCount! > allQuestions.length
    ) {
      res.status(400).json({
        success: false,
        message: `Question count must be between 1 and ${allQuestions.length}.`,
      });

      return;
    }

    if (mode === "SPECIAL" && !studentIds.length) {
      res.status(400).json({
        success: false,
        message: "Select at least one student.",
      });

      return;
    }

    if (mode === "SPECIAL" && !validateObjectIds(studentIds)) {
      res.status(400).json({
        success: false,
        message: "Invalid student selection.",
      });

      return;
    }

    let selectedStudents: Array<{
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
      department: string;
    }> = [];

    if (mode === "SPECIAL") {
      const instructorDepartment = normalizeDepartment(instructor.department);

      const permittedStudents = await User.find({
        _id: {
          $in: studentIds,
        },

        role: "STUDENT",

        isPermitted: true,
      }).select("_id name email department");

      selectedStudents = permittedStudents
        .filter(
          (student) =>
            normalizeDepartment(student.department) === instructorDepartment,
        )
        .map((student) => ({
          _id: student._id,

          name: student.name,

          email: student.email,

          department: student.department ?? "",
        }));

      if (selectedStudents.length !== studentIds.length) {
        res.status(400).json({
          success: false,
          message:
            "All selected students must belong to your department and be permitted.",
        });

        return;
      }
    }

    const selectedQuestions = shuffle(allQuestions).slice(0, questionCount);

    existing.title = title.trim();

    existing.description = description?.trim() ?? "";

    existing.questionSetIds = questionSetIds;

    existing.questionIds = selectedQuestions.map(
      (question) => question.questionId,
    );

    existing.durationMinutes = durationMinutes!;

    existing.questionCount = questionCount!;

    existing.marksPerQuestion = marksPerQuestion!;

    existing.negativeMarking = {
      enabled: Boolean(negativeMarking?.enabled),

      penalty: negativeMarking?.enabled
        ? Number(negativeMarking.penalty ?? 0)
        : 0,
    };

    existing.mode = mode;

    existing.maxAttempts = maxAttempts!;

    existing.startDate = parsedStartDate;

    existing.deadlineDate = parsedDeadlineDate;

    if (parsedDeadlineDate && parsedDeadlineDate <= new Date()) {
      existing.status = "EXPIRED";
    } else if (parsedStartDate && parsedStartDate > new Date()) {
      existing.status = "UNPUBLISHED";
    }

    await existing.save();

    await SpecialExamStudent.deleteMany({
      examId: existing._id,
    });

    if (mode === "SPECIAL") {
      await SpecialExamStudent.insertMany(
        selectedStudents.map((student) => ({
          examId: existing._id,

          studentId: student._id,

          studentEmail: student.email,

          studentName: student.name,

          department: student.department,

          assignedBy: req.user!.userId,
        })),
      );
    }

    let strictExam = null;

    if (strictMode && parsedStrictDeadline) {
      strictExam = await StrictExam.findOneAndUpdate(
        {
          examId: existing._id,

          instructorId: req.user!.userId,
        },
        {
          examId: existing._id,

          questionSetIds,

          attemptChances: strictAttemptChances!,

          deadlineDate: parsedStrictDeadline,

          instructorId: req.user!.userId,

          durationMinutes: durationMinutes!,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );
    } else {
      await StrictExam.deleteMany({
        examId: existing._id,

        instructorId: req.user!.userId,
      });
    }

    res.status(200).json({
      success: true,
      message: "Exam updated successfully.",
      exam: existing,
      strictExam,
    });
  } catch (error) {
    console.error("Update exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update exam.",
    });
  }
};

/* =========================================================
   DELETE EXAM
========================================================= */

export const deleteExam = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "INSTRUCTOR") {
      res.status(403).json({
        success: false,
        message: "Only instructors can delete exams.",
      });

      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const exam = await Exam.findOneAndDelete({
      _id: id,

      instructorId: req.user.userId,
    });

    if (!exam) {
      res.status(404).json({
        success: false,
        message: "Exam not found.",
      });

      return;
    }

    await SpecialExamStudent.deleteMany({
      examId: exam._id,
    });

    await StrictExam.deleteMany({
      examId: exam._id,

      instructorId: req.user!.userId,
    });

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    console.error("Delete exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete exam.",
    });
  }
};

/* =========================================================
   PUBLISH
========================================================= */

export const publishExam = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,

      instructorId: req.user?.userId,
    });

    if (!exam) {
      res.status(404).json({
        success: false,
        message: "Exam not found.",
      });

      return;
    }

    const now = new Date();

    if (exam.deadlineDate && exam.deadlineDate <= now) {
      res.status(400).json({
        success: false,
        message:
          "This exam deadline has already passed. Edit the deadline before publishing it again.",
      });

      return;
    }

    if (exam.startDate && exam.startDate > now) {
      exam.status = "UNPUBLISHED";
    } else {
      if (!exam.startDate) {
        exam.startDate = now;
      }

      exam.status = "PUBLISHED";
    }

    await exam.save();

    res.status(200).json({
      success: true,

      message:
        exam.status === "PUBLISHED"
          ? "Exam published successfully."
          : "Exam scheduled successfully. It will publish automatically at the configured start date and time.",

      exam,
    });
  } catch (error) {
    console.error("Publish exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to publish exam.",
    });
  }
};

/* =========================================================
   UNPUBLISH
========================================================= */

export const unpublishExam = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,

      instructorId: req.user?.userId,
    });

    if (!exam) {
      res.status(404).json({
        success: false,
        message: "Exam not found.",
      });

      return;
    }

    exam.status = "UNPUBLISHED";

    exam.startDate = null;

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Exam unpublished successfully.",
      exam,
    });
  } catch (error) {
    console.error("Unpublish exam error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to unpublish exam.",
    });
  }
};
