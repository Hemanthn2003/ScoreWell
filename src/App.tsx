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

          {/* -----------------------------------------------
              STUDENT HOME
              /student
          ----------------------------------------------- */}

          <Route
            index
            element={<StudentHome />}
          />


          {/* -----------------------------------------------
              AVAILABLE EXAMINATIONS
              /student/new-exams
          ----------------------------------------------- */}

          <Route
            path="new-exams"
            element={<NewExams />}
          />


          {/* -----------------------------------------------
              MY ATTEMPTS
              /student/my-performance
          ----------------------------------------------- */}

          <Route
            path="my-performance"
            element={<MyPerformance />}
          />


          {/* -----------------------------------------------
              STUDENT PROFILE
              /student/profile
          ----------------------------------------------- */}

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

          {/* -----------------------------------------------
              INSTRUCTOR HOME
              /instructor
          ----------------------------------------------- */}

          <Route
            index
            element={<InstructorHome />}
          />


          {/* -----------------------------------------------
              CREATE QUESTION SET
              /instructor/create-question-set
          ----------------------------------------------- */}

          <Route
            path="create-question-set"
            element={<CreateQuestionSet />}
          />


          {/* -----------------------------------------------
              STUDENTS EXAMINATION STATUS
              /instructor/students-examination-status
          ----------------------------------------------- */}

          <Route
            path="students-examination-status"
            element={<StudentsExaminationStatus />}
          />


          {/* -----------------------------------------------
              CREATE EXAM
              /instructor/create-exam
          ----------------------------------------------- */}

          <Route
            path="create-exam"
            element={<CreateExam />}
          />


          {/* -----------------------------------------------
              NEWLY REQUESTED STUDENT
              /instructor/newly-requested-student
          ----------------------------------------------- */}

          <Route
            path="newly-requested-student"
            element={<NewlyRequestedStudent />}
          />


          {/* -----------------------------------------------
              INSTRUCTOR PROFILE
              /instructor/profile
          ----------------------------------------------- */}

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