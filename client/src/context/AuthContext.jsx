import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Helper to resolve API endpoint URL dynamically
export const getApiUrl = (endpoint) => {
  if (!endpoint) return "";
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}${endpoint}`;
  }
  
  if (typeof window !== "undefined") {
    const { hostname, port, protocol } = window.location;
    // Check if developing locally across any IP/hostname/dev port
    const isDevEnvironment =
      import.meta.env.DEV ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local") ||
      port === "5173" ||
      port === "3000";

    if (isDevEnvironment) {
      return `${protocol}//${hostname}:5000${endpoint}`;
    }
  }

  return endpoint;
};

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
      const targetUrl = getApiUrl("/api/auth/login");
      const res = await fetch(targetUrl, {
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
          throw new Error(`API endpoint '${targetUrl}' returned 404. Please ensure backend server is running on port 5000.`);
        }
        throw new Error(`Server error (${res.status}) calling ${targetUrl}. Please check backend server.`);
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
    
    const targetUrl = getApiUrl(url);
    const res = await fetch(targetUrl, {
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
