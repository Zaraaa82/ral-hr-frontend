import { useState, useEffect } from 'react'
import { createDepartment, getAllDepartments, updateDepartment } from '../../services/departmentService'
import { allManager } from '../../services/userService'

function AllDepartments() {

    const [departments, setDepartments] = useState([])
    const [managers, setManagers] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [editingDepartment, setEditingDepartment] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addForm, setAddForm] = useState({
        departmentName: '',
        manager: ''
    })
    const [editForm, setEditForm] = useState({
        departmentName: '',
        manager: ''
    })

    async function fetchData() {
        try {
            const data = await getAllDepartments()
            const managerData = await allManager()

            if (!data?.allDepartments || data.allDepartments.length === 0) {
                setError('No Departments found. Please add departments.')
                setDepartments([])
                return
            }

            setDepartments(data.allDepartments)
            setManagers(managerData.foundManagers)

            setError('')

        } catch (err) {
            console.log(err)

            setError(
                err.response?.data?.message ||
                'Failed to load departments.'
            )
        }
    }


    useEffect(() => {
        fetchData()
    }, [])


    // add popup
    function handleAddChange(event) {
        const { name, value } = event.target

        setAddForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    async function handleAddDepartment(event) {
        event.preventDefault()

        setError('')
        setSuccess('')

        try {
            await createDepartment(addForm)

            setSuccess('Department created successfully!')

            setAddForm({
                departmentName: '',
                manager: ''
            })

            setShowAddModal(false)

            await fetchData()

        } catch (err) {
            console.log(err)

            setError(
                err.response?.data?.message ||
                'Failed to create department.'
            )
        }
    }

    // edit popup
    function handleEdit(department) {

        setEditingDepartment(department)

        setEditForm({
            departmentName: department.departmentName,
            manager: department.manager?._id ||
                department.manager ||
                ''
        })

        setError('')
        setSuccess('')
    }


    function handleEditChange(event) {

        const { name, value } = event.target

        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    async function handleUpdate(event) {

        event.preventDefault()

        setError('')
        setSuccess('')

        try {

            await updateDepartment(
                editForm,
                editingDepartment._id
            )

            setSuccess('Department updated successfully!')

            setEditingDepartment(null)

            await fetchData()

        } catch (err) {

            console.log(err)

            setError(
                err.response?.data?.message ||
                'Failed to update department.'
            )
        }
    }


    function closeModal() {
        setEditingDepartment(null)
        setError('')
    }


    return (
        <main className="min-h-screen bg-gray-100 py-10 px-4">

            <div className="max-w-5xl mx-auto">

                <div className="mb-8 flex items-center justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-ink">
                            All Departments
                        </h1>

                        <p className="mt-2 text-soft">
                            View and manage all company departments.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setAddForm({
                                departmentName: '',
                                manager: ''
                            })

                            setError('')
                            setShowAddModal(true)
                        }}
                        className="rounded-lg bg-ink px-5 py-3 font-semibold text-lavender transition hover:opacity-90"
                    >
                        + Add Department
                    </button>

                </div>

                {success && (
                    <div className="mb-6 rounded-lg border border-good/30 bg-good/10 px-4 py-3 text-good">
                        {success}
                    </div>
                )}


                {error && !editingDepartment && (
                    <div className="mb-6 rounded-lg border border-stop/30 bg-stop/10 px-4 py-3 text-stop">
                        {error}
                    </div>
                )}


                {departments.length > 0 && (

                    <div className="overflow-hidden rounded-xl border border-rule bg-white shadow-sm">

                        <table className="w-full">

                            <thead className="bg-card border-b border-rule">

                                <tr>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                                        Department
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-ink">
                                        Manager
                                    </th>

                                    <th className="px-6 py-4 text-right text-sm font-semibold text-ink">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-rule">

                                {departments.map((department) => (

                                    <tr
                                        key={department._id}
                                        className="hover:bg-card/50 transition"
                                    >

                                        <td className="px-6 py-4 text-mid">
                                            {department.departmentName}
                                        </td>


                                        <td className="px-6 py-4 text-mid">
                                            {department.manager?.fullName ||
                                                'No Manager'}
                                        </td>


                                        <td className="px-6 py-4 text-right">

                                            <button
                                                onClick={() =>
                                                    handleEdit(department)
                                                }
                                                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-lavender hover:opacity-90"
                                            >
                                                Edit
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {editingDepartment && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">

                        <div className="flex items-center justify-between mb-6">

                            <div>

                                <h2 className="text-2xl font-bold text-ink">
                                    Edit Department
                                </h2>

                                <p className="mt-1 text-sm text-soft">
                                    Update department information.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-2xl text-soft hover:text-ink"
                            >
                                ×
                            </button>

                        </div>

                        {error && (

                            <div className="mb-5 rounded-lg border border-stop/30 bg-stop/10 px-4 py-3 text-sm text-stop">
                                {error}
                            </div>

                        )}

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-6"
                        >

                            <div>

                                <label className="mb-2 block text-sm font-medium text-mid">
                                    Department Name
                                </label>

                                <input
                                    type="text"
                                    name="departmentName"
                                    value={editForm.departmentName}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none focus:border-ink focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-mid">
                                    Manager
                                </label>

                                <select
                                    name="manager"
                                    value={editForm.manager}
                                    onChange={handleEditChange}
                                    className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none focus:border-ink focus:ring-2 focus:ring-lavender"
                                >

                                    <option value="" disabled>
                                        No Manager
                                    </option>

                                    {managers.map((manager) => (
                                        <option
                                            key={manager._id}
                                            value={manager._id}
                                        >
                                            {manager.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-rule pt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-rule px-5 py-3 font-medium text-mid hover:bg-card"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-ink px-6 py-3 font-semibold text-lavender hover:opacity-90"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ADD DEPARTMENT POPUP */}
            {showAddModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">

                            <div>
                                <h2 className="text-2xl font-bold text-ink">
                                    Add Department
                                </h2>

                                <p className="mt-1 text-sm text-soft">
                                    Create a new company department.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="text-2xl text-soft hover:text-ink"
                            >
                                ×
                            </button>

                        </div>


                        {/* Error */}
                        {error && (
                            <div className="mb-5 rounded-lg border border-stop/30 bg-stop/10 px-4 py-3 text-sm text-stop">
                                {error}
                            </div>
                        )}


                        <form
                            onSubmit={handleAddDepartment}
                            className="space-y-6"
                        >

                            {/* Department Name */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-mid">
                                    Department Name
                                </label>

                                <input
                                    type="text"
                                    name="departmentName"
                                    value={addForm.departmentName}
                                    onChange={handleAddChange}
                                    required
                                    placeholder="e.g. Human Resources"
                                    className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none focus:border-ink focus:ring-2 focus:ring-lavender"
                                />

                            </div>


                            {/* Manager */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-mid">
                                    Manager
                                </label>

                                <select
                                    name="manager"
                                    value={addForm.manager}
                                    onChange={handleAddChange}
                                    className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none focus:border-ink focus:ring-2 focus:ring-lavender"
                                >

                                    <option value="" disabled>
                                        No Manager
                                    </option>

                                    {managers.map((manager) => (
                                        <option
                                            key={manager._id}
                                            value={manager._id}
                                        >
                                            {manager.fullName}
                                        </option>
                                    ))}

                                </select>

                            </div>


                            {/* Buttons */}
                            <div className="flex justify-end gap-3 border-t border-rule pt-6">

                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-lg border border-rule px-5 py-3 font-medium text-mid hover:bg-card"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-ink px-6 py-3 font-semibold text-lavender hover:opacity-90"
                                >
                                    Add Department
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}
        </main>
    )
}

export default AllDepartments

