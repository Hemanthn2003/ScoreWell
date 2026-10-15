import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, ChevronDown, ChevronUp, GraduationCap, Loader2, ShieldCheck, Users } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Modal from "../../components/Modal";
import DepartmentDetailsModal from "./DepartmentDetailsModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Person = { _id: string; name: string; email: string; department?: string | null; isActive: boolean; isPermitted: boolean };
type Department = {
  name: string; studentCount: number; instructorCount: number; approvedInstructorCount: number;
  requestedInstructorCount: number; students: Person[]; instructors: Person[]; requestedInstructors: Person[];
};
type ModalState = { isOpen: boolean; title: string; message: string; type: "success" | "error" | "info" };

const initialModal: ModalState = { isOpen: false, title: "", message: "", type: "info" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>(initialModal);

  const showModal = (title: string, message: string, type: ModalState["type"]) => setModal({ isOpen: true, title, message, type });

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/api/admin/departments`, { credentials: "include" });
      const data = await response.json();
      if (response.status === 401 || response.status === 403) {
        navigate("/", { replace: true });
        return;
      }
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load departments.");
      setDepartments(Array.isArray(data.departments) ? data.departments : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load department data.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { void loadDepartments(); }, [loadDepartments]);

  const runInstructorAction = async (id: string, action: "approve" | "suspend" | "dismiss") => {
    const actionLabels = { approve: "approve this instructor", suspend: "suspend this instructor", dismiss: "permanently delete this instructor account" };
    if (action === "dismiss" && !window.confirm(`Are you sure you want to ${actionLabels[action]}? This cannot be undone.`)) return;
    try {
      setActionId(id);
      const response = await fetch(
        `${API_URL}/api/admin/instructors/${id}${action === "dismiss" ? "" : `/${action}`}`,
        { method: action === "dismiss" ? "DELETE" : "PATCH", credentials: "include" },
      );
      const data = await response.json();
      if (response.status === 401 || response.status === 403) { navigate("/", { replace: true }); return; }
      if (!response.ok || !data.success) throw new Error(data.message || `Unable to ${action} instructor.`);
      await loadDepartments();
      showModal("Action Completed", data.message || "Instructor updated successfully.", "success");
    } catch (err) {
      showModal("Action Failed", err instanceof Error ? err.message : "Please try again.", "error");
    } finally {
      setActionId(null);
    }
  };

  const selected = departments.find((item) => item.name === selectedDepartment);
  const totalStudents = departments.reduce((sum, item) => sum + item.studentCount, 0);
  const totalRequests = departments.reduce((sum, item) => sum + item.requestedInstructorCount, 0);

  return <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-orange-50">
    <Header />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800"><ShieldCheck size={14} /> ADMINISTRATION</p><h1 className="text-3xl font-extrabold tracking-tight text-purple-950 sm:text-4xl">Department Overview</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Review student strength, manage instructor requests, and control instructor access across departments.</p></div>
        <button onClick={() => void loadDepartments()} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-bold text-purple-800 shadow-sm hover:bg-purple-50 sm:self-auto"><Loader2 size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-500">Departments</span><BookOpen className="text-purple-600" size={21} /></div><p className="mt-3 text-3xl font-extrabold text-purple-950">{departments.length}</p></div>
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-500">Total Students</span><GraduationCap className="text-purple-600" size={21} /></div><p className="mt-3 text-3xl font-extrabold text-purple-950">{totalStudents}</p></div>
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-500">Instructor Requests</span><AlertCircle className="text-orange-500" size={21} /></div><p className="mt-3 text-3xl font-extrabold text-orange-600">{totalRequests}</p></div>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-semibold text-purple-700"><Loader2 className="animate-spin" /> Loading department data...</div> : departments.length === 0 ? <div className="rounded-3xl border border-dashed border-purple-200 bg-white/80 px-6 py-14 text-center"><Users className="mx-auto text-purple-400" size={36} /><h2 className="mt-4 text-lg font-bold text-purple-950">No departments yet</h2><p className="mt-2 text-sm text-gray-500">Departments will appear when students or instructors register.</p></div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => { const isSelected = selectedDepartment === department.name; return <button key={department.name} type="button" onClick={() => setSelectedDepartment(isSelected ? null : department.name)} className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${isSelected ? "border-purple-400 ring-2 ring-purple-100" : "border-purple-100 hover:border-purple-200"}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-purple-600">Department</p><h2 className="mt-1 text-lg font-extrabold text-purple-950">{department.name}</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 text-purple-700"><BookOpen size={19} /></span></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-purple-50 p-3"><p className="text-xs font-medium text-gray-500">Student strength</p><p className="mt-1 text-2xl font-extrabold text-purple-900">{department.studentCount}</p></div><div className="rounded-xl bg-orange-50 p-3"><p className="text-xs font-medium text-gray-500">Instructors</p><p className="mt-1 text-2xl font-extrabold text-orange-700">{department.instructorCount}</p></div></div>
          <div className="mt-4 flex items-center justify-between"><span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">{department.requestedInstructorCount} pending request{department.requestedInstructorCount === 1 ? "" : "s"}</span>{isSelected ? <ChevronUp size={18} className="text-purple-700" /> : <ChevronDown size={18} className="text-purple-500" />}</div>
        </button>; })}
      </div>}

      {selected && <DepartmentDetailsModal
        department={selected}
        actionId={actionId}
        onClose={() => setSelectedDepartment(null)}
        onInstructorAction={(id, action) => void runInstructorAction(id, action)}
      />}
    </main>
    <Footer />
    <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal((current) => ({ ...current, isOpen: false }))} closeButtonText="Continue" />
  </div>;
}
