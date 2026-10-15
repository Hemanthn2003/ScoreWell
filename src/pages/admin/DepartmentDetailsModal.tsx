import { useEffect } from "react";
import { AlertCircle, Check, Trash2, UserCheck, UserRound, UserX, X } from "lucide-react";

type Person = { _id: string; name: string; email: string; isActive: boolean };
type Department = {
  name: string;
  studentCount: number;
  approvedInstructorCount: number;
  instructors: Person[];
  requestedInstructors: Person[];
};
type InstructorAction = "approve" | "suspend" | "dismiss";

interface DepartmentDetailsModalProps {
  department: Department;
  actionId: string | null;
  onClose: () => void;
  onInstructorAction: (id: string, action: InstructorAction) => void;
}

const DepartmentDetailsModal = ({
  department,
  actionId,
  onClose,
  onInstructorAction,
}: DepartmentDetailsModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const personCard = (person: Person, section: "approved" | "requested") => (
    <div key={person._id} className="flex flex-col gap-3 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 text-purple-700"><UserRound size={20} /></div>
        <div className="min-w-0"><p className="truncate text-sm font-bold text-gray-900">{person.name}</p><p className="truncate text-xs text-gray-500">{person.email}</p><p className="mt-1 text-[11px] text-gray-400">{person.isActive ? "Currently active" : "Not active"}</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {section === "requested" ? <>
          <button disabled={actionId === person._id} onClick={() => onInstructorAction(person._id, "approve")} className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-purple-800 disabled:opacity-50"><Check size={14} /> Approve</button>
          <button disabled={actionId === person._id} onClick={() => onInstructorAction(person._id, "dismiss")} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"><Trash2 size={14} /> Deny & Delete</button>
        </> : <>
          <button disabled={actionId === person._id} onClick={() => onInstructorAction(person._id, "suspend")} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"><UserX size={14} /> Suspend</button>
          <button disabled={actionId === person._id} onClick={() => onInstructorAction(person._id, "dismiss")} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"><Trash2 size={14} /> Dismiss</button>
        </>}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="department-details-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-purple-100 p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-600">Department details</p>
            <h2 id="department-details-title" className="mt-1 text-2xl font-extrabold text-purple-950">{department.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-purple-50 px-3 py-1.5 text-purple-800">{department.studentCount} students</span>
              <span className="rounded-full bg-green-50 px-3 py-1.5 text-green-700">{department.approvedInstructorCount} approved instructors</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close department details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-purple-50 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <X size={21} />
          </button>
        </div>
        <div className="grid gap-7 overflow-y-auto p-5 sm:p-6 xl:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2"><UserCheck className="text-purple-700" size={20} /><h3 className="text-lg font-extrabold text-purple-950">Instructors</h3><span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">{department.instructors.length}</span></div>
            <div className="space-y-3">{department.instructors.length ? department.instructors.map((person) => personCard(person, "approved")) : <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">No approved instructors in this department.</p>}</div>
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2"><AlertCircle className="text-orange-500" size={20} /><h3 className="text-lg font-extrabold text-purple-950">Requested Instructors</h3><span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">{department.requestedInstructors.length}</span></div>
            <div className="space-y-3">{department.requestedInstructors.length ? department.requestedInstructors.map((person) => personCard(person, "requested")) : <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">No pending instructor requests.</p>}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DepartmentDetailsModal;
