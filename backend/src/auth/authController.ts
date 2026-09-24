import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/User";
import PasswordReset from "../models/PasswordReset";
import {
  sendPasswordResetOtp,
} from "./passwordResetMailer";
import {
  clearAuthCookies,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  verifyRefreshToken,
} from "./authUtils";


/* =========================================================
   LOGIN
========================================================= */

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      email,
      password,
      rememberMe = false,
    } = req.body;


    /* =========================
       VALIDATION
    ========================== */

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });

      return;
    }


    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();


    /* =========================
       FIND USER
    ========================== */

    const user =
      await User.findOne({
        email: normalizedEmail,
      });


    if (!user) {
      res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });

      return;
    }


    /* =========================
       ROLE VALIDATION
    ========================== */

    if (
      user.role !== "STUDENT" &&
      user.role !== "INSTRUCTOR"
    ) {
      res.status(403).json({
        success: false,
        message:
          "Invalid account role.",
      });

      return;
    }


    /* =========================
       PASSWORD
       
       Password must be verified
       BEFORE checking student
       permission.
    ========================== */

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });

      return;
    }


    /* =====================================================
       STUDENT PERMISSION

       Only STUDENTS are checked.

       isPermitted === true
          → continue login

       isPermitted === false
          → reject login
          → no tokens
          → isActive remains false
    ====================================================== */

    if (
      user.role === "STUDENT" &&
      user.isPermitted !== true
    ) {
      res.status(403).json({
        success: false,
        message:
          "Login failed. Your profile is not permitted by Instructor, please contact Instructor.",
      });

      return;
    }


    /* =====================================================
       INSTRUCTOR

       No isPermitted check.

       An instructor can login regardless
       of the isPermitted field.
    ====================================================== */


    /* =========================
       ACTIVATE USER
    ========================== */

    user.isActive = true;

    await user.save();


    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };


    const accessToken =
      generateAccessToken(
        tokenPayload
      );


    const refreshToken =
      generateRefreshToken(
        tokenPayload,
        Boolean(rememberMe)
      );


    /* =========================
       COOKIES
    ========================== */

    setAuthCookies(
      res,
      accessToken,
      refreshToken,
      Boolean(rememberMe)
    );


    /* =========================
       RESPONSE
    ========================== */

    res.status(200).json({
      success: true,

      message:
        "Login successful.",

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        department:
          user.department,

        isActive:
          user.isActive,

        isPermitted:
          user.isPermitted,
      },
    });
  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to login.",
    });
  }
};


/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const refreshToken =
      req.cookies?.scorewell_refresh_token;


    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message:
          "Refresh token not found.",
      });

      return;
    }


    const decoded =
      verifyRefreshToken(
        refreshToken
      );


    const user = await User.findById(
      decoded.userId
    );


    if (!user) {
      clearAuthCookies(res);

      res.status(401).json({
        success: false,
        message:
          "User no longer exists.",
      });

      return;
    }


    if (!user.isActive) {
      clearAuthCookies(res);

      res.status(403).json({
        success: false,
        message:
          "User account is inactive.",
      });

      return;
    }


    if (
      user.role !== "STUDENT" &&
      user.role !== "INSTRUCTOR"
    ) {
      clearAuthCookies(res);

      res.status(403).json({
        success: false,
        message:
          "Invalid user role.",
      });

      return;
    }


    /* =====================================================
       STUDENT PERMISSION CHECK

       If a student was permitted earlier and later
       their permission is revoked, do not allow the
       refresh token to continue the session.
    ====================================================== */

    if (
      user.role === "STUDENT" &&
      user.isPermitted !== true
    ) {
      clearAuthCookies(res);

      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            isActive: false,
          },
        }
      );

      res.status(403).json({
        success: false,
        message:
          "Login failed. Your profile is inactive.",
      });

      return;
    }


    const accessToken =
      generateAccessToken({
        userId:
          user._id.toString(),

        email:
          user.email,

        role:
          user.role,
      });


    res.status(200).json({
      success: true,
      message:
        "Access token refreshed successfully.",
    });

  } catch (error) {

    clearAuthCookies(res);

    res.status(403).json({
      success: false,
      message:
        "Refresh token is invalid or expired.",
    });
  }
};


/* =========================================================
   GET CURRENT USER
========================================================= */

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const userId =
      req.user?.userId;


    if (!userId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });

      return;
    }


    const user =
      await User.findById(
        userId
      ).select("-password");


    if (!user) {
      res.status(404).json({
        success: false,
        message:
          "User not found.",
      });

      return;
    }


    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(
      "Get current user error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to retrieve current user.",
    });
  }
};


/* =========================================================
   LOGOUT
========================================================= */

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const userId =
      req.user?.userId;


    if (userId) {

      await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            isActive: false,
          },
        }
      );
    }


    clearAuthCookies(res);


    res.status(200).json({
      success: true,
      message:
        "Logout successful.",
    });

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    clearAuthCookies(res);


    res.status(500).json({
      success: false,
      message:
        "Server error during logout.",
    });
  }
};


