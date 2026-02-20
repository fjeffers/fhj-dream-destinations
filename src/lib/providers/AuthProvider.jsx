// ==========================================================
// 📄 FILE: AuthProvider.jsx
// Location: src/lib/providers/AuthProvider.jsx
// ==========================================================

import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext({ user: null, setUser: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
