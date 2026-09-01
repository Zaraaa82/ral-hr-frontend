import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getUserById } from '../../services/userService'

function UserDetails() {

    const { userId } = useParams()

    const [user, setUser] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {

        async function fetchUser() {
            try {

                const data = await getUserById(userId)

                console.log(data)
                setUser(data.foundUser)

            } catch (err) {

                setError(
                    err.response?.data?.message ||
                    'Failed to load employee details.'
                )

            }
        }

        fetchUser()

    }, [userId])


    if (error) {
        return (
            <main>
                <p>{error}</p>
            </main>
        )
    }


    if (!user) {
        return (
            <main>
                <p>Loading employee details...</p>
            </main>
        )
    }


    return (
        <main>

            <h1>{user.fullName}</h1>

            <p>Email: {user.workEmail}</p>

            <p>Job Title: {user.jobTitle}</p>

            <p>Role: {user.role}</p>

            <p>
                Department:{' '}
                {user.department?.departmentName || 'No Department'}
            </p>

        </main>
    )
}

export default UserDetails