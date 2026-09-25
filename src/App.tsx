import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ForgotPassword from "./pages/login/ForgotPassword";

// =========================================================
// STUDENT
// =========================================================

import StudentDashboard, {
  StudentHome,
} from "./pages/student/StudentDashboard";

import NewExams from "./pages/student/NewExams";
import MyPerformance from "./pages/student/MyPerformance";
import StudentProfile from "./pages/student/StudentProfile";

// =========================================================
// INSTRUCTOR
// =========================================================

import InstructorDashboard, {
  InstructorHome,
} from "./pages/instructor/InstructorDashboard";

import CreateQuestionSet from "./pages/instructor/CreateQuestionSet";

import StudentsExaminationStatus from "./pages/instructor/StudentsExaminationStatus";

import CreateExam from "./pages/instructor/CreateExam";

import NewlyRequestedStudent from "./pages/instructor/NewlyRequestedStudent";

import InstructorProfile from "./pages/instructor/InstructorProfile";

// =========================================================
// APP
// =========================================================

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
            NESTED ROUTES
        ================================================= */}

        <Route
          path="/student"
          element={<StudentDashboard />}
        >

          {/* STUDENT HOME */}
          <Route
            index
            element={<StudentHome />}
          />

          {/* AVAILABLE EXAMINATIONS */}
          <Route
            path="new-exams"
            element={<NewExams />}
          />

          {/* MY PERFORMANCE */}
          <Route
            path="my-performance"
            element={<MyPerformance />}
          />

          {/* STUDENT PROFILE */}
          <Route
            path="profile"
            element={<StudentProfile />}
          />

        </Route>


        {/* =================================================
            INSTRUCTOR
            NESTED ROUTES
        ================================================= */}

        <Route
          path="/instructor"
          element={<InstructorDashboard />}
        >

          {/* INSTRUCTOR HOME */}
          <Route
            index
            element={<InstructorHome />}
          />

          {/* CREATE QUESTION SET */}
          <Route
            path="create-question-set"
            element={<CreateQuestionSet />}
          />

          {/* STUDENTS EXAMINATION STATUS */}
          <Route
            path="students-examination-status"
            element={
              <StudentsExaminationStatus />
            }
          />

          {/* CREATE EXAM */}
          <Route
            path="create-exam"
            element={<CreateExam />}
          />

          {/* NEWLY REQUESTED STUDENT */}
          <Route
            path="newly-requested-student"
            element={
              <NewlyRequestedStudent />
            }
          />

          {/* INSTRUCTOR PROFILE */}
          <Route
            path="profile"
            element={<InstructorProfile />}
          />

        </Route>


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