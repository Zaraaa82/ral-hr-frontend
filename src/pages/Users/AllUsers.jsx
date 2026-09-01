
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { allUsers } from '../../services/userService'

function AllUsers() {

    const navigate = useNavigate()

    const [users, setUsers] = useState([])
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const recordsPerPage = 10

    async function fetchUsers() {
        try {
            const data = await allUsers()

            console.log(data)

            if (!data?.allUsers || data.allUsers.length === 0) {
                setError('No employees found.')
                setUsers([])
                return
            }

            setUsers(data.allUsers)
            setError('')

        } catch (err) {
            console.log(err)

            setError(
                err.response?.data?.message ||
                'Failed to load employees.'
            )
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])


    // Pagination

    const totalPages = Math.ceil(users.length / recordsPerPage)

    const startIndex = (currentPage - 1) * recordsPerPage

    const endIndex = startIndex + recordsPerPage

    const currentUsers = users.slice(startIndex, endIndex)


    function handleNext() {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }


    function handlePrevious() {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }


    return (
        <main className="min-h-screen bg-gray-100 py-10 px-4">

            <div className="max-w-6xl mx-auto">

                <div className="mb-8 flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-ink">
                            All Employees
                        </h1>

                        <p className="mt-2 text-soft">
                            View and manage all company employees.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/user/create')}
                        className="rounded-lg bg-ink px-5 py-3 font-semibold text-lavender transition hover:opacity-90"
                    >
                        + Add Employee
                    </button>

                </div>


                {error && (
                    <div className="mb-6 rounded-lg border border-stop/30 bg-stop/10 px-4 py-3 text-stop">
                        {error}
                    </div>
                )}


                {users.length > 0 && (
                    <>
                        <div className="overflow-hidden rounded-xl border border-rule bg-white shadow-sm">


                            <table className="w-full">

                                <thead className="bg-card border-b border-rule">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                                            Employee
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                                            Job Title
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                                            Department
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                                            Role
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                                            Status
                                        </th>
                                    </tr>
                                </thead>


                                <tbody className="divide-y divide-rule">

                                    {currentUsers.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="transition hover:bg-card/50"
                                        >
                                            <td className="px-6 py-4">

                                                <Link
                                                    to={`/user/${user._id}`}
                                                    className="block"
                                                >
                                                    <p className="font-semibold text-ink hover:underline">
                                                        {user.fullName}
                                                    </p>
                                                    <p className="mt-1 text-sm text-soft">
                                                        {user.employeeCode || 'No Employee Code'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-soft">
                                                        {user.workEmail}
                                                    </p>

                                                </Link>

                                            </td>

                                            <td className="px-6 py-4 text-mid">
                                                {user.jobTitle || 'Not assigned'}
                                            </td>

                                            <td className="px-6 py-4 text-mid">
                                                {user.department?.departmentName || 'No Department'}
                                            </td>

                                            <td className="px-6 py-4 text-mid">
                                                {user.role}
                                            </td>

                                            <td className="px-6 py-4">

                                                <span
                                                    className={
                                                        user.status === 'active'
                                                            ? 'rounded-full bg-good/10 px-3 py-1 text-sm font-medium text-good'
                                                            : user.status === 'left'
                                                                ? 'rounded-full bg-stop/10 px-3 py-1 text-sm font-medium text-stop'
                                                                : 'rounded-full bg-warn/10 px-3 py-1 text-sm font-medium text-warn'
                                                    }
                                                >
                                                    {user.status}
                                                </span>

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>
                        </div>


                        <div className="mt-6 flex items-center justify-between">

                            <p className="text-sm text-soft">
                                Showing{' '}
                                <span className="font-medium text-mid">
                                    {startIndex + 1}
                                </span>
                                {' '}to{' '}
                                <span className="font-medium text-mid">
                                    {Math.min(endIndex, users.length)}
                                </span>
                                {' '}of{' '}
                                <span className="font-medium text-mid">
                                    {users.length}
                                </span>
                                {' '}employees
                            </p>


                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-rule bg-white px-4 py-2 text-sm font-medium text-mid transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>


                                <span className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-lavender">
                                    {currentPage} / {totalPages}
                                </span>


                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className="rounded-lg border border-rule bg-white px-4 py-2 text-sm font-medium text-mid transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>

                            </div>

                        </div>

                    </>
                )}

            </div>

        </main>
    )
}

export default AllUsers
