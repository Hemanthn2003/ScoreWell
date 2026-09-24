import { useEffect, useState } from "react";

interface UserProfile {
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  department?: string | null;
  isActive?: boolean;
  isPermitted?: boolean;
}

function StudentProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load profile."
          );
        }

        setUser(data.user);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 via-white to-orange-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
            Student Account
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Profile Details
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View your ScoreWell account information.
          </p>
        </div>


        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-purple-100 bg-white p-10 text-center shadow-lg shadow-purple-100/40">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading profile...
            </p>
          </div>
        )}


        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-lg">
            <div className="rounded-2xl bg-red-50 p-5">
              <p className="font-semibold text-red-700">
                Unable to load profile
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}


        {/* Profile */}
        {!loading && !error && user && (
          <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-xl shadow-purple-100/50">

            {/* Profile Banner */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 px-6 py-8 sm:px-8">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/80 bg-white text-3xl font-bold text-purple-700 shadow-lg">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : "S"}
                </div>

                <div className="text-white">
                  <p className="text-sm font-medium text-purple-100">
                    ScoreWell Student
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {user.name}
                  </h2>

                  <p className="mt-1 text-sm text-white/80">
                    {user.email}
                  </p>
                </div>

              </div>
            </div>


            {/* Details */}
            <div className="p-6 sm:p-8">

              <h3 className="text-lg font-bold text-gray-900">
                Personal Information
              </h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                {/* Name */}
                <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                    Full Name
                  </p>

                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {user.name}
                  </p>
                </div>


                {/* Email */}
                <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                    Email Address
                  </p>

                  <p className="mt-2 break-all text-base font-semibold text-gray-900">
                    {user.email}
                  </p>
                </div>


                {/* Role */}
                <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                    Account Role
                  </p>

                  <p className="mt-2 text-base font-semibold text-gray-900">
                    Student
                  </p>
                </div>


                {/* Department */}
                <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                    Department
                  </p>

                  <p className="mt-2 text-base font-semibold text-gray-900">
                    {user.department || "Not specified"}
                  </p>
                </div>

              </div>


              {/* Account Status */}
              <div className="mt-8">

                <h3 className="text-lg font-bold text-gray-900">
                  Account Status
                </h3>

                <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-5">

                  <div className="flex items-center gap-3">

                    <span className="flex h-3 w-3 rounded-full bg-green-500" />

                    <div>
                      <p className="font-semibold text-green-800">
                        Account Active
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        Your ScoreWell student account is currently active.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default StudentProfile;