import type {
  Request,
  Response,
} from "express";

import mongoose from "mongoose";

import User from "../models/User";

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
        "Only instructors can manage student requests.",
    });

    return false;
  }

  return true;
};

/**
 * Get pending student requests.
 *
 * Conditions:
 * - Student role
 * - isPermitted must be false
 * - Student department must match logged-in instructor department
 */
export const getPendingStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) {
      return;
    }

    const instructor = await User.findById(
      req.user!.userId
    ).select(
      "_id role department"
    );

    if (!instructor) {
      res.status(404).json({
        success: false,
        message: "Instructor account not found.",
      });

      return;
    }

    if (instructor.role !== "INSTRUCTOR") {
      res.status(403).json({
        success: false,
        message:
          "Only instructors can view student requests.",
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

    const students = await User.find({
      role: "STUDENT",
      isPermitted: false,
      department: instructor.department,
    })
      .select(
        "_id name email role department isActive isPermitted"
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
 * Accept a pending student.
 *
 * The student must:
 * - be a STUDENT
 * - currently have isPermitted=false
 * - belong to the logged-in instructor's department
 */
export const acceptStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) {
      return;
    }

    const instructor = await User.findById(
      req.user!.userId
    ).select(
      "_id role department"
    );

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
          department: instructor.department,
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
 * Deny a pending student.
 *
 * The student must:
 * - be a STUDENT
 * - currently have isPermitted=false
 * - belong to the logged-in instructor's department
 */
export const denyStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!requireInstructor(req, res)) {
      return;
    }

    const instructor = await User.findById(
      req.user!.userId
    ).select(
      "_id role department"
    );

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
        department: instructor.department,
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