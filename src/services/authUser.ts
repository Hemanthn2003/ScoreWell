export type ScoreWellUser = {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  department?: string | null;
  isActive?: boolean;
  isPermitted?: boolean;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

let userCache: ScoreWellUser | null = null;
let userRequest: Promise<ScoreWellUser> | null = null;

export const getCurrentUser = async (): Promise<ScoreWellUser> => {
  if (userCache) return userCache;

  if (userRequest) return userRequest;

  userRequest = (async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(
          data.message || "Unable to fetch logged-in user."
        );
      }

      userCache = data.user as ScoreWellUser;
      return userCache;
    } catch (error) {
      userRequest = null;
      throw error;
    }
  })();

  return userRequest;
};

export const setCurrentUser = (user: ScoreWellUser | null): void => {
  userCache = user;
  userRequest = user ? Promise.resolve(user) : null;
};

export const clearCurrentUser = (): void => {
  userCache = null;
  userRequest = null;
};
