import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import Attempt from "../models/Attempt";
import Exam from "../models/Exam";
import SpecialExamStudent from "../models/SpecialExamStudent";
import User from "../models/User";

interface AttemptQuestionResponse {
  questionId: string;
  question: string;
  options: string[];
  questionType: "SINGLE" | "MULTI";
  selectedAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  marksAwarded: number;
}

interface StatusStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  examId: string;
  examName: string;
  examMode: "COMMON" | "SPECIAL";
  attemptId?: string;
  attemptNo?: number;
  status:
    | "NOT_ATTEMPTED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "AUTO_SUBMITTED";
  questionCount: number;
  answeredCount: number;
  totalMarks: number;
  securedMarks: number;
  percentage: number;
  startTime?: Date;
  submittedAt?: Date | null;
  timeTakenSeconds: number;
}

const getInstructor = async (
  req: Request
) => {
  if (!req.user) {
    return null;
  }

  if (req.user.role !== "INSTRUCTOR") {
    return null;
  }

  return User.findById(req.user.userId);
};

/* =========================================================
   GET INSTRUCTOR EXAMINATION STATUS
========================================================= */

export const getInstructorExaminationStatus =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const instructor =
        await getInstructor(req);

      if (!instructor) {
        res.status(403).json({
          success: false,
          message:
            "Instructor access required.",
        });

        return;
      }

      const department =
        instructor.department;

      if (!department) {
        res.status(400).json({
          success: false,
          message:
            "Instructor department is not configured.",
        });

        return;
      }

      /* =====================================================
         EXAMS BELONGING TO THIS INSTRUCTOR
      ===================================================== */

      const exams = await Exam.find({
        instructorId: instructor._id.toString(),
        status: {
          $in: [
            "PUBLISHED",
            "CLOSED",
          ],
        },
      }).lean();

      /* =====================================================
         ACTIVE PERMITTED STUDENTS
      ===================================================== */

      const students = await User.find({
        role: "STUDENT",
        department,
        isActive: true,
        isPermitted: true,
      })
        .select(
          "_id name email department"
        )
        .lean();

      /* =====================================================
         SPECIAL EXAM ASSIGNMENTS
      ===================================================== */

      const specialAssignments =
        await SpecialExamStudent.find({
          examId: {
            $in: exams.map(
              (exam) => exam._id
            ),
          },
        }).lean();

      /* =====================================================
         ATTEMPTS
      ===================================================== */

      const attempts =
        await Attempt.find({
          examId: {
            $in: exams.map(
              (exam) => exam._id
            ),
          },
        })
          .sort({
            startTime: -1,
          })
          .lean();

      /* =====================================================
         LATEST ATTEMPT PER STUDENT + EXAM
      ===================================================== */

      const latestAttemptMap =
        new Map<
          string,
          typeof attempts[number]
        >();

      for (const attempt of attempts) {
        const key =
          `${attempt.examId.toString()}_${attempt.studentId.toString()}`;

        if (
          !latestAttemptMap.has(key)
        ) {
          latestAttemptMap.set(
            key,
            attempt
          );
        }
      }

      /* =====================================================
         SPECIAL ASSIGNMENT LOOKUP
      ===================================================== */

      const specialAssignmentMap =
        new Map<string, boolean>();

      for (const assignment of specialAssignments) {
        const key =
          `${assignment.examId.toString()}_${assignment.studentId.toString()}`;

        specialAssignmentMap.set(
          key,
          true
        );
      }

      /* =====================================================
         RESULT ARRAYS
      ===================================================== */

      const incomplete: StatusStudent[] =
        [];

      const privateResults: StatusStudent[] =
        [];

      const commonResults: StatusStudent[] =
        [];

      /* =====================================================
         BUILD STATUS
      ===================================================== */

      for (const exam of exams) {
        const examId =
          exam._id.toString();

        const examMode =
          exam.mode;

        const eligibleStudents =
          examMode === "SPECIAL"
            ? students.filter((student) =>
                specialAssignmentMap.has(
                  `${examId}_${student._id.toString()}`
                )
              )
            : students;

        for (const student of eligibleStudents) {
          const studentId =
            student._id.toString();

          const key =
            `${examId}_${studentId}`;

          const latestAttempt =
            latestAttemptMap.get(key);

          const questionCount =
            latestAttempt?.questions
              ?.length ?? 0;

          const answeredCount =
            latestAttempt?.questions
              ?.filter(
                (question) =>
                  question.selectedAnswers &&
                  question.selectedAnswers.length >
                    0
              ).length ?? 0;

          const totalMarks =
            latestAttempt?.totalMarks ??
            exam.questionCount *
              exam.marksPerQuestion;

          const securedMarks =
            latestAttempt?.score ?? 0;

          const percentage =
            totalMarks > 0
              ? Math.max(
                  0,
                  Math.min(
                    100,
                    (securedMarks /
                      totalMarks) *
                      100
                  )
                )
              : 0;

          const status =
            latestAttempt
              ? latestAttempt.status
              : "NOT_ATTEMPTED";

          const studentStatus: StatusStudent =
            {
              studentId,
              studentName:
                student.name,
              studentEmail:
                student.email,
              department:
                student.department ??
                department,

              examId,
              examName:
                exam.title,

              examMode,

              attemptId:
                latestAttempt?._id?.toString(),

              attemptNo:
                latestAttempt?.attemptNo,

              status,

              questionCount,

              answeredCount,

              totalMarks,

              securedMarks,

              percentage:

                Number(
                  percentage.toFixed(2)
                ),

              startTime:
                latestAttempt?.startTime,

              submittedAt:
                latestAttempt?.submittedAt,

              timeTakenSeconds:
                latestAttempt
                  ?.timeTakenSeconds ??
                0,
            };

          /* =================================================
             INCOMPLETE
          ================================================= */

          if (
            !latestAttempt ||
            latestAttempt.status ===
              "IN_PROGRESS"
          ) {
            incomplete.push(
              studentStatus
            );

            continue;
          }

          /* =================================================
             COMPLETED SPECIAL
          ================================================= */

          if (
            examMode === "SPECIAL"
          ) {
            privateResults.push(
              studentStatus
            );

            continue;
          }

          /* =================================================
             COMPLETED COMMON
          ================================================= */

          commonResults.push(
            studentStatus
          );
        }
      }

      res.status(200).json({
        success: true,

        data: {
          incomplete,
          privateResults,
          commonResults,
        },
      });
    } catch (error) {
      console.error(
        "Examination status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load examination status.",
      });
    }
  };

