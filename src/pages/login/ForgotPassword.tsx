import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import scoreWellLogo from "../../assets/scoreWellLogo.png";
import Footer from "../../components/Footer";

type ForgotPasswordStep =
  | "EMAIL"
  | "OTP"
  | "PASSWORD";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] =
    useState<ForgotPasswordStep>("EMAIL");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =========================
      SEND OTP
  ========================== */

  const handleSendOtp = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    console.log("Send OTP to:", email);

    /*
      Frontend only for now.

      Later:
      POST /api/auth/forgot-password
      {
        email
      }

      Backend will generate OTP
      and send it using Nodemailer SMTP.
    */

    setMessage(
      "OTP has been sent to your email address."
    );

    setStep("OTP");
  };

  /* =========================
      VERIFY OTP
  ========================== */

  const handleVerifyOtp = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    console.log("Verify OTP:", otp);

    /*
      Later:
      POST /api/auth/verify-otp
      {
        email,
        otp
      }
    */

    setStep("PASSWORD");
  };

  /* =========================
      CHANGE PASSWORD
  ========================== */

  const handleChangePassword = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log({
      email,
      otp,
      newPassword,
      confirmPassword,
    });

    /*
      Later:
      POST /api/auth/reset-password
      {
        email,
        otp,
        newPassword
      }
    */

    setMessage(
      "Your password has been changed successfully."
    );
  };

  /* =========================
      BACK TO LOGIN
  ========================== */

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* =========================
          MAIN AREA
      ========================== */}

      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6 lg:px-10">
        {/* Background Decorations */}

        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-100 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />

        <div className="pointer-events-none absolute right-[20%] top-10 h-32 w-32 rounded-full bg-purple-50 blur-2xl" />

        {/* =========================
            MAIN CONTAINER
        ========================== */}

        <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-[0_25px_80px_rgba(91,33,182,0.15)] lg:grid-cols-2">
          {/* =========================
              LEFT SECTION
          ========================== */}

          <section className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-purple-700 via-purple-800 to-purple-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            {/* Decorative Circles */}

            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-white/10" />

            <div className="absolute right-20 top-28 h-3 w-3 rounded-full bg-orange-400" />

            <div className="absolute bottom-32 right-28 h-2 w-2 rounded-full bg-orange-300" />

            {/* Logo + Content */}

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
                    Account Recovery
                  </span>
                </div>

                <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                  Get back
                  <br />
                  to your
                  <br />

                  <span className="text-orange-400">
                    ScoreWell.
                  </span>
                </h1>

                <p className="mt-7 max-w-md text-base leading-7 text-purple-100">
                  Forgot your password? Don't worry. Verify your
                  email with an OTP and create a new secure
                  password.
                </p>
              </div>
            </div>

            {/* Quote */}

            <div className="relative z-10 max-w-lg">
              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="text-5xl font-serif leading-none text-orange-400">
                “
              </div>

              <blockquote className="-mt-2 text-xl font-medium leading-8 text-white">
                Every setback is a chance to start stronger.
              </blockquote>

              <p className="mt-4 text-sm font-medium text-purple-200">
                — Keep learning. Keep moving forward.
              </p>
            </div>
          </section>

          {/* =========================
              RIGHT SECTION
          ========================== */}

          <section className="flex min-h-[650px] items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}

              <div className="mb-8 flex justify-center lg:hidden">
                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-16 w-auto object-contain"
                />
              </div>

              {/* =========================
                  HEADING
              ========================== */}

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
                        {" "}
                        password?
                      </span>
                    </>
                  )}

                  {step === "OTP" && (
                    <>
                      Verify your
                      <span className="text-purple-700">
                        {" "}
                        email
                      </span>
                    </>
                  )}

                  {step === "PASSWORD" && (
                    <>
                      Reset your
                      <span className="text-purple-700">
                        {" "}
                        password
                      </span>
                    </>
                  )}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step === "EMAIL" &&
                    "Enter your registered email address and we will send you a verification OTP."}

                  {step === "OTP" &&
                    `Enter the 6-digit OTP sent to ${email}.`}

                  {step === "PASSWORD" &&
                    "Create a new password for your ScoreWell account."}
                </p>
              </div>

              {/* =========================
                  RECOVERY CARD
              ========================== */}

              <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_15px_45px_rgba(109,40,217,0.08)] sm:p-7">
                {/* =========================
                    EMAIL STEP
                ========================== */}

                {step === "EMAIL" && (
                  <form
                    onSubmit={handleSendOtp}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="forgot-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-5 w-5"
                          >
                            <rect
                              width="20"
                              height="16"
                              x="2"
                              y="4"
                              rx="2"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2 7 8.5 6a2.5 2.5 0 0 0 3 0L22 7"
                            />
                          </svg>
                        </div>

                        <input
                          id="forgot-email"
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          placeholder="Enter your registered email"
                          autoComplete="email"
                          required
                          className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                        />
                      </div>
                    </div>

                    {/* Error */}

                    {error && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                      </div>
                    )}

                    {/* Success */}

                    {message && (
                      <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                        {message}
                      </div>
                    )}

                    {/* Send OTP */}

                    <button
                      type="submit"
                      className="group relative h-13 w-full overflow-hidden rounded-xl bg-purple-700 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all duration-300 hover:bg-purple-800 hover:shadow-xl hover:shadow-purple-200 active:scale-[0.99]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Send OTP

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M13 6l6 6-6 6"
                          />
                        </svg>
                      </span>

                      <span className="absolute inset-0 -translate-x-full bg-orange-500 transition-transform duration-500 group-hover:translate-x-0" />
                    </button>
                  </form>
                )}

                {/* =========================
                    OTP STEP
                ========================== */}

                {step === "OTP" && (
                  <form
                    onSubmit={handleVerifyOtp}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="otp"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Verification OTP
                      </label>

                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        placeholder="Enter 6-digit OTP"
                        required
                        className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-lg font-bold tracking-[0.5em] text-slate-900 outline-none transition-all placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      />
                    </div>

                    {/* Error */}

                    {error && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                      </div>
                    )}

                    {/* Success */}

                    {message && (
                      <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                        {message}
                      </div>
                    )}

                    {/* Verify */}

                    <button
                      type="submit"
                      className="group relative h-13 w-full overflow-hidden rounded-xl bg-purple-700 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all duration-300 hover:bg-purple-800 hover:shadow-xl hover:shadow-purple-200 active:scale-[0.99]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Verify OTP

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M13 6l6 6-6 6"
                          />
                        </svg>
                      </span>

                      <span className="absolute inset-0 -translate-x-full bg-orange-500 transition-transform duration-500 group-hover:translate-x-0" />
                    </button>

                    {/* Change Email */}

                    <button
                      type="button"
                      onClick={() => {
                        setOtp("");
                        setError("");
                        setMessage("");
                        setStep("EMAIL");
                      }}
                      className="w-full text-center text-sm font-semibold text-purple-600 transition hover:text-orange-500"
                    >
                      Change email address
                    </button>
                  </form>
                )}

                {/* =========================
                    PASSWORD STEP
                ========================== */}

                {step === "PASSWORD" && (
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-5"
                  >
                    {/* New Password */}

                    <div>
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
                          onChange={(e) =>
                            setNewPassword(
                              e.target.value
                            )
                          }
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          required
                          className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              (previous) => !previous
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-purple-50 hover:text-purple-700"
                        >
                          {showNewPassword
                            ? "Hide"
                            : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}

                    <div>
                      <label
                        htmlFor="confirm-new-password"
                        className="mb-2 block text-sm font-semibold text-slate-700"
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
                          onChange={(e) =>
                            setConfirmPassword(
                              e.target.value
                            )
                          }
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          required
                          className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (previous) => !previous
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-purple-50 hover:text-purple-700"
                        >
                          {showConfirmPassword
                            ? "Hide"
                            : "Show"}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Password must contain at least 6
                      characters.
                    </p>

                    {/* Error */}

                    {error && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                      </div>
                    )}

                    {/* Success */}

                    {message && (
                      <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                        {message}
                      </div>
                    )}

                    {/* Change Password */}

                    <button
                      type="submit"
                      className="group relative h-13 w-full overflow-hidden rounded-xl bg-purple-700 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all duration-300 hover:bg-purple-800 hover:shadow-xl hover:shadow-purple-200 active:scale-[0.99]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Change Password

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M13 6l6 6-6 6"
                          />
                        </svg>
                      </span>

                      <span className="absolute inset-0 -translate-x-full bg-orange-500 transition-transform duration-500 group-hover:translate-x-0" />
                    </button>
                  </form>
                )}

                {/* Back To Login */}

                <div className="mt-7 text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm font-semibold text-purple-700 transition hover:text-orange-500"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>

              {/* Security */}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4 text-purple-500"
                >
                  <rect
                    width="14"
                    height="11"
                    x="5"
                    y="10"
                    rx="2"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                  />
                </svg>

                <span>
                  Your account information is securely protected
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}

      <Footer />
    </div>
  );
};

export default ForgotPassword;