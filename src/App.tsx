import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ForgotPassword from "./pages/login/ForgotPassword";

import StudentDashboard, {
  StudentHome,
} from "./pages/student/StudentDashboard";

import NewExams from "./pages/student/NewExams";
import MyPerformance from "./pages/student/MyPerformance";
import StudentProfile from "./pages/student/StudentProfile";

import InstructorDashboard, {
  InstructorHome,
} from "./pages/instructor/InstructorDashboard";

import CreateQuestionSet from "./pages/instructor/CreateQuestionSet";
import StudentsExaminationStatus from "./pages/instructor/StudentsExaminationStatus";
import CreateExam from "./pages/instructor/CreateExam";
import NewlyRequestedStudent from "./pages/instructor/NewlyRequestedStudent";
import StudentPerformance from "./pages/instructor/StudentPerformance";
import InstructorProfile from "./pages/instructor/InstructorProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        <Route
          path="/student"
          element={<StudentDashboard />}
        >
          <Route
            index
            element={<StudentHome />}
          />

          <Route
            path="new-exams"
            element={<NewExams />}
          />

          <Route
            path="my-performance"
            element={<MyPerformance />}
          />

          <Route
            path="profile"
            element={<StudentProfile />}
          />
        </Route>

        <Route
          path="/instructor"
          element={<InstructorDashboard />}
        >
          <Route
            index
            element={<InstructorHome />}
          />

          <Route
            path="create-question-set"
            element={<CreateQuestionSet />}
          />

          <Route
            path="students-examination-status"
            element={
              <StudentsExaminationStatus />
            }
          />

          <Route
            path="create-exam"
            element={<CreateExam />}
          />

          <Route
            path="newly-requested-student"
            element={
              <NewlyRequestedStudent />
            }
          />

          <Route
            path="student/:id/performance"
            element={
              <StudentPerformance />
            }
          />

          <Route
            path="profile"
            element={<InstructorProfile />}
          />
        </Route>

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