/* =========================================================
   REGISTER
========================================================= */

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      department,
    } = req.body;


    /* =========================
       BASIC VALIDATION
    ========================== */

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !role ||
      !department
    ) {
      res.status(400).json({
        success: false,
        message:
          "Please fill in all required fields.",
      });

      return;
    }


    const normalizedName =
      String(name).trim();


    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();


    const normalizedRole =
      String(role)
        .trim()
        .toUpperCase();


    const normalizedDepartment =
      String(department).trim();


    /* =========================
       ROLE VALIDATION
    ========================== */

    if (
      normalizedRole !== "STUDENT" &&
      normalizedRole !== "INSTRUCTOR"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid account type.",
      });

      return;
    }


    /* =========================
       PASSWORD VALIDATION
    ========================== */

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });

      return;
    }


    if (
      password !==
      confirmPassword
    ) {
      res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });

      return;
    }


    /* =========================
       EMAIL DUPLICATE CHECK
    ========================== */

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });


    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });

      return;
    }


    /* =========================
       DEPARTMENT VALIDATION
    ========================== */

    if (!normalizedDepartment) {
      res.status(400).json({
        success: false,
        message:
          "Department is required.",
      });

      return;
    }


    /*
     * STUDENT
     *
     * Students can only register under
     * a department where an instructor
     * already exists.
     */

    if (
      normalizedRole === "STUDENT"
    ) {

      const instructorExists =
        await User.exists({
          role: "INSTRUCTOR",

          department: {
            $regex:
              new RegExp(
                `^${normalizedDepartment.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}$`,
                "i"
              ),
          },
        });


      if (!instructorExists) {

        res.status(400).json({
          success: false,
          message:
            "The selected department does not currently have an instructor.",
        });

        return;
      }
    }


    /*
     * INSTRUCTOR
     *
     * Instructor may use an existing
     * department or create a new one.
     *
     * No restriction here because an
     * instructor is allowed to introduce
     * a new department.
     */


    /* =========================
       HASH PASSWORD
    ========================== */

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );


    /* =====================================================
       CREATE USER

       STUDENT:
       isActive = false
       isPermitted = false

       INSTRUCTOR:
       isActive = false
       isPermitted is NOT included.
    ====================================================== */

    let createdUser;


    if (
      normalizedRole === "STUDENT"
    ) {

      createdUser =
        await User.create({
          name:
            normalizedName,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          role:
            normalizedRole,

          department:
            normalizedDepartment,

          /*
           * User is not currently logged in.
           */
          isActive: false,

          /*
           * NEW STUDENTS MUST BE
           * PERMITTED BY ADMIN/INSTRUCTOR
           * BEFORE THEY CAN LOGIN.
           */
          isPermitted: false,
        });

    } else {

      createdUser =
        await User.create({
          name:
            normalizedName,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          role:
            normalizedRole,

          department:
            normalizedDepartment,

          /*
           * User is not currently logged in.
           */
          isActive: false,

          /*
           * IMPORTANT:
           *
           * Do NOT include isPermitted
           * for instructors.
           */
        });
    }


    console.log(
      "ScoreWell user registered:",
      {
        id:
          createdUser._id.toString(),

        email:
          createdUser.email,

        role:
          createdUser.role,

        department:
          createdUser.department,
      }
    );


    /* =========================
       RESPONSE
    ========================== */

    res.status(201).json({
      success: true,

      message:
        "Registration successful. You can now login.",

      user: {
        id:
          createdUser._id,

        name:
          createdUser.name,

        email:
          createdUser.email,

        role:
          createdUser.role,

        department:
          createdUser.department,

        isActive:
          createdUser.isActive,

        isPermitted:
          createdUser.isPermitted,
      },
    });

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to register user.",
    });
  }
};


/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const email =
      String(req.body.email || "")
        .trim()
        .toLowerCase();


    if (!email) {
      res.status(400).json({
        success: false,
        message:
          "Please enter your email address.",
      });

      return;
    }


    const user = await User.findOne({
      email,
    });


    /*
     * Do not reveal whether an email exists.
     * This prevents account enumeration.
     */

    if (!user) {
      res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP has been sent.",
      });

      return;
    }


    /*
     * Delete previous reset requests
     * for this user.
     */

    await PasswordReset.deleteMany({
      userId: user._id,
    });


    /*
     * Generate six digit OTP.
     */

    const otp = crypto
      .randomInt(
        100000,
        1000000
      )
      .toString();


    /*
     * Hash OTP before storing.
     */

    const otpHash =
      await bcrypt.hash(
        otp,
        10
      );


    /*
     * Generate a secure reset token.
     */

    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");


    const resetTokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    /*
     * OTP valid for 10 minutes.
     */

    const expiresAt =
      new Date(
        Date.now() +
          10 * 60 * 1000
      );


    await PasswordReset.create({
      userId:
        user._id,

      email:
        user.email,

      otpHash,

      resetTokenHash,

      expiresAt,

      verified:
        false,

      attempts:
        0,
    });


    await sendPasswordResetOtp(
      user.email,
      otp
    );


    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, an OTP has been sent.",
    });

  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Unable to send password reset OTP.",
    });
  }
};


