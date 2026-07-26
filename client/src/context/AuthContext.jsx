import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("hms_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user session from localStorage if token exists
    const storedUser = localStorage.getItem("hms_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user", e);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        if (data && data.message) {
          throw new Error(data.message);
        }
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          throw new Error("Backend server is starting up (Render cold start). Please wait 10-15 seconds and click Sign In again.");
        }
        if (res.status === 404) {
          throw new Error("Backend API endpoint not found. Please check backend server.");
        }
        throw new Error(`Server error (${res.status}). Please check backend connection.`);
      }

      if (!data.token) {
        throw new Error("Authentication failed: No token received from server.");
      }

      localStorage.setItem("hms_token", data.token);
      localStorage.setItem("hms_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Unable to connect to backend server." };
    }
  };

  const logout = () => {
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    setToken(null);
    setUser(null);
  };

  // Helper fetch method that appends token
  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    // Auto logout if backend reports invalid token or deactivation
    if (res.status === 401) {
      logout();
    }

    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
