import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import User from "../models/User";
import Attempt from "../models/Attempt";

const requireInstructor = (
  req: Request,
  res: Response
): boolean => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return false;
  }

  if (req.user.role !== "INSTRUCTOR") {
    res.status(403).json({
      success: false,
      message:
        "Only instructors can manage student accounts.",
    });

    return false;
  }

  return true;
};

const getInstructor = async (
  req: Request,
  res: Response
) => {
  const instructor = await User.findById(
    req.user!.userId
  ).select("_id role department");

  if (!instructor) {
    res.status(404).json({
      success: false,
      message: "Instructor account not found.",
    });

    return null;
  }

  if (!instructor.department) {
    res.status(400).json({
      success: false,
      message:
        "Instructor department is not configured.",
    });

    return null;
  }

  return instructor;
};

/**
 * GET /
 * Pending students from the instructor's department.
 */
export const getPendingStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) return;

    const instructor = await getInstructor(req, res);
    if (!instructor) return;

    const students = await User.find({
      role: "STUDENT",
      isPermitted: false,
      department: instructor.department,
    })
      .select(
        "_id name email role department isActive isPermitted"
      )
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error(
      "Get pending students error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to retrieve pending student requests.",
    });
  }
};

/**
 * GET /students
 * All students belonging to the instructor's department,
 * with overall performance calculated from completed attempts.
 */
export const getDepartmentStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) return;

    const instructor = await getInstructor(req, res);
    if (!instructor) return;

    const students = await User.find({
      role: "STUDENT",
      department: instructor.department,
    })
      .select(
        "_id name email role department isActive isPermitted"
      )
      .sort({ name: 1 })
      .lean();

    const studentIds = students.map(
      (student) => student._id
    );

    const attempts =
      studentIds.length > 0
        ? await Attempt.find({
            studentId: {
              $in: studentIds,
            },
            status: {
              $in: [
                "SUBMITTED",
                "AUTO_SUBMITTED",
              ],
            },
          })
            .select(
              "_id studentId examId examName mode score totalMarks status attemptNo submittedAt startTime"
            )
            .sort({
              submittedAt: -1,
              startTime: -1,
            })
            .lean()
        : [];

    /**
     * Keep the latest completed attempt for each
     * student + exam. This prevents multiple attempts
     * for the same exam from inflating overall results.
     */
    const latestAttemptByStudentExam =
      new Map<string, (typeof attempts)[number]>();

    for (const attempt of attempts) {
      const key = `${attempt.studentId.toString()}-${attempt.examId.toString()}`;

      if (!latestAttemptByStudentExam.has(key)) {
        latestAttemptByStudentExam.set(
          key,
          attempt
        );
      }
    }

    const performanceByStudent =
      new Map<
        string,
        {
          attendedExams: number;
          totalScore: number;
          totalMarks: number;
          averagePercentage: number;
        }
      >();

    for (const student of students) {
      performanceByStudent.set(
        student._id.toString(),
        {
          attendedExams: 0,
          totalScore: 0,
          totalMarks: 0,
          averagePercentage: 0,
        }
      );
    }

    for (const attempt of latestAttemptByStudentExam.values()) {
      const studentKey =
        attempt.studentId.toString();

      const performance =
        performanceByStudent.get(
          studentKey
        );

      if (!performance) continue;

      performance.attendedExams += 1;
      performance.totalScore +=
        Number(attempt.score) || 0;
      performance.totalMarks +=
        Number(attempt.totalMarks) || 0;
    }

    const formattedStudents =
      students.map((student) => {
        const performance =
          performanceByStudent.get(
            student._id.toString()
          ) ?? {
            attendedExams: 0,
            totalScore: 0,
            totalMarks: 0,
            averagePercentage: 0,
          };

        performance.averagePercentage =
          performance.totalMarks > 0
            ? Math.round(
                (performance.totalScore /
                  performance.totalMarks) *
                  100
              )
            : 0;

        return {
          _id: student._id.toString(),
          name: student.name,
          email: student.email,
          role: student.role,
          department: student.department,
          isActive: student.isActive,
          isPermitted:
            student.isPermitted ?? false,
          attendedExams:
            performance.attendedExams,
          totalScore:
            performance.totalScore,
          totalMarks:
            performance.totalMarks,
          averagePercentage:
            performance.averagePercentage,
        };
      });

    res.status(200).json({
      success: true,
      department: instructor.department,
      students: formattedStudents,
    });
  } catch (error) {
    console.error(
      "Get department students error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to retrieve department students.",
    });
  }
};

/**
 * GET /students/:id/performance
 * Detailed completed examination history for one student.
 */
