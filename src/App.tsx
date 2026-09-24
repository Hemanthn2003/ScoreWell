import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ForgotPassword from "./pages/login/ForgotPassword";

import StudentDashboard from "./pages/student/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";

import Header from "./components/Header";

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">

      <Header />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-lg shadow-purple-100/40">

          <h1 className="text-2xl font-bold text-gray-900">
            {title}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>

        </div>

      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* =================================================
            STUDENT
        ================================================= */}

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/new-exams"
          element={
            <PlaceholderPage
              title="New Exams"
              description="View examinations currently available for you."
            />
          }
        />

        <Route
          path="/student/my-performance"
          element={
            <PlaceholderPage
              title="My Performance"
              description="View your examination performance and results."
            />
          }
        />

        {/* =================================================
            INSTRUCTOR
        ================================================= */}

        <Route
          path="/instructor"
          element={<InstructorDashboard />}
        />

        <Route
          path="/instructor/create-question-set"
          element={
            <PlaceholderPage
              title="Create Question Set"
              description="Create and manage examination question sets."
            />
          }
        />

        <Route
          path="/instructor/students-examination-status"
          element={
            <PlaceholderPage
              title="Students Examination Status"
              description="Monitor student examination activity and status."
            />
          }
        />

        <Route
          path="/instructor/create-exam"
          element={
            <PlaceholderPage
              title="Create Exam"
              description="Create and publish a new examination."
            />
          }
        />

        <Route
          path="/instructor/newly-requested-student"
          element={
            <PlaceholderPage
              title="Newly Requested Student"
              description="Review and manage newly requested student accounts."
            />
          }
        />

        {/* =================================================
            COMMON PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <PlaceholderPage
              title="Profile Details"
              description="View and manage your ScoreWell profile."
            />
          }
        />

        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;