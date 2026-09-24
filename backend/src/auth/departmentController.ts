import { Request, Response } from "express";
import User from "../models/User";

/**
 * GET /api/auth/departments
 *
 * Returns departments in which instructors exist.
 *
 * Used by:
 * - Student registration
 * - Instructor registration
 */
export const getDepartments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const departments = await User.distinct("department", {
      role: "INSTRUCTOR",
      department: {
        $exists: true,
        $ne: null,
      },
    });

    const cleanedDepartments = departments
      .filter(
        (department): department is string =>
          typeof department === "string" &&
          department.trim().length > 0
      )
      .map((department) => department.trim())
      .filter(
        (department, index, array) =>
          array.findIndex(
            (item) =>
              item.toLowerCase() === department.toLowerCase()
          ) === index
      )
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      departments: cleanedDepartments,
    });
  } catch (error) {
    console.error(
      "Get departments error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load departments.",
    });
  }
};