import type {
  Request,
  Response,
} from "express";

import User from "../models/User";
import Exam from "../models/Exam";
import QuestionSet from "../models/Question";
import Attempt from "../models/Attempt";

export const getInstructorDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    /* =====================================================
       AUTHENTICATION
    ===================================================== */

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
          "Only instructors can access the instructor dashboard.",
      });

      return;
    }

    /* =====================================================
       GET INSTRUCTOR
    ===================================================== */

    const instructor = await User.findById(
      req.user.userId
    )
      .select(
        "_id name email role department isActive"
      )
      .lean();

    if (!instructor) {
      res.status(404).json({
        success: false,
        message: "Instructor account not found.",
      });

      return;
    }

    if (!instructor.department) {
      res.status(400).json({
        success: false,
        message:
          "Instructor department is not configured.",
      });

      return;
    }

    const instructorId =
      instructor._id.toString();

    const department =
      instructor.department;

    /* =====================================================
       EXAMS CREATED BY THIS INSTRUCTOR
    ===================================================== */

    const exams = await Exam.find({
      instructorId,
    })
      .sort({
        _id: -1,
      })
      .lean();

    /* =====================================================
       QUESTION SETS CREATED BY THIS INSTRUCTOR
    ===================================================== */

    const questionSets =
      await QuestionSet.find({
        createdBy: instructorId,
      })
        .sort({
          _id: -1,
        })
        .lean();

    /* =====================================================
       STUDENTS FROM INSTRUCTOR DEPARTMENT
    ===================================================== */

    const students = await User.find({
      role: "STUDENT",
      department,
    })
      .select(
        "_id name email role department isActive isPermitted"
      )
      .sort({
        name: 1,
      })
      .lean();

    /* =====================================================
       PENDING STUDENT REQUESTS
    ===================================================== */

    const pendingStudents =
      students.filter(
        (student) =>
          student.isPermitted === false
      );

    /* =====================================================
       ATTEMPTS FOR THIS INSTRUCTOR'S EXAMS
    ===================================================== */

    const examIds = exams.map(
      (exam) => exam._id
    );

    const attempts =
      examIds.length > 0
        ? await Attempt.find({
            examId: {
              $in: examIds,
            },
          })
            .sort({
              startTime: -1,
            })
            .lean()
        : [];

    /* =====================================================
       EXAM STATISTICS
    ===================================================== */

    const totalExams =
      exams.length;

    const publishedExams =
      exams.filter(
        (exam) =>
          exam.status === "PUBLISHED"
      ).length;

    const unpublishedExams =
      exams.filter(
        (exam) =>
          exam.status === "UNPUBLISHED"
      ).length;

    const closedExams =
      exams.filter(
        (exam) =>
          exam.status === "CLOSED"
      ).length;

    const commonExams =
      exams.filter(
        (exam) =>
          exam.mode === "COMMON"
      ).length;

    const specialExams =
      exams.filter(
        (exam) =>
          exam.mode === "SPECIAL"
      ).length;

    /* =====================================================
       QUESTION STATISTICS
    ===================================================== */

    const totalQuestionSets =
      questionSets.length;

    const totalQuestions =
      questionSets.reduce(
        (total, questionSet) =>
          total +
          questionSet.questions.length,
        0
      );

    /* =====================================================
       STUDENT STATISTICS
    ===================================================== */

    const totalStudents =
      students.length;

    const permittedStudents =
      students.filter(
        (student) =>
          student.isPermitted === true
      ).length;

    const pendingStudentCount =
      pendingStudents.length;

    /* =====================================================
       ATTEMPT STATISTICS
    ===================================================== */

    const totalAttempts =
      attempts.length;

    const submittedAttempts =
      attempts.filter(
        (attempt) =>
          attempt.status ===
            "SUBMITTED" ||
          attempt.status ===
            "AUTO_SUBMITTED"
      );

    const inProgressAttempts =
      attempts.filter(
        (attempt) =>
          attempt.status ===
          "IN_PROGRESS"
      );

    /* =====================================================
       AVERAGE SCORE
    ===================================================== */

    let averageScore = 0;

    if (
      submittedAttempts.length > 0
    ) {
      let percentageTotal = 0;
      let validAttempts = 0;

      for (const attempt of submittedAttempts) {
        if (
          attempt.totalMarks > 0
        ) {
          percentageTotal +=
            (attempt.score /
              attempt.totalMarks) *
            100;

          validAttempts += 1;
        }
      }

      if (validAttempts > 0) {
        averageScore = Math.round(
          percentageTotal /
            validAttempts
        );
      }
    }

    /* =====================================================
       ATTEMPT STUDENT DETAILS
    ===================================================== */

    const studentIds =
      Array.from(
        new Set(
          attempts.map(
            (attempt) =>
              attempt.studentId.toString()
          )
        )
      );

    const attemptStudents =
      studentIds.length > 0
        ? await User.find({
            _id: {
              $in: studentIds,
            },
          })
            .select(
              "_id name email department"
            )
            .lean()
        : [];

    const studentMap =
      new Map(
        attemptStudents.map(
          (student) => [
            student._id.toString(),
            student,
          ]
        )
      );

    /* =====================================================
       RECENT ATTEMPTS
    ===================================================== */

    const recentAttempts =
      attempts.slice(0, 10);

    const formattedRecentAttempts =
      recentAttempts.map(
        (attempt) => {
          const student =
            studentMap.get(
              attempt.studentId.toString()
            );

          return {
            _id:
              attempt._id.toString(),

            studentId:
              attempt.studentId.toString(),

            studentName:
              student?.name ??
              "Unknown Student",

            studentEmail:
              attempt.studentEmail,

            studentDepartment:
              attempt.studentDepartment,

            examId:
              attempt.examId.toString(),

            examName:
              attempt.examName,

            examDepartment:
              attempt.examDepartment,

            instructorId:
              attempt.instructorId,

            mode:
              attempt.mode,

            attemptNo:
              attempt.attemptNo,

            startTime:
              attempt.startTime,

            submittedAt:
              attempt.submittedAt,

            status:
              attempt.status,

            score:
              attempt.score,

            totalMarks:
              attempt.totalMarks,

            correctAnswers:
              attempt.correctAnswers,

            wrongAnswers:
              attempt.wrongAnswers,

            unanswered:
              attempt.unanswered,

            timeTakenSeconds:
              attempt.timeTakenSeconds,
          };
        }
      );

    /* =====================================================
       RESPONSE
    ===================================================== */

    res.status(200).json({
      success: true,

      instructor: {
        _id:
          instructor._id.toString(),

        name:
          instructor.name,

        email:
          instructor.email,

        role:
          instructor.role,

        department:
          instructor.department,

        isActive:
          instructor.isActive,
      },

      statistics: {
        totalExams,

        publishedExams,

        unpublishedExams,

        closedExams,

        commonExams,

        specialExams,

        totalQuestionSets,

        totalQuestions,

        totalStudents,

        permittedStudents,

        pendingStudentCount,

        totalAttempts,

        submittedAttempts:
          submittedAttempts.length,

        inProgressAttempts:
          inProgressAttempts.length,

        averageScore,
      },

      exams,

      questionSets,

      students,

      pendingStudents,

      recentAttempts:
        formattedRecentAttempts,
    });
  } catch (error) {
    console.error(
      "Instructor dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load instructor dashboard.",
    });
  }
};