import React, { createContext, useContext, useState, useEffect } from "react";

// Initial Demo Users
const INITIAL_USERS = [
  {
    _id: "usr_000",
    fullName: "Omar Hassan",
    employeeCode: "EMP-001",
    role: "HR Admin",
    department: "HR",
    jobTitle: "Head of People & Operations",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    personalEmail: "omar.hassan@company.com",
    workEmail: "omar.hassan@company.com",
    phone: "+973 3912 3456",
    basicSalaryFils: 2200000,
    allowancesFils: 300000,
    isBahraini: true,
    status: "active",
    employmentStatus: "Active",
  },
  {
    _id: "usr_002",
    fullName: "Ali Khalil",
    employeeCode: "EMP-002",
    role: "Manager",
    department: "Engineering",
    jobTitle: "Lead Engineering Manager",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    personalEmail: "ali.khalil@company.com",
    workEmail: "ali.khalil@company.com",
    phone: "+973 3922 4567",
    basicSalaryFils: 1800000,
    allowancesFils: 200000,
    isBahraini: true,
    status: "active",
    employmentStatus: "Active",
  },
  {
    _id: "usr_001",
    fullName: "Sara Al-Buarki",
    employeeCode: "EMP-003",
    role: "Employee",
    department: "Engineering",
    jobTitle: "Senior Frontend Engineer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    personalEmail: "sara.albuarki@company.com",
    workEmail: "sara.albuarki@company.com",
    phone: "+973 3933 5678",
    basicSalaryFils: 1400000,
    allowancesFils: 150000,
    isBahraini: true,
    status: "active",
    employmentStatus: "Active",
  },
];

const INITIAL_ATTENDANCE = [
  {
    _id: "att_001",
    employeeId: "usr_001",
    employeeName: "Sara Al-Buarki",
    employeeCode: "EMP-003",
    date: "2026-08-31",
    clockIn: "08:32",
    clockOut: "17:05",
    workedMinutes: 513,
    overtimeMinutes: 33,
    status: "Present",
  },
  {
    _id: "att_002",
    employeeId: "usr_002",
    employeeName: "Ali Khalil",
    employeeCode: "EMP-002",
    date: "2026-08-31",
    clockIn: "08:15",
    clockOut: "17:15",
    workedMinutes: 540,
    overtimeMinutes: 60,
    status: "Present",
  },
  {
    _id: "att_003",
    employeeId: "usr_000",
    employeeName: "Omar Hassan",
    employeeCode: "EMP-001",
    date: "2026-08-31",
    clockIn: "08:28",
    clockOut: null,
    workedMinutes: 0,
    overtimeMinutes: 0,
    status: "Present",
  },
];

// Create context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Default to HR Admin
  const [attendanceRecords, setAttendanceRecords] =
    useState(INITIAL_ATTENDANCE);

  const isAuthenticated = currentUser !== null;
  const role = currentUser?.role || "Employee";

  const login = (email, requestedRole) => {
    const found = users.find(
      (u) =>
        u.personalEmail?.toLowerCase() === email.toLowerCase() ||
        u.workEmail?.toLowerCase() === email.toLowerCase(),
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    const newUser = {
      _id: `usr_${Date.now()}`,
      fullName: email.split("@")[0] || "Staff Member",
      employeeCode: `EMP-${String(users.length + 1).padStart(3, "0")}`,
      role: requestedRole || "Employee",
      department: "Engineering",
      jobTitle: "Team Member",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      personalEmail: email,
      workEmail: email,
      status: "active",
      employmentStatus: "Active",
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return true;
  };

  const loginAsUser = (userId) => {
    const u = users.find((item) => item._id === userId);
    if (u) setCurrentUser(u);
  };

  const signup = (userData) => {
    const newUser = {
      _id: `usr_${Date.now()}`,
      fullName: userData.fullName || "New Employee",
      employeeCode: `EMP-${String(users.length + 1).padStart(3, "0")}`,
      role: userData.role || "Employee",
      department: userData.department || "Engineering",
      jobTitle: userData.jobTitle || "Specialist",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      personalEmail: userData.personalEmail || "user@example.com",
      workEmail: userData.workEmail || "user@company.com",
      phone: userData.phone || "+973 39000000",
      status: "active",
      employmentStatus: "Active",
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
  };

  const logout = () => setCurrentUser(null);

  const switchRole = (newRole) => {
    const matching = users.find((u) => u.role === newRole);
    if (matching) setCurrentUser(matching);
    else if (currentUser) setCurrentUser({ ...currentUser, role: newRole });
  };

  const clockIn = (record) => {
    setAttendanceRecords((prev) => [record, ...prev]);
  };

  const clockOut = (recordId, outTime, workedMin) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r._id === recordId
          ? { ...r, clockOut: outTime, workedMinutes: workedMin }
          : r,
      ),
    );
  };

  const requestCorrection = (recordId, inTime, outTime, reason) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r._id === recordId
          ? {
              ...r,
              correctionRequest: {
                requestedBy: currentUser?._id || "usr_002",
                requestedByName: currentUser?.fullName || "Manager",
                correctedClockIn: inTime,
                correctedClockOut: outTime,
                reason,
                status: "pending",
              },
            }
          : r,
      ),
    );
  };

  const applyCorrection = (recordId, inTime, outTime, status, hrNote) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r._id !== recordId) return r;
        return {
          ...r,
          clockIn: status === "applied" ? inTime : r.clockIn,
          clockOut: status === "applied" ? outTime : r.clockOut,
          correctionRequest: r.correctionRequest
            ? {
                ...r.correctionRequest,
                status,
                reviewedBy: currentUser?._id,
                reviewedByName: currentUser?.fullName,
                hrNote,
              }
            : undefined,
        };
      }),
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        role,
        isAuthenticated,
        login,
        loginAsUser,
        signup,
        logout,
        switchRole,
        attendanceRecords,
        clockIn,
        clockOut,
        requestCorrection,
        applyCorrection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
