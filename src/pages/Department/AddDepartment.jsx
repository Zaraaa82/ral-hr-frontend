
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { createDepartment } from '../../services/departmentService'
import { allManager } from '../../services/userService'

function AddDepartment() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        departmentName: '',
        manager: ''
    })

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [managers, setManager] = useState([])


    useEffect(() => {
        async function fetchManagers() {
            try {
                const manager = await allManager()
                setManager(manager.foundManagers)
            }
            catch (err) {
                setError(err.response?.data?.message || 'Failed to load managers.')
            }
        }
        fetchManagers()
    }, [])

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        setError('')
        setSuccess('')

        try {
            await createDepartment(formData)

            setSuccess('Department created successfully!')

            setFormData({
                departmentName: '',
                manager: ''
            })

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to create department.'
            )
        }

    }

    return (
        <main className="min-h-screen bg-card px-8 py-10">

            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-ink">
                        Add Department
                    </h1>

                    <p className="mt-2 text-soft">
                        Create a new department and assign a manager.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white border border-rule rounded-2xl shadow-sm p-8">

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-stop/30 bg-stop/10 px-4 py-3 text-sm text-stop">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-6 rounded-lg border border-good/30 bg-good/10 px-4 py-3 text-sm text-good">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Department Name */}
                        <div>
                            <label
                                htmlFor="departmentName"
                                className="block mb-2 text-sm font-medium text-mid"
                            >
                                Department Name
                            </label>

                            <input
                                type="text"
                                id="departmentName"
                                name="departmentName"
                                value={formData.departmentName}
                                onChange={handleChange}
                                placeholder="e.g. Human Resources"
                                required
                                className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none transition focus:border-ink focus:ring-2 focus:ring-lavender"
                            />
                        </div>

                        {/* Manager */}
                        <div>
                            <label
                                htmlFor="manager"
                                className="block mb-2 text-sm font-medium text-mid"
                            >
                                Manager
                            </label>

                            <select id="manager" name="manager" value={formData.manager} onChange={handleChange}
                                className="w-full rounded-lg border border-rule bg-white px-4 py-3 text-mid outline-none transition focus:border-ink focus:ring-2 focus:ring-lavender" >
                                <option value=""> No Manager </option>
                                {managers.map((manager) => (
                                    <option key={manager._id} value={manager._id} >
                                        {manager.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 border-t border-rule pt-6">

                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="rounded-lg border border-rule bg-white px-5 py-3 font-medium text-mid transition hover:bg-card"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="rounded-lg bg-ink px-6 py-3 font-semibold text-lavender transition hover:opacity-90"
                            >
                                Create Department
                            </button>

                        </div>

                    </form>
                </div>
            </div >

        </main >
    )
}

export default AddDepartment