/* =========================================================
   VERIFY OTP
========================================================= */

export const verifyOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const email =
      String(req.body.email || "")
        .trim()
        .toLowerCase();


    const otp =
      String(req.body.otp || "")
        .trim();


    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message:
          "Email and OTP are required.",
      });

      return;
    }


    if (!/^\d{6}$/.test(otp)) {
      res.status(400).json({
        success: false,
        message:
          "OTP must contain exactly 6 digits.",
      });

      return;
    }


    const resetRequest =
      await PasswordReset.findOne({
        email,
        verified: false,
      }).sort({
        createdAt: -1,
      });


    if (!resetRequest) {
      res.status(400).json({
        success: false,
        message:
          "Invalid or expired OTP.",
      });

      return;
    }


    if (
      resetRequest.expiresAt.getTime() <
      Date.now()
    ) {

      await PasswordReset.deleteOne({
        _id:
          resetRequest._id,
      });


      res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });

      return;
    }


    /*
     * Limit OTP attempts.
     */

    if (
      resetRequest.attempts >= 5
    ) {

      await PasswordReset.deleteOne({
        _id:
          resetRequest._id,
      });


      res.status(429).json({
        success: false,
        message:
          "Too many incorrect OTP attempts. Please request a new OTP.",
      });

      return;
    }


    const isValidOtp =
      await bcrypt.compare(
        otp,
        resetRequest.otpHash
      );


    if (!isValidOtp) {

      resetRequest.attempts += 1;

      await resetRequest.save();


      res.status(400).json({
        success: false,
        message:
          "Invalid OTP.",
      });

      return;
    }


    resetRequest.verified =
      true;


    await resetRequest.save();


    /*
     * Return reset token to frontend.
     *
     * This is NOT the login access token.
     * It is only valid for password reset.
     */

    const resetToken =
      crypto
        .randomBytes(32)
        .toString("hex");


    /*
     * Replace the old token hash with the
     * newly returned reset token hash.
     */

    resetRequest.resetTokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    await resetRequest.save();


    res.status(200).json({
      success: true,
      message:
        "OTP verified successfully.",
      resetToken,
    });

  } catch (error) {

    console.error(
      "Verify OTP error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Unable to verify OTP.",
    });
  }
};


/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const email =
      String(req.body.email || "")
        .trim()
        .toLowerCase();


    const resetToken =
      String(
        req.body.resetToken || ""
      ).trim();


    const newPassword =
      String(
        req.body.newPassword || ""
      );


    const confirmPassword =
      String(
        req.body.confirmPassword || ""
      );


    if (
      !email ||
      !resetToken ||
      !newPassword ||
      !confirmPassword
    ) {

      res.status(400).json({
        success: false,
        message:
          "All password reset fields are required.",
      });

      return;
    }


    if (
      newPassword.length < 6
    ) {

      res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters.",
      });

      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {

      res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });

      return;
    }


    const resetTokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    const resetRequest =
      await PasswordReset.findOne({
        email,
        resetTokenHash,
        verified: true,
      });


    if (!resetRequest) {

      res.status(400).json({
        success: false,
        message:
          "Invalid password reset request.",
      });

      return;
    }


    if (
      resetRequest.expiresAt.getTime() <
      Date.now()
    ) {

      await PasswordReset.deleteOne({
        _id:
          resetRequest._id,
      });


      res.status(400).json({
        success: false,
        message:
          "Password reset session has expired. Please start again.",
      });

      return;
    }


    const user =
      await User.findById(
        resetRequest.userId
      );


    if (!user) {

      await PasswordReset.deleteOne({
        _id:
          resetRequest._id,
      });


      res.status(404).json({
        success: false,
        message:
          "User account not found.",
      });

      return;
    }


    user.password =
      await bcrypt.hash(
        newPassword,
        12
      );


    /*
     * Password reset should invalidate
     * the currently active session.
     */

    user.isActive = false;


    await user.save();


    /*
     * Reset request becomes unusable.
     */

    await PasswordReset.deleteOne({
      _id:
        resetRequest._id,
    });


    /*
     * Clear existing authentication cookies.
     */

    res.clearCookie(
      "scorewell_access_token"
    );


    res.clearCookie(
      "scorewell_refresh_token"
    );


    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login with your new password.",
    });

  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Unable to reset password.",
    });
  }
};