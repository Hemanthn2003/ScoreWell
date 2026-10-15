import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, UserRound, Building2, Loader2 } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
type AdminUser = { _id: string; name: string; email: string; role: "ADMIN"; department?: string | null; isActive?: boolean; isPermitted?: boolean };

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
        const data = await response.json();
        if (!response.ok || !data.success || data.user?.role !== "ADMIN") {
          navigate("/", { replace: true });
          return;
        }
        setUser(data.user);
      } catch {
        setError("Unable to load your profile. Please check that the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [navigate]);

  return <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-orange-50"><Header /><main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
    <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600">Account</p><h1 className="mt-2 text-3xl font-extrabold text-purple-950">Admin Profile</h1><p className="mt-2 text-sm text-gray-600">Your ScoreWell administrator account details.</p></div>
    {loading ? <div className="flex min-h-48 items-center justify-center gap-3 text-purple-700"><Loader2 className="animate-spin" /> Loading profile...</div> : error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : user && <section className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-lg shadow-purple-100/60">
      <div className="flex flex-col items-center gap-4 bg-gradient-to-r from-purple-100 via-white to-orange-100 px-6 py-8 text-center sm:flex-row sm:text-left"><div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-purple-950 text-white shadow-lg"><UserRound size={38} /></div><div><span className="inline-flex items-center gap-1 rounded-full bg-purple-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"><ShieldCheck size={13} /> Administrator</span><h2 className="mt-2 text-2xl font-extrabold text-purple-950">{user.name}</h2><p className="mt-1 text-sm text-gray-600">Full access to department and instructor administration.</p></div></div>
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2"><div className="rounded-2xl border border-purple-100 p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><Mail size={16} className="text-purple-600" /> Email address</div><p className="mt-3 break-all text-sm font-semibold text-gray-900">{user.email}</p></div><div className="rounded-2xl border border-purple-100 p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500"><Building2 size={16} className="text-orange-500" /> Account role</div><p className="mt-3 text-sm font-semibold text-gray-900">ADMIN</p></div></div>
      <div className="border-t border-purple-100 px-6 py-4"><button onClick={() => navigate("/admin")} className="rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-800">Back to dashboard</button></div>
    </section>}
  </main><Footer /></div>;
}
