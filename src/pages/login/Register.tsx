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

type Role =
  | "STUDENT"
  | "INSTRUCTOR";

type ModalType =
  | "success"
  | "error"
  | "info";

const API_URL =
  import.meta.env.VITE_API_URL;

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

    const trimmedName =
      name.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    let finalDepartment =
      department.trim();

    /* =========================
       VALIDATION
    ========================== */

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

      resetForm();

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

              {/* Accent Line */}

              <div className="mb-5 h-1 w-14 rounded-full bg-purple-600" />

              {/* Main Heading */}

              <h2 className="text-3xl font-bold leading-tight text-purple-950 lg:text-4xl xl:text-5xl">

                Create.

                <br />

                Learn.

                <br />

                <span className="text-purple-600">
                  Score Better.
                </span>

              </h2>

              {/* Description */}

              <p className="mt-6 max-w-md text-sm leading-6 text-gray-600 lg:text-base lg:leading-7 xl:text-lg">

                Begin your academic journey
                with ScoreWell and create
                an account designed to help
                you learn, practice and
                perform with confidence.

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

            {/* Education Quote */}

            <div className="relative z-10 mt-10 max-w-md">

              <div className="mb-4 h-px w-full bg-purple-200" />

              <div className="text-5xl font-serif leading-none text-orange-500">
                “
              </div>

              <blockquote className="-mt-2 text-lg font-medium leading-7 text-purple-950 lg:text-xl lg:leading-8">

                Education is the first step
                toward turning curiosity
                into achievement.

              </blockquote>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-purple-600">

                Start Learning • Build Your Future

              </p>

            </div>

          </section>

          {/* =====================================================
              RIGHT REGISTRATION SECTION
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

                  CREATE ACCOUNT

                </div>

                <h1 className="text-2xl font-bold text-purple-950 sm:text-3xl">

                  Join{" "}

                  <span className="text-purple-600">
                    ScoreWell
                  </span>

                </h1>

                <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">

                  Create your account and
                  begin your journey toward
                  better learning and assessment.

                </p>

              </div>

              {/* =================================================
                  FORM CARD
              ================================================== */}

              <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-[0_15px_45px_rgba(91,33,182,0.14),0_4px_12px_rgba(0,0,0,0.06)] ring-1 ring-purple-100/60 sm:rounded-3xl sm:p-7">

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-5"
                >

                  {/* ERROR */}

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="register-name"
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="register-email"
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                  {/* ACCOUNT TYPE */}

                  <div>

                    <label
                      htmlFor="register-role"
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                      disabled={
                        !role ||
                        loading
                      }
                      required={
                        !useNewDepartment
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                        !role
                          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
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

                      {role ===
                        "INSTRUCTOR" && (
                        <option value="__ADD_NEW__">
                          + Add New Department
                        </option>
                      )}

                    </select>

                    {/* NEW DEPARTMENT */}

                    {role ===
                      "INSTRUCTOR" &&
                      useNewDepartment && (
                        <div className="mt-3">

                          <input
                            type="text"
                            value={
                              newDepartment
                            }
                            onChange={(event) =>
                              setNewDepartment(
                                event.target.value
                              )
                            }
                            placeholder="Enter new department name"
                            required
                            disabled={loading}
                            className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                          />

                          <p className="mt-2 text-xs text-gray-500">

                            This department will
                            become available for
                            future students after
                            the instructor is
                            registered.

                          </p>

                        </div>
                      )}

                    {!role && (
                      <p className="mt-2 text-xs text-gray-400">
                        Select Student or Instructor first.
                      </p>
                    )}

                  </div>

                  {/* PASSWORD */}

                  <div>

                    <label
                      htmlFor="register-password"
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                        disabled={loading}
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
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-xs font-semibold text-purple-700 hover:text-purple-900 disabled:opacity-50"
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
                      className="mb-2 block text-xs font-semibold text-gray-700 sm:text-sm"
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
                        value={
                          confirmPassword
                        }
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        placeholder="Confirm your password"
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

                  {/* CREATE ACCOUNT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-xl bg-purple-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {loading ? (
                      <span className="flex items-center gap-2">

                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                        Creating Account...

                      </span>
                    ) : (
                      "Create Account"
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

                {/* LOGIN */}

                <div className="text-center">

                  <p className="text-sm text-gray-500">
                    Already have an account?
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/")
                    }
                    disabled={loading}
                    className="mt-2 font-bold text-purple-700 transition hover:text-purple-900"
                  >
                    Login
                  </button>

                </div>

              </div>

              {/* Security Text */}

              <div className="mt-5 text-center">

                <p className="text-xs leading-5 text-gray-400">

                  Start your academic journey
                  with ScoreWell.

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