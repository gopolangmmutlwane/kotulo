import { createContext, useContext, useState, type ReactNode } from "react";

type UserRole = "household" | "b2b" | "vendor" | "operations" | "admin";

interface RoleContextValue {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  isRole: (role: UserRole) => boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("household");

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const isRole = (role: UserRole) => currentRole === role;

  return (
    <RoleContext.Provider value={{ currentRole, setRole, isRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}