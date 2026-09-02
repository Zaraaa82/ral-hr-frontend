// src/components/SignInForm/SignInForm.jsx

import { useState } from "react";
import { useNavigate } from "react-router";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const SignInForm = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    workEmail: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const signedInUser = await signIn(formData);

      setUser(signedInUser);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to sign in. Please check your details."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-card lg:grid-cols-[42%_58%]">
      {/* Branding panel */}
      <section className="relative hidden overflow-hidden bg-ink p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-lavender/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-lavender/10 blur-3xl"
        />

        <div className="relative z-10">
          <img
            src="/RAL-logo.png"
            alt="RAL"
            className="w-55 object-contain"
          />
        </div>

        <div className="relative z-10 max-w-md">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-lavender/20 bg-lavender/10 text-lavender">
            <ShieldCheck size={25} />
          </span>

          <h1 className="text-4xl font-bold leading-tight text-white">
            Welcome to RAL HR
          </h1>

          <p className="mt-5 max-w-sm leading-7 text-lavender/70">
            A central place for employees, managers and HR to manage attendance, leave
            requests, payslips and employee information.
          </p>
        </div>

        <p className="relative z-10 text-sm text-lavender/50">
          Secure access for RAL employees
        </p>
      </section>

      {/* Sign-in panel */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 text-center lg:hidden">
            <div className="inline-block rounded-2xl bg-ink px-7 py-5">
              <img
                src="/RAL-logo-white-transparent-tight.png"
                alt="RAL"
                className="w-36 object-contain"
              />
            </div>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-soft">
              HR Management System
            </p>
          </div>

          <div className="rounded-2xl border border-rule bg-white p-7 shadow-xl shadow-ink/5 sm:p-9">
            <header className="mb-8">
              <p className="mb-2 text-sm font-semibold text-soft">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold text-ink">
                {t("auth.signIn.title")}
              </h2>

              <p className="mt-2 text-sm text-soft">
                Enter your work credentials to continue.
              </p>
            </header>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-stop/20 bg-red-50 px-4 py-3 text-sm text-stop"
              >
                {error}
              </div>
            )}

            <form
              autoComplete="on"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="workEmail"
                  className="mb-2 block text-sm font-semibold text-mid"
                >
                  Work email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft"
                  />

                  <input
                    type="email"
                    autoComplete="username"
                    id="workEmail"
                    value={formData.workEmail}
                    name="workEmail"
                    onChange={handleChange}
                    required
                    placeholder="name@ral.com"
                    className="w-full rounded-xl border border-rule bg-white py-3 pl-11 pr-4 text-ink outline-none transition placeholder:text-soft/60 focus:border-mid focus:ring-4 focus:ring-lavender/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-mid"
                >
                  {t("auth.signIn.password")}
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft"
                  />

                  <input
                    type="password"
                    autoComplete="current-password"
                    id="password"
                    value={formData.password}
                    name="password"
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-rule bg-white py-3 pl-11 pr-4 text-ink outline-none transition placeholder:text-soft/60 focus:border-mid focus:ring-4 focus:ring-lavender/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-ink px-5 py-3.5 font-semibold text-white transition hover:bg-mid focus:outline-none focus:ring-4 focus:ring-lavender disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : t("auth.signIn.submit")}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-soft">
              Access is restricted to authorized RAL employees.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignInForm;