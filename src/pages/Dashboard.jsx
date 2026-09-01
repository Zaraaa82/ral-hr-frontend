import { useAuth } from "../context/AuthContext"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"

function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-card px-8 py-10">

      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-soft">
          RAL HR
        </p>

        <h1 className="text-3xl font-bold text-ink">
          {t('dashboard.welcomeMessage')} {user.fullName}
        </h1>

        <p className="mt-2 text-mid">
          Welcome to your HR dashboard.
        </p>
      </div>

      <div className="max-w-md rounded-2xl border border-rule bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold text-ink">
          Employee Management
        </h2>

        <p className="mt-2 mb-6 text-sm text-soft">
          Add a new employee to the HR system.
        </p>

        <Link
          to="/user/create"
          className="inline-flex items-center rounded-lg bg-ink px-5 py-3 font-semibold text-lavender transition hover:opacity-90"
        >
          {t('Add Employee')}
        </Link>

      </div>

    </main>
  )
}

export default Dashboard

// import { useAuth } from "../context/AuthContext"
// import { useTranslation } from "react-i18next";
// import { Link } from 'react-router'

// function Dashboard({ }) {
//   const { t } = useTranslation()
//   const { user } = useAuth()

//   return (
//     <div>
//       <h1>{t('dashboard.welcomeMessage')} {user.fullName}</h1>
//       <Link to='/user/create'>{t('Add Employee')}</Link>

//     </div>
//   )
// }

// export default Dashboard