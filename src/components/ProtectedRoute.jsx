//

import React from "react";
import { Navigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowRight, UserCheck } from "lucide-react";

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, currentUser, role, switchRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // HR Admin can access Manager routes
    if (requiredRole === "Manager" && role === "HR Admin") {
      return <>{children}</>;
    }

    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-5 animate-in fade-in">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Access Restricted: {requiredRole} Required
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            You are currently logged in as{" "}
            <strong>{currentUser?.fullName}</strong> with role{" "}
            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
              {role}
            </span>
            . This page requires <strong>{requiredRole}</strong> clearance.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Switch Persona for Demo:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => switchRole(requiredRole)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to {requiredRole}</span>
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
