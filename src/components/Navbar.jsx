
import { Link, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

function Navbar() {
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const location = useLocation()

  const linkStyle = (path) =>
    `block px-4 py-3 rounded-lg transition duration-200 ${location.pathname === path
      ? 'bg-lavender text-ink font-semibold'
      : 'text-lavender hover:bg-white/10'
    }`

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-ink">

      <div className="border-b border-white/10 px-6 py-6">
        <Link
          to="/dashboard"
          className="text-2xl font-bold text-lavender"
        >
          RAL HR
        </Link>

        <p className="mt-1 text-sm text-lavender/60">
          Human Resources
        </p>
      </div>

      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-lavender/60">
          Menu
        </p>
        {user?.role === 'HR Admin' ? (
          <>
            <Link
              to="/dashboard"
              className={linkStyle('/dashboard')}
            >
              {t('nav.home')}
            </Link>
            {/* <Link
              to="/user/create"
              className={linkStyle('/user/create')}
            >
              Add Employee
            </Link> */}
            {/* <Link
              to="/dep/create"
              className={linkStyle('/dep/create')}
            >
              Add Department
            </Link> */}

            <Link
              to="/user/all"
              className={linkStyle('/user/create')}
            >
              Employees
            </Link>

            <Link
              to="/dep/all"
              className={linkStyle('/dep/all')}
            >
              Departments
            </Link>
          </>
        ) : null}


        {!user && (
          <Link
            to="/sign-in"
            className={`${linkStyle('/sign-in')} mt-2`}
          >
            {t('nav.signIn')}
          </Link>
        )}

      </nav>

      <div className="border-t border-white/10 p-4">

        <div className="mb-4">
          <LanguageSwitcher />
        </div>

        {user && (
          <button
            onClick={logout}
            className="w-full rounded-lg border border-stop/40 px-4 py-3 text-left font-medium text-red-200 transition hover:bg-stop hover:text-white"
          >
            {t('nav.signOut')}
          </button>

        )}

      </div>

    </aside>
  )
}

export default Navbar

// import { Link } from 'react-router'
// import { useAuth } from '../context/AuthContext'
// import { useTranslation } from "react-i18next";
// import LanguageSwitcher from "./LanguageSwitcher";

// function Navbar() {
//   const { t } = useTranslation();

//   const { logout, user} = useAuth()
//   return (
//     <nav>
//       <Link to='/dashboard'>{t('nav.home')}</Link>
//       {user
//       ?
//       (<>
//       <button onClick={logout}>{t('nav.signOut')}</button>
//       </>) :
//       (<>
//         {/* <Link to='/sign-up'>{t('nav.signUp')}</Link> */}
//         <Link to='/sign-in'>{t('nav.signIn')}</Link>
//       </>)}
//     <LanguageSwitcher />

//     </nav>
//   )
// }

// export default Navbar