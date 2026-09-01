import React, { useEffect, useState } from 'react'
import { createUser, allManager } from '../../services/userService'
import { getAllDepartments } from '../../services/departmentService'
import { useNavigate } from 'react-router'

function AddUser() {
    const [departments, setDepartments] = useState([])
    const [managers, setManager] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        cprNumber: "",
        gender: "",
        isBahraini: false,
        dateOfBirth: "",
        employeeCode: "",
        nationality: "",
        jobTitle: "",
        department: "",
        manager: "",
        dateOfJoining: "",
        phoneNumber: "",
        dateOfLeaving: "",
        status: "active",
        role: "",
        personalEmail: "",
        workEmail: "",
        password: "",
        basicSalaryFils: 0,
    })

    useEffect(() => {
        async function fetchDepartments() {
            try {
                const data = await getAllDepartments()
                setDepartments(data.allDepartments)
                const manager = await allManager()
                setManager(manager.foundManagers)

            } catch (err) {
                console.log("Error fetching departments:", err)
                setError("Failed to load departments.")
            }
        }
        fetchDepartments()
    }, [])



    async function handleSubmit(event) {
        event.preventDefault()

        setError('')
        setSuccess('')

        try {
            const createdUser = await createUser(formData)

            console.log("Created user:", createdUser)

            setSuccess("Employee created successfully!")

            setFormData({
                fullName: "",
                cprNumber: "",
                gender: "",
                isBahraini: false,
                dateOfBirth: "",
                employeeCode: "",
                nationality: "",
                jobTitle: "",
                department: "",
                manager: "",
                dateOfJoining: "",
                phoneNumber: "",
                dateOfLeaving: "",
                status: "active",
                role: "",
                personalEmail: "",
                workEmail: "",
                password: "",
                basicSalaryFils: 0,
            })

            // setTimeout(() => {
            //     navigate("/dashboard")
            // }, 1500)

        } catch (err) {
            console.log("Error:", err)

            setError(
                err?.response?.data?.message ||
                "Failed to create employee."
            )
        }
    }

    function handleChange(event) {
        const { name, type, value, checked, files } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : type === "checkbox" ? checked : value,
        }));
    }

    return (
        <main className="min-h-screen bg-gray-100 py-10 px-4">

            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">

                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    Add Employee
                </h1>

                {
                    error && (
                        <p className="mb-6 rounded-md bg-stop/10 border border-stop/30 text-stop px-4 py-3">
                            {error}
                        </p>
                    )
                }

                {
                    success && (
                        <p className="mb-6 rounded-md bg-good/10 border border-good/30 text-good px-4 py-3">
                            {success}
                        </p>
                    )
                }
                <form
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    <section>
                        <h2 className="text-xl font-semibold text-ink mb-4">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    CPR Number
                                </label>

                                <input
                                    type="text"
                                    name="cprNumber"
                                    value={formData.cprNumber}
                                    onChange={handleChange}
                                    maxLength="9"
                                    pattern="\d{9}"
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Nationality
                                </label>

                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center gap-3 text-sm font-medium text-mid cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isBahraini"
                                        checked={formData.isBahraini}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-[#2B1B3D]"
                                    />

                                    Bahraini
                                </label>
                            </div>

                        </div>
                    </section>


                    <section>
                        <h2 className="text-xl font-semibold text-ink mb-4">
                            Employment Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Job Title
                                </label>

                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Department
                                </label>

                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                >
                                    <option value="">Select Department</option>

                                    {departments.map((department) => (
                                        <option
                                            key={department._id}
                                            value={department._id}
                                        >
                                            {department.departmentName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Manager
                                </label>

                                <select
                                    name="manager"
                                    value={formData.manager}
                                    onChange={handleChange}
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                >
                                    <option value="">No Manager</option>

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

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Role
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                >
                                    <option value="">Select Role</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="HR Admin">HR Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Date of Joining
                                </label>

                                <input
                                    type="date"
                                    name="dateOfJoining"
                                    value={formData.dateOfJoining}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Date of Leaving
                                </label>

                                <input
                                    type="date"
                                    name="dateOfLeaving"
                                    value={formData.dateOfLeaving}
                                    onChange={handleChange}
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                >
                                    <option value="active">Active</option>
                                    <option value="deactivated">Deactivated</option>
                                    <option value="left">Left</option>
                                </select>
                            </div>

                        </div>
                    </section>


                    <section>
                        <h2 className="text-xl font-semibold text-ink mb-4">
                            Contact & Account
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Personal Email
                                </label>

                                <input
                                    type="email"
                                    name="personalEmail"
                                    value={formData.personalEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Work Email
                                </label>

                                <input
                                    type="email"
                                    name="workEmail"
                                    value={formData.workEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mid mb-2">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                                />
                            </div>

                        </div>
                    </section>


                    <section>
                        <h2 className="text-xl font-semibold text-ink mb-4">
                            Compensation
                        </h2>

                        <div className="max-w-md">

                            <label className="block text-sm font-medium text-mid mb-2">
                                Basic Salary (Fils)
                            </label>

                            <input
                                type="number"
                                name="basicSalaryFils"
                                value={formData.basicSalaryFils}
                                onChange={handleChange}
                                min="0"
                                step="1"
                                required
                                className="w-full border border-rule rounded-lg px-4 py-2 bg-white text-mid outline-none focus:ring-2 focus:ring-lavender"
                            />

                        </div>
                    </section>


                    <div className="flex justify-end border-t border-rule pt-6">

                        <button
                            type="submit"
                            className="rounded-lg bg-ink px-6 py-3 font-semibold text-lavender transition hover:opacity-90"
                        >
                            Create Employee
                        </button>

                    </div>

                </form>

            </div>
        </main>
    )
}

export default AddUser