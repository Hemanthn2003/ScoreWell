import { Router } from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleware";
import { approveInstructor, dismissInstructor, getAdminDepartments, suspendInstructor } from "../auth/adminController";

const router = Router();
router.use(authenticate, authorizeRoles("ADMIN"));
router.get("/departments", getAdminDepartments);
router.patch("/instructors/:id/approve", approveInstructor);
router.patch("/instructors/:id/suspend", suspendInstructor);
router.delete("/instructors/:id", dismissInstructor);
export default router;
