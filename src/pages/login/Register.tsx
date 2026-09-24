import {
  useEffect,
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

type Role =
  | "STUDENT"
  | "INSTRUCTOR";

type ModalType =
  | "success"
  | "error"
  | "info";

const Register = () => {
  const navigate =
    useNavigate();

  /* =========================
     FORM STATE
  ========================== */

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState<Role | "">("");

  const [department, setDepartment] =
    useState("");

  const [newDepartment, setNewDepartment] =
    useState("");

  const [
    useNewDepartment,
    setUseNewDepartment,
  ] = useState(false);

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  /* =========================
     DEPARTMENTS
  ========================== */

  const [departments, setDepartments] =
    useState<string[]>([]);

  const [loadingDepartments, setLoadingDepartments] =
    useState(false);

  /* =========================
     UI STATE
  ========================== */

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
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
    message: string,
    type: ModalType
  ) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  /* =========================
     LOAD DEPARTMENTS
  ========================== */

  const loadDepartments =
    async () => {
      try {
        setLoadingDepartments(true);

        const response =
          await fetch(
            `${API_URL}/api/auth/departments`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load departments."
          );
        }

        setDepartments(
          Array.isArray(
            data.departments
          )
            ? data.departments
            : []
        );
      } catch (error) {
        console.error(
          "Department loading error:",
          error
        );

        setDepartments([]);

        setError(
          "Unable to load departments. Please try again."
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

  useEffect(() => {
    loadDepartments();
  }, []);

  /* =========================
     ROLE CHANGE
  ========================== */

  const handleRoleChange = (
    value: Role
  ) => {
    setRole(value);

    setDepartment("");

    setNewDepartment("");

    setUseNewDepartment(false);

    setError("");
  };

  /* =========================
     DEPARTMENT CHANGE
  ========================== */

  const handleDepartmentChange = (
    value: string
  ) => {
    if (
      role === "INSTRUCTOR" &&
      value === "__ADD_NEW__"
    ) {
      setDepartment("");

      setUseNewDepartment(true);

      setNewDepartment("");

      return;
    }

    setUseNewDepartment(false);

    setNewDepartment("");

    setDepartment(value);
  };

  /* =========================
     RESET FORM
  ========================== */

  const resetForm = () => {
    setName("");

    setEmail("");

    setRole("");

    setDepartment("");

    setNewDepartment("");

    setUseNewDepartment(false);

    setPassword("");

    setConfirmPassword("");

    setError("");

    setShowPassword(false);

    setShowConfirmPassword(false);
  };

  /* =========================
     SUCCESS MODAL CLOSE
  ========================== */

  const handleSuccessModalClose = () => {
    closeModal();

    navigate("/");
  };

  /* =========================
     SUBMIT
  ========================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    /* =========================
       VALIDATION
    ========================== */

    const trimmedName =
      name.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    let finalDepartment =
      department.trim();

    if (!trimmedName) {
      setError(
        "Please enter your name."
      );

      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (!role) {
      setError(
        "Please select your account type."
      );

      return;
    }

    /*
     * Instructor using Add New Department.
     */

    if (
      role === "INSTRUCTOR" &&
      useNewDepartment
    ) {
      finalDepartment =
        newDepartment.trim();
    }

    if (!finalDepartment) {
      setError(
        role === "STUDENT"
          ? "Please select your department."
          : "Please select or enter your department."
      );

      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    /* =========================
       SEND REQUEST
    ========================== */

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/api/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: trimmedName,

              email: trimmedEmail,

              password,

              confirmPassword,

              role,

              department:
                finalDepartment,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed."
        );
      }

      /* =========================
         REGISTRATION SUCCESS
      ========================== */

      // Clear the entire form immediately
      // after successful registration.
      resetForm();

      // Keep the success modal open.
      // User must click Continue manually.
      showModal(
        "Registration Successful",
        "Your ScoreWell account has been created successfully. You can now login.",
        "success"
      );

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to register."
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

        {/* Background */}

        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-100 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />

        <div className="pointer-events-none absolute right-[20%] top-10 h-32 w-32 rounded-full bg-purple-50 blur-2xl" />

        {/* =========================
            CONTAINER
        ========================== */}

        <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-[0_25px_80px_rgba(91,33,182,0.15)] lg:grid-cols-2">

          {/* =========================
              LEFT
          ========================== */}

          <section className="relative hidden min-h-[760px] overflow-hidden bg-gradient-to-br from-purple-700 via-purple-800 to-purple-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">

            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-white/10" />

            <div className="absolute right-20 top-28 h-3 w-3 rounded-full bg-orange-400" />

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

                  Create.

                  <br />

                  Learn.

                  <br />

                  <span className="text-orange-400">
                    Score Better.
                  </span>

                </h1>

                <p className="mt-7 max-w-md text-base leading-7 text-purple-100">
                  Create your ScoreWell account and
                  access examinations, assessments
                  and academic performance tools.
                </p>

              </div>

            </div>

            <div className="relative z-10 max-w-lg">

              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="text-5xl font-serif leading-none text-orange-400">
                “
              </div>

              <blockquote className="-mt-2 text-xl font-medium leading-8 text-white">
                Every great achievement begins
                with the decision to try.
              </blockquote>

              <p className="mt-4 text-sm font-medium text-purple-200">
                — Start today. Grow every day.
              </p>

            </div>

          </section>

          {/* =========================
              RIGHT
          ========================== */}

          <section className="flex min-h-[760px] items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 xl:px-16">

            <div className="w-full max-w-md">

              {/* Mobile logo */}

              <div className="mb-8 flex justify-center lg:hidden">

                <img
                  src={scoreWellLogo}
                  alt="ScoreWell"
                  className="h-16 w-auto object-contain"
                />

              </div>

              {/* Heading */}

              <div className="mb-7">

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
                    Create Account
                  </span>

                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">

                  Join

                  <span className="text-purple-700">
                    {" "}ScoreWell
                  </span>

                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Create your account to start using
                  the ScoreWell examination platform.
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}

              <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_15px_45px_rgba(109,40,217,0.08)] sm:p-7">

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="register-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    />

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="register-email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    />

                  </div>

                  {/* ROLE */}

                  <div>

                    <label
                      htmlFor="register-role"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Account Type
                    </label>

                    <select
                      id="register-role"
                      value={role}
                      onChange={(event) =>
                        handleRoleChange(
                          event.target.value as Role
                        )
                      }
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    >

                      <option value="">
                        Select account type
                      </option>

                      <option value="STUDENT">
                        Student
                      </option>

                      <option value="INSTRUCTOR">
                        Instructor
                      </option>

                    </select>

                  </div>

                  {/* DEPARTMENT */}

                  <div>

                    <label
                      htmlFor="register-department"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Department
                    </label>

                    <select
                      id="register-department"
                      value={
                        useNewDepartment
                          ? "__ADD_NEW__"
                          : department
                      }
                      onChange={(event) =>
                        handleDepartmentChange(
                          event.target.value
                        )
                      }
                      disabled={!role}
                      required={!useNewDepartment}
                      className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition ${
                        !role
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-900 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      }`}
                    >

                      <option value="">
                        {!role
                          ? "Select account type first"
                          : loadingDepartments
                            ? "Loading departments..."
                            : "Select department"}
                      </option>

                      {departments.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}

                      {role === "INSTRUCTOR" && (
                        <option value="__ADD_NEW__">
                          + Add New Department
                        </option>
                      )}

                    </select>

                    {/* NEW DEPARTMENT */}

                    {role === "INSTRUCTOR" &&
                      useNewDepartment && (
                        <div className="mt-3">

                          <input
                            type="text"
                            value={newDepartment}
                            onChange={(event) =>
                              setNewDepartment(
                                event.target.value
                              )
                            }
                            placeholder="Enter new department name"
                            required
                            className="h-12 w-full rounded-xl border border-orange-200 bg-orange-50 px-4 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                          />

                          <p className="mt-2 text-xs text-slate-500">
                            This department will become
                            available for future students
                            after the instructor is registered.
                          </p>

                        </div>
                      )}

                    {!role && (
                      <p className="mt-2 text-xs text-slate-400">
                        Select Student or Instructor first.
                      </p>
                    )}

                  </div>

                  {/* PASSWORD */}

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
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        placeholder="Create a password"
                        autoComplete="new-password"
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-purple-50 hover:text-purple-700"
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>

                    </div>

                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label
                      htmlFor="register-confirm-password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">

                      <input
                        id="register-confirm-password"
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
                        placeholder="Confirm your password"
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

                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-xl bg-purple-700 px-5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Creating Account..."
                      : "Create Account"}
                  </button>

                  {/* LOGIN */}

                  <div className="pt-1 text-center">

                    <span className="text-sm text-slate-500">
                      Already have an account?
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/")
                      }
                      className="ml-2 text-sm font-bold text-purple-700 hover:text-purple-900"
                    >
                      Login
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </section>

        </div>

      </main>

      <Footer />

      {/* =========================
          SUCCESS / ERROR MODAL
      ========================== */}

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={
          modal.type === "success"
            ? handleSuccessModalClose
            : closeModal
        }
        closeButtonText="Continue"
      />

    </div>
  );
};

export default Register;