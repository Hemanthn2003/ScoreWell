import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";

const cleanDepartment = (value: unknown): string => typeof value === "string" ? value.trim() : "";

/** GET /api/admin/departments: aggregate student strength and instructor approval state. */
export const getAdminDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({ role: { $in: ["STUDENT", "INSTRUCTOR"] }, department: { $type: "string" } })
      .select("name email role department isPermitted isActive")
      .lean();

    const grouped = new Map<string, {
      name: string; studentCount: number; instructorCount: number; approvedInstructorCount: number;
      requestedInstructorCount: number; students: Array<Record<string, unknown>>;
      instructors: Array<Record<string, unknown>>; requestedInstructors: Array<Record<string, unknown>>;
    }>();

    for (const user of users) {
      const department = cleanDepartment(user.department);
      if (!department) continue;
      const key = department.toLocaleLowerCase();
      if (!grouped.has(key)) grouped.set(key, {
        name: department, studentCount: 0, instructorCount: 0, approvedInstructorCount: 0,
        requestedInstructorCount: 0, students: [], instructors: [], requestedInstructors: [],
      });
      const entry = grouped.get(key)!;
      const safeUser = { _id: String(user._id), name: user.name, email: user.email, department: user.department, isActive: user.isActive, isPermitted: user.isPermitted };
      if (user.role === "STUDENT") {
        entry.studentCount += 1;
        entry.students.push(safeUser);
      } else {
        entry.instructorCount += 1;
        if (user.isPermitted === true) {
          entry.approvedInstructorCount += 1;
          entry.instructors.push(safeUser);
        } else {
          entry.requestedInstructorCount += 1;
          entry.requestedInstructors.push(safeUser);
        }
      }
    }

    const departments = [...grouped.values()]
      .filter((department) => department.studentCount > 0 || department.instructorCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error("Admin department overview error:", error);
    res.status(500).json({ success: false, message: "Unable to load department overview." });
  }
};

const findInstructor = async (id: string) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return User.findOne({ _id: id, role: "INSTRUCTOR" });
};

export const approveInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructor = await findInstructor(req.params.id);
    if (!instructor) {
      res.status(404).json({ success: false, message: "Instructor request not found." });
      return;
    }
    instructor.isPermitted = true;
    instructor.isActive = false;
    await instructor.save();
    res.status(200).json({ success: true, message: "Instructor approved successfully." });
  } catch (error) {
    console.error("Approve instructor error:", error);
    res.status(500).json({ success: false, message: "Unable to approve instructor." });
  }
};

export const suspendInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructor = await findInstructor(req.params.id);
    if (!instructor) {
      res.status(404).json({ success: false, message: "Instructor not found." });
      return;
    }
    instructor.isPermitted = false;
    instructor.isActive = false;
    await instructor.save();
    res.status(200).json({ success: true, message: "Instructor suspended. Login permission has been revoked." });
  } catch (error) {
    console.error("Suspend instructor error:", error);
    res.status(500).json({ success: false, message: "Unable to suspend instructor." });
  }
};

export const dismissInstructor = async (req: Request, res: Response): Promise<void> => {
  try {
    const instructor = await findInstructor(req.params.id);
    if (!instructor) {
      res.status(404).json({ success: false, message: "Instructor not found." });
      return;
    }
    await User.deleteOne({ _id: instructor._id, role: "INSTRUCTOR" });
    res.status(200).json({ success: true, message: "Instructor dismissed and account data deleted." });
  } catch (error) {
    console.error("Dismiss instructor error:", error);
    res.status(500).json({ success: false, message: "Unable to dismiss instructor." });
  }
};
