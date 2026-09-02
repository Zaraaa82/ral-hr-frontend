import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getUserById, updateEmployee, allManager } from "../../services/userService";
import { getAllDepartments } from "../../services/departmentService";

function EditUser() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [managers, setManagers] = useState([]);

    const [formData, setFormData] = useState({
        fullName: "",
        cprNumber: "",
        gender: "",
        isBahraini: false,
        dateOfBirth: "",
        nationality: "",
        jobTitle: "",
        department: "",
        manager: "",
        dateOfJoining: "",
        phoneNumber: "",
        role: "Employee",
        personalEmail: "",
        workEmail: "",
        basicSalaryFils: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError("");

                const user = await getUserById(userId)
                const department = await getAllDepartments()
                const manager = await allManager()

                setFormData({
                    fullName: user.foundUser.fullName || '',
                    cprNumber: user.foundUser.cprNumber ||'',
                    gender: user.foundUser.gender || '',
                    isBahraini: user.foundUser.isBahraini ?? false,
                    dateOfBirth: user.foundUser.dateOfBirth.substring(0, 10),
                    nationality: user.foundUser.nationality || '',
                    jobTitle: user.foundUser.jobTitle || '',
                    department: user.foundUser.department?._id || user.foundUser.department || '',
                    manager: user.foundUser.manager?._id || user.foundUser.manager || '',
                    dateOfJoining: user.foundUser.dateOfJoining.substring(0, 10),
                    phoneNumber: user.foundUser.phoneNumber || '',
                    role: user.foundUser.role || "Employee",
                    personalEmail: user.foundUser.personalEmail ||'',
                    workEmail: user.foundUser.workEmail || '',
                    basicSalaryFils: user.foundUser.basicSalaryFils || '',
                });
                setDepartments(department.allDepartments);
                setManagers(manager.foundManagers);

            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load employee information."
                );
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            loadData();
        }
    }, [userId]);

    function handleChange(event) {
        const { name, type, value, checked, files } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = {
                ...formData,
                manager: formData.manager || null,
                department: formData.department || null,
                basicSalaryFils: Number(formData.basicSalaryFils),
            };

            await updateEmployee(userId, data);

            setSuccess("Employee updated successfully.");

            navigate(`/user/${userId}`);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update employee."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-gray-500">Loading employee...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 text-sm font-medium text-gray-600 hover:text-black"
                    >
                        ← Back
                    </button>

                    <h1 className="text-3xl font-bold text-[#1D1D1F]">
                        Edit Employee
                    </h1>

                    <p className="mt-1 text-gray-600">
                        Update the employee's information below.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                >
                    <section className="mb-8">
                        <h2 className="mb-4 text-xl font-semibold text-[#1D1D1F]">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <InputField
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label="CPR Number"
                                name="cprNumber"
                                value={formData.cprNumber}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                >
                                    <option value="" disabled>Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <InputField
                                label="Date of Birth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Nationality"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />

                            <div className="flex items-center gap-3 md:col-span-2">
                                <input
                                    id="isBahraini"
                                    type="checkbox"
                                    name="isBahraini"
                                    checked={formData.isBahraini}
                                    onChange={handleChange}
                                    className="h-4 w-4"
                                />

                                <label
                                    htmlFor="isBahraini"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Bahraini
                                </label>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8 border-t border-gray-200 pt-8">
                        <h2 className="mb-4 text-xl font-semibold text-[#1D1D1F]">
                            Employment Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <InputField
                                label="Job Title"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Role
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="HR Admin">HR Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Department
                                </label>

                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                >
                                    <option value="" disabled>Select department</option>

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
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Manager
                                </label>

                                <select
                                    name="manager"
                                    value={formData.manager}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                                >
                                    <option value="" disabled>Manager</option>

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

                            <InputField
                                label="Date of Joining"
                                name="dateOfJoining"
                                type="date"
                                value={formData.dateOfJoining}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Basic Salary (Fils)"
                                name="basicSalaryFils"
                                type="number"
                                value={formData.basicSalaryFils}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </section>

                    <section className="mb-8 border-t border-gray-200 pt-8">
                        <h2 className="mb-4 text-xl font-semibold text-[#1D1D1F]">
                            Contact Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <InputField
                                label="Personal Email"
                                name="personalEmail"
                                type="email"
                                value={formData.personalEmail}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Work Email"
                                name="workEmail"
                                type="email"
                                value={formData.workEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[#1D1D1F] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function InputField({
    label,
    name,
    type = "text",
    value,
    onChange,
    required = false,
    min,
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                min={min}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
            />
        </div>
    );
}

export default EditUser;