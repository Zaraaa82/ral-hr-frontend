// src/components/SignInForm/SignInForm.jsx

import { useState, useContext } from "react";
import { useNavigate } from "react-router";

import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const SignInForm = ({ }) => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    workEmail: "",
    password: "",
  });
  const { t } = useTranslation();

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
  }
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const signedInUser = await signIn(formData);

      setUser(signedInUser);
      navigate("/dashboard");
    } catch (err) {
      console.log(`Error: ${err}`);
      setError(err?.response?.data?.message);
    }
  }

  return (
    <main className="min-h-screen bg-card flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-rule">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink">
            {t('auth.signIn.title')}
          </h1>

          <p className="mt-2 text-soft">
            Sign in to your account
          </p>
        </div>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 border border-stop/30 px-4 py-3 text-sm text-stop">
            {error}
          </p>
        )}

        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div>
            <label
              htmlFor="workEmail"
              className="block mb-2 text-sm font-medium text-mid"
            >
              {t('Email')}:
            </label>

            <input
              type="text"
              autoComplete="off"
              id="workEmail"
              value={formData.workEmail}
              name="workEmail"
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none transition focus:border-ink focus:ring-2 focus:ring-lavender"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-mid"
            >
              {t('auth.signIn.password')}:
            </label>

            <input
              type="password"
              autoComplete="off"
              id="password"
              value={formData.password}
              name="password"
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none transition focus:border-ink focus:ring-2 focus:ring-lavender"
            />
          </div>

          <div className="flex gap-3 pt-2">

            <button
              type="submit"
              className="flex-1 rounded-lg bg-ink px-5 py-3 font-semibold text-lavender transition hover:opacity-90"
            >
              {t('auth.signIn.submit')}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 rounded-lg border border-rule bg-white px-5 py-3 font-semibold text-mid transition hover:bg-card"
            >
              {t('auth.signIn.cancel')}
            </button>

          </div>

        </form>
      </div>

    </main>
  );

  // return (
  //   <main>
  //     <h1>{t('auth.signIn.title')}</h1>
  //     <p className="error">{error}</p>
  //     <form autoComplete="off" onSubmit={handleSubmit}>
  //       <div>
  //         <label htmlFor="workEmail">{t('Email')}:</label>
  //         <input
  //           type="text"
  //           autoComplete="off"
  //           id="workEmail"
  //           value={formData.workEmail}
  //           name="workEmail"
  //           onChange={handleChange}
  //           required
  //         />
  //       </div>
  //       <div>
  //         <label htmlFor="password">{t('auth.signIn.password')}:</label>
  //         <input
  //           type="password"
  //           autoComplete="off"
  //           id="password"
  //           value={formData.password}
  //           name="password"
  //           onChange={handleChange}
  //           required
  //         />
  //       </div>
  //       <div>
  //         <button>{t('auth.signIn.submit')}</button>
  //         <button onClick={() => navigate("/")}>{t('auth.signIn.cancel')}</button>
  //       </div>
  //     </form>
  //   </main>
  // );
};

export default SignInForm;