export const getStudentPerformance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) return;

    const instructor = await getInstructor(req, res);
    if (!instructor) return;

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });

      return;
    }

    const student = await User.findOne({
      _id: id,
      role: "STUDENT",
      department: instructor.department,
    })
      .select(
        "_id name email role department isActive isPermitted"
      )
      .lean();

    if (!student) {
      res.status(404).json({
        success: false,
        message:
          "Student was not found in your department.",
      });

      return;
    }

    const attempts = await Attempt.find({
      studentId: student._id,
      status: {
        $in: [
          "SUBMITTED",
          "AUTO_SUBMITTED",
        ],
      },
    })
      .select(
        "_id studentId examId examName examDepartment instructorId mode attemptNo startTime submittedAt status score totalMarks correctAnswers wrongAnswers unanswered timeTakenSeconds"
      )
      .sort({
        submittedAt: -1,
        startTime: -1,
      })
      .lean();

    /**
     * Show the latest completed attempt for each exam.
     * If a student has attempted an exam multiple times,
     * the latest completed attempt represents that exam
     * in the overall performance.
     */
    const latestByExam =
      new Map<string, (typeof attempts)[number]>();

    for (const attempt of attempts) {
      const examKey =
        attempt.examId.toString();

      if (!latestByExam.has(examKey)) {
        latestByExam.set(
          examKey,
          attempt
        );
      }
    }

    const exams = Array.from(
      latestByExam.values()
    ).map((attempt) => ({
      _id: attempt._id.toString(),
      examId: attempt.examId.toString(),
      examName: attempt.examName,
      examDepartment:
        attempt.examDepartment,
      mode: attempt.mode,
      attemptNo: attempt.attemptNo,
      startTime: attempt.startTime,
      submittedAt:
        attempt.submittedAt,
      status: attempt.status,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage:
        attempt.totalMarks > 0
          ? Math.round(
              (attempt.score /
                attempt.totalMarks) *
                100
            )
          : 0,
      correctAnswers:
        attempt.correctAnswers,
      wrongAnswers:
        attempt.wrongAnswers,
      unanswered:
        attempt.unanswered,
      timeTakenSeconds:
        attempt.timeTakenSeconds,
    }));

    const overallScore = exams.reduce(
      (total, exam) =>
        total + (Number(exam.score) || 0),
      0
    );

    const overallMarks = exams.reduce(
      (total, exam) =>
        total +
        (Number(exam.totalMarks) || 0),
      0
    );

    const overallPercentage =
      overallMarks > 0
        ? Math.round(
            (overallScore /
              overallMarks) *
              100
          )
        : 0;

    res.status(200).json({
      success: true,
      student: {
        _id: student._id.toString(),
        name: student.name,
        email: student.email,
        role: student.role,
        department: student.department,
        isActive: student.isActive,
        isPermitted:
          student.isPermitted ?? false,
      },
      performance: {
        attendedExams: exams.length,
        overallScore,
        overallMarks,
        overallPercentage,
      },
      exams,
    });
  } catch (error) {
    console.error(
      "Get student performance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to retrieve student performance.",
    });
  }
};

/**
 * PATCH /:id/accept
 */
export const acceptStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) return;

    const instructor = await getInstructor(req, res);
    if (!instructor) return;

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });

      return;
    }

    const student =
      await User.findOneAndUpdate(
        {
          _id: id,
          role: "STUDENT",
          isPermitted: false,
          department:
            instructor.department,
        },
        {
          $set: {
            isPermitted: true,
          },
        },
        {
          new: true,
        }
      ).select(
        "_id name email role department isActive isPermitted"
      );

    if (!student) {
      res.status(404).json({
        success: false,
        message:
          "Pending student request was not found in your department. It may already have been processed.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message:
        "Student account accepted successfully.",
      student,
    });
  } catch (error) {
    console.error(
      "Accept student error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to accept student account.",
    });
  }
};

/**
 * PATCH /:id/deny
 */
export const denyStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) return;

    const instructor = await getInstructor(req, res);
    if (!instructor) return;

    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });

      return;
    }

    const student =
      await User.findOneAndDelete({
        _id: id,
        role: "STUDENT",
        isPermitted: false,
        department:
          instructor.department,
      }).select(
        "_id name email role department isActive isPermitted"
      );

    if (!student) {
      res.status(404).json({
        success: false,
        message:
          "Pending student request was not found in your department. It may already have been processed.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message:
        "Student request denied and account deleted successfully.",
      student,
    });
  } catch (error) {
    console.error(
      "Deny student error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to deny student request.",
    });
  }
};
