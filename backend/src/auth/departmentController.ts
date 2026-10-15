import type { Request, Response } from "express";
import User from "../models/User";

/** GET /api/auth/departments: departments that have at least one approved instructor. */
export const getDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const departments = await User.distinct("department", {
      role: "INSTRUCTOR",
      isPermitted: true,
      department: { $exists: true, $ne: null },
    });
    const cleaned = departments
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim())
      .filter((value, index, values) => values.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
      .sort((a, b) => a.localeCompare(b));
    res.status(200).json({ success: true, departments: cleaned });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ success: false, message: "Failed to load departments." });
  }
};
