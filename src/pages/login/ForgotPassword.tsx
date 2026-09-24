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
    <div className="flex min-h-screen flex-col bg-white">

      {/* =========================
          MAIN
      ========================== */}

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6 lg:px-10">

        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-100 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />

        <div className="pointer-events-none absolute right-[20%] top-10 h-32 w-32 rounded-full bg-purple-50 blur-2xl" />


        {/* CONTAINER */}

        <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-[0_25px_80px_rgba(91,33,182,0.15)] lg:grid-cols-2">


          {/* =========================
              LEFT
          ========================== */}

          <section className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-purple-700 via-purple-800 to-purple-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-white/10" />

            <div className="relative z-10">

              <div className="mb-16 w-fit rounded-2xl bg-white p-4 shadow-xl">

                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-12 w-auto object-contain"
                />

              </div>


              <div className="max-w-lg">

                <div className="mb-5 flex items-center gap-3">

                  <span className="h-px w-10 bg-orange-400" />

                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-300">
                    ScoreWell
                  </span>

                </div>


                <h1 className="text-4xl font-bold leading-tight xl:text-5xl">

                  Secure.

                  <br />

                  Recover.

                  <br />

                  <span className="text-orange-400">
                    Continue Learning.
                  </span>

                </h1>


                <p className="mt-7 max-w-md text-base leading-7 text-purple-100">
                  Securely recover your ScoreWell
                  account using an email verification
                  code and create a new password.
                </p>

              </div>

            </div>


            <div className="relative z-10 max-w-lg">

              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="text-5xl font-serif leading-none text-orange-400">
                “
              </div>

              <blockquote className="-mt-2 text-xl font-medium leading-8 text-white">
                Keep learning. Keep improving.
              </blockquote>

            </div>

          </section>


          {/* =========================
              RIGHT
          ========================== */}

          <section className="flex min-h-[650px] items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">

            <div className="w-full max-w-md">


              {/* MOBILE LOGO */}

              <div className="mb-8 flex justify-center lg:hidden">

                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-16 w-auto object-contain"
                />

              </div>


              {/* HEADING */}

              <div className="mb-8">

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">

                    {step === "EMAIL" &&
                      "Password Recovery"}

                    {step === "OTP" &&
                      "Verify Identity"}

                    {step === "PASSWORD" &&
                      "Create New Password"}

                  </span>

                </div>


                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">

                  {step === "EMAIL" && (
                    <>
                      Forgot your
                      <span className="text-purple-700">
                        {" "}password?
                      </span>
                    </>
                  )}


                  {step === "OTP" && (
                    <>
                      Verify your
                      <span className="text-purple-700">
                        {" "}email
                      </span>
                    </>
                  )}


                  {step === "PASSWORD" && (
                    <>
                      Reset your
                      <span className="text-purple-700">
                        {" "}password
                      </span>
                    </>
                  )}

                </h2>


                <p className="mt-3 text-sm leading-6 text-slate-500">

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
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}


              {/* MESSAGE */}

              {message && (
                <div className="mb-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700">
                  {message}
                </div>
              )}


              {/* =========================
                  EMAIL
              ========================== */}

              {step === "EMAIL" && (

                <form
                  onSubmit={handleSendOtp}
                  className="rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_15px_45px_rgba(109,40,217,0.08)] sm:p-7"
                >

                  <label
                    htmlFor="forgot-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />


                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 h-12 w-full rounded-xl bg-purple-700 px-5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Sending OTP..."
                      : "Send OTP"}
                  </button>


                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-purple-700"
                  >
                    Back to Login
                  </button>

                </form>
              )}


              {/* =========================
                  OTP
              ========================== */}

              {step === "OTP" && (

                <form
                  onSubmit={handleVerifyOtp}
                  className="rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_15px_45px_rgba(109,40,217,0.08)] sm:p-7"
                >

                  <label
                    htmlFor="forgot-otp"
                    className="mb-2 block text-sm font-semibold text-slate-700"
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
                    className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-xl font-bold tracking-[0.4em] text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />


                  <button
                    type="submit"
                    disabled={
                      loading ||
                      otp.length !== 6
                    }
                    className="mt-5 h-12 w-full rounded-xl bg-purple-700 px-5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify OTP"}
                  </button>


                  <div className="mt-4 flex items-center justify-between">

                    <button
                      type="button"
                      onClick={() =>
                        setStep("EMAIL")
                      }
                      className="text-sm font-semibold text-slate-500 hover:text-purple-700"
                    >
                      Change Email
                    </button>


                    <button
                      type="button"
                      onClick={
                        handleResendOtp
                      }
                      disabled={loading}
                      className="text-sm font-bold text-purple-700 hover:text-purple-900 disabled:opacity-50"
                    >
                      Resend OTP
                    </button>

                  </div>

                </form>
              )}


              {/* =========================
                  PASSWORD
              ========================== */}

              {step === "PASSWORD" && (

                <form
                  onSubmit={
                    handleChangePassword
                  }
                  className="rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_15px_45px_rgba(109,40,217,0.08)] sm:p-7"
                >

                  {/* NEW PASSWORD */}

                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
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
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-purple-50 hover:text-purple-700"
                    >
                      {showNewPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>


                  {/* CONFIRM */}

                  <label
                    htmlFor="confirm-new-password"
                    className="mb-2 mt-5 block text-sm font-semibold text-slate-700"
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
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-purple-50 hover:text-purple-700"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>


                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 h-12 w-full rounded-xl bg-purple-700 px-5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Changing Password..."
                      : "Change Password"}
                  </button>

                </form>
              )}


              {/* LOGIN */}

              <div className="mt-6 text-center">

                <button
                  type="button"
                  onClick={
                    handleBackToLogin
                  }
                  className="text-sm font-bold text-purple-700 hover:text-purple-900"
                >
                  ← Back to Login
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>


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