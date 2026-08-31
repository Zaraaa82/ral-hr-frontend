import { useAuth } from "../context/AuthContext"
import { useTranslation } from "react-i18next";
import { Link } from 'react-router'

function Dashboard({ }) {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div>
      <h1>{t('dashboard.welcomeMessage')} {user.fullName}</h1>
      <Link to='/user/create'>{t('Add Employee')}</Link>

    </div>
  )
}

export default Dashboard