import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import scoreWellLogo from "../../assets/scoreWellLogo.png";
import Footer from "../../components/Footer";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log("Registration data:", {
      email,
      password,
      confirmPassword,
    });

    // Backend registration API will be connected here later.
  };

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* =========================
          MAIN REGISTER AREA
      ========================== */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-white px-4 py-10 sm:px-6 lg:px-10">
        {/* Background Decorations */}

        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-100 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />

        <div className="pointer-events-none absolute right-[20%] top-10 h-32 w-32 rounded-full bg-purple-50 blur-2xl" />

        {/* =========================
            REGISTER CONTAINER
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
                    Join ScoreWell
                  </span>
                </div>

                <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                  Start your
                  <br />
                  journey.
                  <br />

                  <span className="text-orange-400">
                    Score Better.
                  </span>
                </h1>

                <p className="mt-7 max-w-md text-base leading-7 text-purple-100">
                  Create your ScoreWell account and get access to
                  examinations, assessments and your academic
                  performance dashboard.
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
                Every great achievement begins with the decision
                to try.
              </blockquote>

              <p className="mt-4 text-sm font-medium text-purple-200">
                — Start today. Grow every day.
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

              {/* Heading */}

              <div className="mb-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
                    Create Account
                  </span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Join
                  <span className="text-purple-700">
                    {" "}
                    ScoreWell
                  </span>
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Create your account to start using the ScoreWell
                  examination platform.
                </p>
              </div>

              {/* Register Card */}

              <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_15px_45px_rgba(109,40,217,0.08)] sm:p-7">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Email */}

                  <div>
                    <label
                      htmlFor="register-email"
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
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="Enter your email address"
                        autoComplete="email"
                        required
                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  {/* Password */}

                  <div>
                    <label
                      htmlFor="register-password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="register-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Create a password"
                        autoComplete="new-password"
                        required
                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-purple-50 hover:text-purple-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">
                      <input
                        id="confirm-password"
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
                        placeholder="Confirm your password"
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

                  {/* Error */}

                  {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Register Button */}

                  <button
                    type="submit"
                    className="group relative h-13 w-full overflow-hidden rounded-xl bg-purple-700 text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all duration-300 hover:bg-purple-800 hover:shadow-xl hover:shadow-purple-200 active:scale-[0.99]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Create Account

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

                {/* Login Link */}

                <div className="mt-7 text-center">
                  <p className="text-sm text-slate-500">
                    Already have an account?{" "}

                    <button
                      type="button"
                      onClick={handleLogin}
                      className="font-bold text-purple-700 transition hover:text-orange-500"
                    >
                      Sign in
                    </button>
                  </p>
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

      <Footer />
    </div>
  );
};

export default Register;