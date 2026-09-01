
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
    getUserById,
    deactivateUser,
    reactivateUser,
} from "../../services/userService";

function UserDetails() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    async function fetchUser() {
        try {
            setLoading(true);
            setError("");

            const data = await getUserById(userId);

            console.log(data);

            setUser(data.foundUser);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load employee details."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, [userId]);

    async function handleStatusChange() {
        if (!user) return;

        const isDeactivated = user.status === "deactivated";

        const action = isDeactivated
            ? "reactivate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.fullName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            let data;

            if (isDeactivated) {
                data = await reactivateUser(userId);
            } else {
                data = await deactivateUser(userId);
            }

            // Backend returns { safeUser }
            setUser(data.safeUser);

            setSuccess(
                isDeactivated
                    ? "Employee has been reactivated successfully."
                    : "Employee has been deactivated successfully."
            );

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                `Failed to ${action} employee.`
            );
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen p-8">
                <p className="text-mid">
                    Loading employee details...
                </p>
            </main>
        );
    }

    if (error && !user) {
        return (
            <main className="min-h-screen p-8">
                <p className="text-red-600">
                    {error}
                </p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen p-8">
                <p>
                    Employee not found.
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-card p-8">


            <div className="mb-8 flex items-start justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-ink">
                        {user.fullName}
                    </h1>

                    <p className="mt-1 text-soft">
                        Employee Code: {user.employeeCode}
                    </p>
                </div>


                <div className="flex gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/user/${user._id}/edit`)
                        }
                        className="rounded-lg bg-ink px-5 py-3 font-semibold text-lavender transition hover:opacity-90"
                    >
                        Edit
                    </button>


                    {user.status === "active" ? (

                        <button
                            type="button"
                            onClick={handleStatusChange}
                            disabled={actionLoading}
                            className="rounded-lg border border-red-300 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {actionLoading
                                ? "Deactivating..."
                                : "Deactivate"}
                        </button>

                    ) : user.status === "deactivated" ? (

                        <button
                            type="button"
                            onClick={handleStatusChange}
                            disabled={actionLoading}
                            className="rounded-lg border border-green-300 bg-green-50 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {actionLoading
                                ? "Reactivating..."
                                : "Reactivate"}
                        </button>

                    ) : null}

                </div>

            </div>


            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}



            <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

                <h2 className="mb-5 text-xl font-semibold text-ink">
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>
                        <p className="text-sm text-soft">
                            Full Name
                        </p>

                        <p className="font-medium text-mid">
                            {user.fullName}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            CPR Number
                        </p>

                        <p className="font-medium text-mid">
                            {user.cprNumber}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Gender
                        </p>

                        <p className="font-medium capitalize text-mid">
                            {user.gender}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Nationality
                        </p>

                        <p className="font-medium text-mid">
                            {user.nationality}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Bahraini
                        </p>

                        <p className="font-medium text-mid">
                            {user.isBahraini ? "Yes" : "No"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Date of Birth
                        </p>

                        <p className="font-medium text-mid">
                            {user.dateOfBirth
                                ? new Date(
                                    user.dateOfBirth
                                ).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>

                </div>

            </section>


            {/* ================= CONTACT INFORMATION ================= */}

            <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

                <h2 className="mb-5 text-xl font-semibold text-ink">
                    Contact Information
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>
                        <p className="text-sm text-soft">
                            Work Email
                        </p>

                        <p className="font-medium text-mid">
                            {user.workEmail}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Personal Email
                        </p>

                        <p className="font-medium text-mid">
                            {user.personalEmail}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Phone Number
                        </p>

                        <p className="font-medium text-mid">
                            {user.phoneNumber}
                        </p>
                    </div>

                </div>

            </section>


            <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

                <h2 className="mb-5 text-xl font-semibold text-ink">
                    Employment Information
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>
                        <p className="text-sm text-soft">
                            Employee Code
                        </p>

                        <p className="font-medium text-mid">
                            {user.employeeCode}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Job Title
                        </p>

                        <p className="font-medium text-mid">
                            {user.jobTitle}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Role
                        </p>

                        <p className="font-medium text-mid">
                            {user.role}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Department
                        </p>

                        <p className="font-medium text-mid">
                            {user.department?.departmentName ||
                                "No Department"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Manager
                        </p>

                        <p className="font-medium text-mid">
                            {user.manager?.fullName ||
                                "No Manager"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Date of Joining
                        </p>

                        <p className="font-medium text-mid">
                            {user.dateOfJoining
                                ? new Date(
                                    user.dateOfJoining
                                ).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Date of Leaving
                        </p>

                        <p className="font-medium text-mid">
                            {user.dateOfLeaving
                                ? new Date(
                                    user.dateOfLeaving
                                ).toLocaleDateString()
                                : "Still Employed"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-soft">
                            Status
                        </p>

                        <p
                            className={`font-medium capitalize ${user.status === "active"
                                ? "text-green-600"
                                : user.status === "deactivated"
                                    ? "text-red-600"
                                    : "text-mid"
                                }`}
                        >
                            {user.status}
                        </p>
                    </div>

                </div>

            </section>

            {user.basicSalaryFils !== undefined && (
                <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

                    <h2 className="mb-5 text-xl font-semibold text-ink">
                        Salary Information
                    </h2>

                    <div>

                        <p className="text-sm text-soft">
                            Basic Salary
                        </p>

                        <p className="text-2xl font-bold text-ink">
                            {(user.basicSalaryFils / 1000).toFixed(3)} BHD
                        </p>

                    </div>

                </section>
            )}

        </main>
    );
}

export default UserDetails;

// import { useEffect, useState } from "react";
// import { useParams } from "react-router";
// import { getUserById } from "../../services/userService";

// function UserDetails() {
//     const { userId } = useParams();

//     const [user, setUser] = useState(null);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         async function fetchUser() {
//             try {
//                 const data = await getUserById(userId);

//                 console.log(data);
//                 setUser(data.foundUser);
//             } catch (err) {
//                 setError(
//                     err.response?.data?.message ||
//                     "Failed to load employee details."
//                 );
//             }
//         }

//         fetchUser();
//     }, [userId]);

//     if (error) {
//         return (
//             <main className="p-8">
//                 <p className="text-red-600">{error}</p>
//             </main>
//         );
//     }

//     if (!user) {
//         return (
//             <main className="p-8">
//                 <p>Loading employee details...</p>
//             </main>
//         );
//     }

//     return (
//         <main className="p-8">

//             {/* Header */}
//             <div className="mb-8">
//                 <h1 className="text-3xl font-bold text-ink">
//                     {user.fullName}
//                 </h1>

//                 <p className="mt-1 text-soft">
//                     Employee Code: {user.employeeCode}
//                 </p>
//             </div>

//             {/* Personal Information */}
//             <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

//                 <h2 className="mb-5 text-xl font-semibold text-ink">
//                     Personal Information
//                 </h2>

//                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

//                     <div>
//                         <p className="text-sm text-soft">Full Name</p>
//                         <p className="font-medium text-mid">{user.fullName}</p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">CPR Number</p>
//                         <p className="font-medium text-mid">{user.cprNumber}</p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Gender</p>
//                         <p className="font-medium text-mid capitalize">
//                             {user.gender}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Nationality</p>
//                         <p className="font-medium text-mid">
//                             {user.nationality}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Bahraini</p>
//                         <p className="font-medium text-mid">
//                             {user.isBahraini ? "Yes" : "No"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Date of Birth</p>
//                         <p className="font-medium text-mid">
//                             {user.dateOfBirth
//                                 ? new Date(user.dateOfBirth).toLocaleDateString()
//                                 : "N/A"}
//                         </p>
//                     </div>

//                 </div>
//             </section>

//             {/* Contact Information */}
//             <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

//                 <h2 className="mb-5 text-xl font-semibold text-ink">
//                     Contact Information
//                 </h2>

//                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

//                     <div>
//                         <p className="text-sm text-soft">Work Email</p>
//                         <p className="font-medium text-mid">
//                             {user.workEmail}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Personal Email</p>
//                         <p className="font-medium text-mid">
//                             {user.personalEmail}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Phone Number</p>
//                         <p className="font-medium text-mid">
//                             {user.phoneNumber}
//                         </p>
//                     </div>

//                 </div>
//             </section>

//             {/* Employment Information */}
//             <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

//                 <h2 className="mb-5 text-xl font-semibold text-ink">
//                     Employment Information
//                 </h2>

//                 <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

//                     <div>
//                         <p className="text-sm text-soft">Employee Code</p>
//                         <p className="font-medium text-mid">
//                             {user.employeeCode}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Job Title</p>
//                         <p className="font-medium text-mid">
//                             {user.jobTitle}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Role</p>
//                         <p className="font-medium text-mid">
//                             {user.role}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Department</p>
//                         <p className="font-medium text-mid">
//                             {user.department?.departmentName || "No Department"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Manager</p>
//                         <p className="font-medium text-mid">
//                             {user.manager?.fullName || "No Manager"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Date of Joining</p>
//                         <p className="font-medium text-mid">
//                             {user.dateOfJoining
//                                 ? new Date(user.dateOfJoining).toLocaleDateString()
//                                 : "N/A"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Date of Leaving</p>
//                         <p className="font-medium text-mid">
//                             {user.dateOfLeaving
//                                 ? new Date(user.dateOfLeaving).toLocaleDateString()
//                                 : "Still Employed"}
//                         </p>
//                     </div>

//                     <div>
//                         <p className="text-sm text-soft">Status</p>
//                         <p className="font-medium capitalize text-mid">
//                             {user.status}
//                         </p>
//                     </div>

//                 </div>
//             </section>

//             {/* Salary */}
//             {user.basicSalaryFils !== undefined && (
//                 <section className="mb-6 rounded-xl border border-rule bg-white p-6 shadow-sm">

//                     <h2 className="mb-5 text-xl font-semibold text-ink">
//                         Salary Information
//                     </h2>

//                     <div>
//                         <p className="text-sm text-soft">
//                             Basic Salary
//                         </p>

//                         <p className="text-2xl font-bold text-ink">
//                             {(user.basicSalaryFils / 1000).toFixed(3)} BHD
//                         </p>
//                     </div>

//                 </section>
//             )}

//         </main>
//     );
// }

// export default UserDetails;
