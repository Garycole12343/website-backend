import React, { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const onStorage = () => {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (userObj) => {
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("userEmail", userObj?.email || "");
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: !!user,
      userEmail: user?.email || localStorage.getItem("userEmail") || "",
      login,
      logout
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
