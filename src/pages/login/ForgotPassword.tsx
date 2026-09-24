import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import scoreWellLogo from "../../assets/scoreWellLogo.png";

import Footer from "../../components/Footer";

import Modal from "../../components/Modal";

const API_URL =
  import.meta.env.VITE_API_URL;

type ForgotPasswordStep =
  | "EMAIL"
  | "OTP"
  | "PASSWORD";

type ModalType =
  | "success"
  | "error"
  | "info";

const ForgotPassword = () => {
  const navigate =
    useNavigate();

  /* =========================
     STEP
  ========================== */

  const [step, setStep] =
    useState<ForgotPasswordStep>(
      "EMAIL"
    );

  /* =========================
     FORM
  ========================== */

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [resetToken, setResetToken] =
    useState("");

  /* =========================
     UI
  ========================== */

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /* =========================
     MODAL
  ========================== */

  const [modal, setModal] =
    useState<{
      isOpen: boolean;
      title: string;
      message: string;
      type: ModalType;
    }>({
      isOpen: false,
      title: "",
      message: "",
      type: "info",
    });

  const closeModal = () => {
    setModal((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  const showModal = (
    title: string,
    modalMessage: string,
    type: ModalType
  ) => {
    setModal({
      isOpen: true,
      title,
      message: modalMessage,
      type,
    });
  };

  /* =========================
     SEND OTP
  ========================== */

  const handleSendOtp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    setMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/forgot-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                normalizedEmail,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send OTP."
        );
      }

      setEmail(
        normalizedEmail
      );

      setMessage(
        "If an account exists with this email, an OTP has been sent."
      );

      setStep("OTP");
    } catch (error) {
      console.error(
        "Send OTP error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================== */

  const handleVerifyOtp = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    setMessage("");

    const normalizedOtp =
      otp.trim();

    if (
      !/^\d{6}$/.test(
        normalizedOtp
      )
    ) {
      setError(
        "Please enter a valid 6-digit OTP."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/verify-otp`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                email.trim().toLowerCase(),

              otp:
                normalizedOtp,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid OTP."
        );
      }

      if (!data.resetToken) {
        throw new Error(
          "Password reset token was not received."
        );
      }

      setResetToken(
        data.resetToken
      );

      setMessage(
        "OTP verified successfully. Create your new password."
      );

      setStep("PASSWORD");
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESET PASSWORD
  ========================== */

  const handleChangePassword =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");

      setMessage("");

      if (newPassword.length < 6) {
        setError(
          "New password must be at least 6 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      if (!resetToken) {
        setError(
          "Password reset session is invalid. Please start again."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/reset-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                resetToken,

                newPassword,

                confirmPassword,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to change password."
          );
        }

        showModal(
          "Password Changed",
          "Your password has been changed successfully. You can now login with your new password.",
          "success"
        );
      } catch (error) {
        console.error(
          "Password reset error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to change password."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =========================
     BACK
  ========================== */

  const handleBackToLogin =
    () => {
      navigate("/");
    };

  /* =========================
     RESEND OTP
  ========================== */

  const handleResendOtp =
    async () => {
      setError("");

      setMessage("");

      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail) {
        setError(
          "Please enter your email address."
        );

        setStep("EMAIL");

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/forgot-password`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  normalizedEmail,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to resend OTP."
          );
        }

        setOtp("");

        setMessage(
          "A new OTP has been sent to your email."
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to resend OTP."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-purple-100">

      {/* =========================================================
          MAIN
      ========================================================== */}

      <main className="flex flex-1 items-center justify-center px-3 py-8 sm:px-5 sm:py-10 md:px-8 lg:px-10">

        {/* Decorative Background */}

        <div className="pointer-events-none fixed left-0 top-0 h-48 w-48 rounded-full bg-purple-100/70 blur-3xl" />

        <div className="pointer-events-none fixed bottom-0 right-0 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />

        {/* =======================================================
            MAIN CARD
        ======================================================== */}

        <div className="relative z-10 flex w-full max-w-5xl flex-row overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-2xl shadow-purple-200/40">

          {/* =====================================================
              LEFT BRANDING SECTION
          ====================================================== */}

          <section className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100 px-7 py-10 md:flex md:flex-col md:justify-center md:px-9 lg:px-12 xl:px-16">

            {/* Decorative circles */}

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-100/80 lg:h-52 lg:w-52" />

            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-orange-100/50 lg:h-52 lg:w-52" />

            <div className="absolute right-10 top-20 h-3 w-3 rounded-full bg-orange-400" />

            <div className="absolute bottom-24 right-24 h-2 w-2 rounded-full bg-purple-500" />

            {/* Accent */}

            <div className="absolute left-0 top-1/2 h-20 w-1 -translate-y-1/2 rounded-r-full bg-purple-600" />

            <div className="relative z-10">

              {/* Logo */}

              <div className="mb-8 flex justify-start">

                <div className="rounded-2xl bg-white p-3 shadow-lg ring-1 ring-purple-100">

                  <img
                    src={scoreWellLogo}
                    alt="ScoreWell"
                    className="h-16 w-auto object-contain lg:h-20 xl:h-24"
                  />

                </div>

              </div>

              {/* Accent */}

              <div className="mb-5 h-1 w-14 rounded-full bg-purple-600" />

              {/* Heading */}

              <h2 className="text-3xl font-bold leading-tight text-purple-950 lg:text-4xl xl:text-5xl">

                Learn.

                <br />

                Recover.

                <br />

                <span className="text-purple-600">
                  Keep Growing.
                </span>

              </h2>

              {/* Description */}

              <p className="mt-6 max-w-md text-sm leading-6 text-gray-600 lg:text-base lg:leading-7 xl:text-lg">

                Forgot your password?
                Recover your account
                securely and continue
                your learning journey
                without losing your progress.

              </p>

              {/* Platform */}

              <div className="mt-7">

                <p className="text-xs font-bold tracking-widest text-purple-700 lg:text-sm">

                  EXAMINATION & ASSESSMENT
                  PLATFORM

                </p>

                <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500 lg:text-sm lg:leading-6">

                  Secure access to your
                  academic assessments
                  and performance.

                </p>

              </div>

            </div>

            {/* Education Quote */}

            <div className="relative z-10 mt-10 max-w-md">

              <div className="mb-4 h-px w-full bg-purple-200" />

              <div className="text-5xl font-serif leading-none text-orange-500">
                “
              </div>

              <blockquote className="-mt-2 text-lg font-medium leading-7 text-purple-950 lg:text-xl lg:leading-8">

                Learning never stops;
                sometimes all we need
                is a chance to begin again.

              </blockquote>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-purple-600">

                Learn • Practice • Progress

              </p>

            </div>

          </section>

          {/* =====================================================
              RIGHT FORGOT PASSWORD SECTION
          ====================================================== */}

          <section className="flex w-full items-center justify-center bg-white px-5 py-8 sm:px-8 sm:py-10 md:w-1/2 md:px-7 lg:px-10 xl:px-14">

            <div className="w-full max-w-md">

              {/* Mobile Logo */}

              <div className="mb-5 flex justify-center md:hidden">

                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-16 w-auto object-contain sm:h-20"
                />

              </div>

              {/* Heading */}

              <div className="mb-6 text-center md:text-left">

                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-[10px] font-bold tracking-wide text-purple-700 sm:text-xs">

                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  {step === "EMAIL" &&
                    "PASSWORD RECOVERY"}

                  {step === "OTP" &&
                    "VERIFY IDENTITY"}

                  {step === "PASSWORD" &&
                    "CREATE NEW PASSWORD"}

                </div>

                <h1 className="text-2xl font-bold text-purple-950 sm:text-3xl">

                  {step === "EMAIL" && (
                    <>
                      Forgot your{" "}

                      <span className="text-purple-600">
                        password?
                      </span>
                    </>
                  )}

                  {step === "OTP" && (
                    <>
                      Verify your{" "}

                      <span className="text-purple-600">
                        email
                      </span>
                    </>
                  )}

                  {step === "PASSWORD" && (
                    <>
                      Reset your{" "}

                      <span className="text-purple-600">
                        password
                      </span>
                    </>
                  )}

                </h1>

                <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">

                  {step === "EMAIL" &&
                    "Enter your registered email address and we'll send you a verification OTP."}

                  {step === "OTP" &&
                    `Enter the 6-digit OTP sent to ${email}.`}

                  {step === "PASSWORD" &&
                    "Create a new secure password for your ScoreWell account."}

                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* MESSAGE */}

              {message && (
                <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700">
                  {message}
                </div>
              )}

              {/* =================================================
                  FORM CARD
              ================================================== */}

              <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-[0_15px_45px_rgba(91,33,182,0.14),0_4px_12px_rgba(0,0,0,0.06)] ring-1 ring-purple-100/60 sm:rounded-3xl sm:p-7">

                {/* EMAIL */}

                {step === "EMAIL" && (

                  <form
                    onSubmit={
                      handleSendOtp
                    }
                    className="space-y-4 sm:space-y-5"
                  >

                    <div>

                      <label
                        htmlFor="forgot-email"
                        className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
                      >
                        Email Address
                      </label>

                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(
                            event.target.value
                          )
                        }
                        placeholder="Enter your registered email"
                        autoComplete="email"
                        required
                        disabled={loading}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center rounded-xl bg-purple-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {loading ? (
                        <span className="flex items-center gap-2">

                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                          Sending OTP...

                        </span>
                      ) : (
                        "Send OTP"
                      )}

                    </button>

                  </form>

                )}

                {/* OTP */}

                {step === "OTP" && (

                  <form
                    onSubmit={
                      handleVerifyOtp
                    }
                    className="space-y-4 sm:space-y-5"
                  >

                    <div>

                      <label
                        htmlFor="forgot-otp"
                        className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
                      >
                        Verification OTP
                      </label>

                      <input
                        id="forgot-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(event) =>
                          setOtp(
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="Enter 6-digit OTP"
                        autoComplete="one-time-code"
                        required
                        disabled={loading}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-xl font-bold tracking-[0.4em] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                    </div>

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        otp.length !== 6
                      }
                      className="flex w-full items-center justify-center rounded-xl bg-purple-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {loading ? (
                        <span className="flex items-center gap-2">

                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                          Verifying...

                        </span>
                      ) : (
                        "Verify OTP"
                      )}

                    </button>

                    <div className="flex items-center justify-between pt-1">

                      <button
                        type="button"
                        onClick={() =>
                          setStep("EMAIL")
                        }
                        disabled={loading}
                        className="text-xs font-semibold text-gray-500 transition hover:text-purple-700 sm:text-sm"
                      >
                        Change Email
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleResendOtp
                        }
                        disabled={loading}
                        className="text-xs font-bold text-purple-700 transition hover:text-purple-900 disabled:opacity-50 sm:text-sm"
                      >
                        Resend OTP
                      </button>

                    </div>

                  </form>

                )}

                {/* PASSWORD */}

                {step === "PASSWORD" && (

                  <form
                    onSubmit={
                      handleChangePassword
                    }
                    className="space-y-4 sm:space-y-5"
                  >

                    {/* NEW PASSWORD */}

                    <div>

                      <label
                        htmlFor="new-password"
                        className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
                      >
                        New Password
                      </label>

                      <div className="relative">

                        <input
                          id="new-password"
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(
                              event.target.value
                            )
                          }
                          placeholder="Create new password"
                          autoComplete="new-password"
                          required
                          disabled={loading}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          disabled={loading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-xs font-semibold text-purple-700 hover:text-purple-900 disabled:opacity-50"
                        >
                          {showNewPassword
                            ? "Hide"
                            : "Show"}
                        </button>

                      </div>

                    </div>

                    {/* CONFIRM PASSWORD */}

                    <div>

                      <label
                        htmlFor="confirm-new-password"
                        className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
                      >
                        Confirm New Password
                      </label>

                      <div className="relative">

                        <input
                          id="confirm-new-password"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            confirmPassword
                          }
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value
                            )
                          }
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          required
                          disabled={loading}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          disabled={loading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-xs font-semibold text-purple-700 hover:text-purple-900 disabled:opacity-50"
                        >
                          {showConfirmPassword
                            ? "Hide"
                            : "Show"}
                        </button>

                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center rounded-xl bg-purple-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {loading ? (
                        <span className="flex items-center gap-2">

                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                          Changing Password...

                        </span>
                      ) : (
                        "Change Password"
                      )}

                    </button>

                  </form>

                )}

                {/* DIVIDER */}

                <div className="my-6 flex items-center gap-3">

                  <div className="h-px flex-1 bg-gray-200" />

                  <span className="text-xs text-gray-400">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-gray-200" />

                </div>

                {/* BACK TO LOGIN */}

                <div className="text-center">

                  <button
                    type="button"
                    onClick={
                      handleBackToLogin
                    }
                    className="font-bold text-purple-700 transition hover:text-purple-900"
                  >
                    ← Back to Login
                  </button>

                </div>

              </div>

              {/* Security Text */}

              <div className="mt-5 text-center">

                <p className="text-xs leading-5 text-gray-400">

                  Your account recovery is
                  protected by email verification.

                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* FOOTER */}

      <Footer />

      {/* MODAL */}

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => {
          closeModal();

          if (
            modal.type ===
            "success"
          ) {
            navigate("/");
          }
        }}
        closeButtonText="Continue"
      />

    </div>
  );
};

export default ForgotPassword;