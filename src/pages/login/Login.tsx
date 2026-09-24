import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import scoreWellLogo from "../../assets/scoreWellLogo.png";
import Footer from "../../components/Footer";
import Modal from "../../components/Modal";

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  department?: string | null;
  isActive: boolean;
  isPermitted: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: LoggedInUser;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const closeModal = () => {
    setModal((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const trimmedEmail =
      email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (!password) {
      setError("Please enter your password.");

      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: trimmedEmail,
            password,
            rememberMe,
          }),
        }
      );

      const data: LoginResponse =
        await response.json();

      if (!response.ok || !data.success) {
        const message =
          data.message ||
          "Unable to login. Please try again.";

        setError(message);

        showModal(
          "Login Failed",
          message,
          "error"
        );

        return;
      }

      if (!data.user) {
        const message =
          "Login succeeded, but user information was not returned.";

        setError(message);

        showModal(
          "Login Error",
          message,
          "error"
        );

        return;
      }

      showModal(
        "Login Successful",
        `Welcome back, ${data.user.name}.`,
        "success"
      );

      /*
       * The JWT tokens are intentionally NOT stored
       * in localStorage. They are stored by the backend
       * as HttpOnly cookies.
       */

                if (data.user.role === "STUDENT") {
            setTimeout(() => {
              navigate("/student", {
                replace: true,
              });
            }, 700);

            return;
          }

          if (data.user.role === "INSTRUCTOR") {
            setTimeout(() => {
              navigate("/instructor", {
                replace: true,
              });
            }, 700);

            return;
          }
      setError("Invalid user role.");
    } catch (requestError) {
      console.error(
        "Login request error:",
        requestError
      );

      const message =
        "Unable to connect to the ScoreWell server. Please make sure the backend is running.";

      setError(message);

      showModal(
        "Connection Error",
        message,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-purple-100">

      {/* ========================================================= */}
      {/* LOGIN PAGE BACKGROUND                                     */}
      {/* ========================================================= */}

      <main className="flex flex-1 items-center justify-center px-3 py-8 sm:px-5 sm:py-10 md:px-8 lg:px-10">

        {/* Decorative Background Elements */}
        <div className="pointer-events-none fixed left-0 top-0 h-48 w-48 rounded-full bg-purple-100/70 blur-3xl" />

        <div className="pointer-events-none fixed bottom-0 right-0 h-64 w-64 rounded-full bg-purple-200/50 blur-3xl" />

        {/* ======================================================= */}
        {/* MAIN LOGIN CARD                                         */}
        {/* ======================================================= */}

        <div className="relative z-10 flex w-full max-w-5xl flex-row overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-2xl shadow-purple-200/40">

          {/* ===================================================== */}
          {/* LEFT BRANDING SECTION                                 */}
          {/* Visible on tablet and desktop                        */}
          {/* ===================================================== */}

          <section className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100 px-7 py-10 md:flex md:flex-col md:justify-center md:px-9 lg:px-12 xl:px-16">

            {/* Decorative circles */}
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-100/80 lg:h-52 lg:w-52" />

            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-200/50 lg:h-52 lg:w-52" />

            {/* Small accent */}
            <div className="absolute left-0 top-1/2 h-20 w-1 -translate-y-1/2 rounded-r-full bg-purple-600" />

            <div className="relative z-10">

              {/* Logo */}
              <div className="mb-8 flex justify-start">
                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-20 w-auto object-contain lg:h-24 xl:h-28"
                />
              </div>

              {/* Accent line */}
              <div className="mb-5 h-1 w-14 rounded-full bg-purple-600" />

              {/* Main Text */}
              <h2 className="text-3xl font-bold leading-tight text-purple-950 lg:text-4xl xl:text-5xl">
                Learn.
                <br />
                Perform.
                <br />
                <span className="text-purple-600">
                  Score Well.
                </span>
              </h2>

              {/* Quote */}
              <p className="mt-6 max-w-md text-sm leading-6 text-gray-600 lg:text-base lg:leading-7 xl:text-lg">
                "Every question is an opportunity
                to learn, every examination is a
                step towards excellence."
              </p>

              {/* Platform */}
              <div className="mt-7">

                <p className="text-xs font-bold tracking-widest text-purple-700 lg:text-sm">
                  EXAMINATION & ASSESSMENT
                  PLATFORM
                </p>

                <p className="mt-2 max-w-sm text-xs leading-5 text-gray-500 lg:text-sm lg:leading-6">
                  A smarter way to conduct,
                  manage and experience
                  examinations.
                </p>

              </div>

            </div>
          </section>

          {/* ===================================================== */}
          {/* RIGHT LOGIN SECTION                                   */}
          {/* ===================================================== */}

          <section className="flex w-full items-center justify-center bg-white px-5 py-8 sm:px-8 sm:py-10 md:w-1/2 md:px-7 lg:px-10 xl:px-14">

            <div className="w-full max-w-md">

              {/* Phone Logo */}
              <div className="mb-5 flex justify-center md:hidden">
                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-16 w-auto object-contain sm:h-20"
                />
              </div>

              {/* Heading */}
              <div className="mb-6 text-center">

                <div className="mb-3 inline-flex rounded-full bg-purple-100 px-4 py-1.5 text-[10px] font-bold tracking-wide text-purple-700 sm:text-xs">
                  WELCOME BACK
                </div>

                <h1 className="text-2xl font-bold text-purple-950 sm:text-3xl">
                  Welcome to ScoreWell
                </h1>

                <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
                  Sign in to continue to your
                  dashboard.
                </p>

              </div>

              {/* ================================================= */}
              {/* LOGIN FORM CARD                                   */}
              {/* ================================================= */}

                <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-[0_15px_45px_rgba(91,33,182,0.14),0_4px_12px_rgba(0,0,0,0.06)] ring-1 ring-purple-100/60 sm:rounded-3xl sm:p-7">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-5"
                >

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
                    >
                      Email / Student ID
                    </label>

                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="Enter your email"
                      autoComplete="username"
                      disabled={isLoading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-xs font-semibold text-purple-700 hover:text-purple-900"
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Remember Me / Forgot Password */}
                  <div className="flex items-center justify-between gap-3">

                    <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 sm:text-sm">

                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(
                            event.target.checked
                          )
                        }
                        disabled={isLoading}
                        className="h-4 w-4 accent-purple-700"
                      />

                      <span>
                        Remember me
                      </span>

                    </label>

                    <button
                      type="button"
                      onClick={
                        handleForgotPassword
                      }
                      disabled={isLoading}
                      className="text-xs font-semibold text-purple-700 transition hover:text-purple-900 sm:text-sm"
                    >
                      Forgot password?
                    </button>

                  </div>

                  {/* Sign In */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-purple-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                </form>

                {/* OR */}
                <div className="my-6 flex items-center gap-3">

                  <div className="h-px flex-1 bg-gray-200" />

                  <span className="text-xs text-gray-400">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-gray-200" />

                </div>

                {/* Register */}
                <div className="text-center">

                  <p className="text-sm text-gray-500">
                    Don't have an account?
                  </p>

                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="mt-2 font-bold text-purple-700 transition hover:text-purple-900"
                  >
                    Create an account
                  </button>

                </div>

              </div>

              {/* Security Text */}
              <div className="mt-5 text-center">
                <p className="text-xs leading-5 text-gray-400">
                  Secure examination and assessment
                  management platform.
                </p>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* ========================================================= */}
      {/* EXISTING FOOTER - UNCHANGED                               */}
      {/* ========================================================= */}

      <Footer />

      {/* ========================================================= */}
      {/* EXISTING MODAL - UNCHANGED                                */}
      {/* ========================================================= */}

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={closeModal}
        closeButtonText={
          modal.type === "success"
            ? "Continue"
            : "Close"
        }
      />
    </div>
  );
};

export default Login;