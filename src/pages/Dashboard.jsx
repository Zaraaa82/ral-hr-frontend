import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-card px-8 py-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-soft">RAL HR</p>

        <h1 className="text-3xl font-bold text-ink">
          {t("dashboard.welcomeMessage")} {user.fullName}
        </h1>

        <p className="mt-2 text-mid">Welcome to your HR dashboard.</p>
      </div>
    </main>
  );
}

export default Dashboard;