/* =========================================================
   GET SINGLE ATTEMPT DETAILS
========================================================= */

export const getAttemptDetails =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const instructor =
        await getInstructor(req);

      if (!instructor) {
        res.status(403).json({
          success: false,
          message:
            "Instructor access required.",
        });

        return;
      }

      const id = Array.isArray(
        req.params.id
      )
        ? req.params.id[0]
        : req.params.id;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid attempt ID.",
        });

        return;
      }

      const attempt =
        await Attempt.findById(id).lean();

      if (!attempt) {
        res.status(404).json({
          success: false,
          message:
            "Attempt not found.",
        });

        return;
      }

      const exam =
        await Exam.findOne({
          _id: attempt.examId,
          instructorId:
            instructor._id.toString(),
        }).lean();

      if (!exam) {
        res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this attempt.",
        });

        return;
      }

      const student =
        await User.findById(
          attempt.studentId
        )
          .select(
            "_id name email department"
          )
          .lean();

      const totalMarks =
        attempt.totalMarks;

      const securedMarks =
        attempt.score;

      const percentage =
        totalMarks > 0
          ? Math.max(
              0,
              Math.min(
                100,
                (securedMarks /
                  totalMarks) *
                  100
              )
            )
          : 0;

      const questions: AttemptQuestionResponse[] =
        attempt.questions.map(
          (question) => ({
            questionId:
              question.questionId,

            question:
              question.question,

            options:
              question.options,

            questionType:
              question.questionType,

            selectedAnswers:
              question.selectedAnswers ??
              [],

            correctAnswers:
              question.correctAnswers ??
              [],

            isCorrect:
              question.isCorrect,

            marksAwarded:
              question.marksAwarded,
          })
        );

      const answeredCount =
        questions.filter(
          (question) =>
            question.selectedAnswers
              .length > 0
        ).length;

      const unanswered =
        questions.filter(
          (question) =>
            question.selectedAnswers
              .length === 0
        ).length;

      const wrongAnswers =
        questions.filter(
          (question) =>
            question.selectedAnswers
              .length > 0 &&
            !question.isCorrect
        ).length;

      res.status(200).json({
        success: true,

        data: {
          attemptId:
            attempt._id.toString(),

          student: {
            id:
              student?._id?.toString() ??
              attempt.studentId.toString(),

            name:
              student?.name ??
              "Unknown Student",

            email:
              student?.email ??
              attempt.studentEmail,

            department:
              student?.department ??
              attempt.studentDepartment,
          },

          exam: {
            id:
              exam._id.toString(),

            name:
              exam.title,

            mode:
              exam.mode,

            department:
              exam.department,

            durationMinutes:
              exam.durationMinutes,

            questionCount:
              questions.length,

            marksPerQuestion:
              exam.marksPerQuestion,

            negativeMarking:
              exam.negativeMarking,
          },

          attempt: {
            attemptNo:
              attempt.attemptNo,

            startTime:
              attempt.startTime,

            submittedAt:
              attempt.submittedAt,

            status:
              attempt.status,

            timeTakenSeconds:
              attempt.timeTakenSeconds,

            totalMarks,

            securedMarks,

            percentage:
              Number(
                percentage.toFixed(2)
              ),

            answeredCount,

            correctAnswers:
              attempt.correctAnswers,

            wrongAnswers,

            unanswered,
          },

          questions,
        },
      });
    } catch (error) {
      console.error(
        "Attempt details error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load attempt details.",
      });
    }
  };