import React, { useEffect, useState } from 'react'
import { createUser, allManager } from '../../services/userService'
import { getAllDepartments } from '../../services/departmentService'
import { useNavigate } from 'react-router'

function AddUser() {
    const [departments, setDepartments] = useState([])
    const [managers, setManager] = useState([])
    const [error, setError] = useState('')

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
        event.preventDefault();

        setError("");

        try {
            const createdUser = await createUser(formData);

            console.log("Created user:", createdUser);

            navigate("/dashboard");

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
            });

        } catch (err) {
            console.log("Error:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to create employee."
            );
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
    <main className="container mx-auto py-10">
        <Card className="mx-auto w-full max-w-3xl">
            <CardHeader>
                <CardTitle>Add Employee</CardTitle>
                <CardDescription>
                    Enter the employee's information below.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <p className="mb-4 text-sm text-red-500">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <FieldGroup>

                        <Field>
                            <FieldLabel htmlFor="fullName">
                                Full Name
                            </FieldLabel>
                            <Input
                                id="fullName"
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="cprNumber">
                                CPR Number
                            </FieldLabel>
                            <Input
                                id="cprNumber"
                                type="text"
                                name="cprNumber"
                                value={formData.cprNumber}
                                onChange={handleChange}
                                maxLength={9}
                                pattern="\d{9}"
                                required
                            />
                            <FieldDescription>
                                Enter the 9-digit CPR number.
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="gender">
                                Gender
                            </FieldLabel>

                            <Select
                                value={formData.gender}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        gender: value,
                                    }))
                                }
                            >
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="male">
                                        Male
                                    </SelectItem>
                                    <SelectItem value="female">
                                        Female
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="nationality">
                                Nationality
                            </FieldLabel>
                            <Input
                                id="nationality"
                                type="text"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field orientation="horizontal">
                            <Checkbox
                                id="isBahraini"
                                checked={formData.isBahraini}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        isBahraini: checked,
                                    }))
                                }
                            />

                            <FieldLabel
                                htmlFor="isBahraini"
                                className="font-normal"
                            >
                                Bahraini
                            </FieldLabel>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="dateOfBirth">
                                Date of Birth
                            </FieldLabel>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="jobTitle">
                                Job Title
                            </FieldLabel>
                            <Input
                                id="jobTitle"
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="department">
                                Department
                            </FieldLabel>

                            <Select
                                value={formData.department}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        department: value,
                                    }))
                                }
                            >
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>

                                <SelectContent>
                                    {departments.map((department) => (
                                        <SelectItem
                                            key={department._id}
                                            value={department._id}
                                        >
                                            {department.departmentName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="manager">
                                Manager
                            </FieldLabel>

                            <Select
                                value={formData.manager}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        manager: value,
                                    }))
                                }
                            >
                                <SelectTrigger id="manager">
                                    <SelectValue placeholder="No Manager" />
                                </SelectTrigger>

                                <SelectContent>
                                    {managers.map((manager) => (
                                        <SelectItem
                                            key={manager._id}
                                            value={manager._id}
                                        >
                                            {manager.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="dateOfJoining">
                                Date of Joining
                            </FieldLabel>
                            <Input
                                id="dateOfJoining"
                                type="date"
                                name="dateOfJoining"
                                value={formData.dateOfJoining}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="phoneNumber">
                                Phone Number
                            </FieldLabel>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="dateOfLeaving">
                                Date of Leaving
                            </FieldLabel>
                            <Input
                                id="dateOfLeaving"
                                type="date"
                                name="dateOfLeaving"
                                value={formData.dateOfLeaving}
                                onChange={handleChange}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="status">
                                Status
                            </FieldLabel>

                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        status: value,
                                    }))
                                }
                            >
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="deactivated">
                                        Deactivated
                                    </SelectItem>
                                    <SelectItem value="left">
                                        Left
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="role">
                                Role
                            </FieldLabel>

                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        role: value,
                                    }))
                                }
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="Employee">
                                        Employee
                                    </SelectItem>
                                    <SelectItem value="Manager">
                                        Manager
                                    </SelectItem>
                                    <SelectItem value="HR Admin">
                                        HR Admin
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="personalEmail">
                                Personal Email
                            </FieldLabel>
                            <Input
                                id="personalEmail"
                                type="email"
                                name="personalEmail"
                                value={formData.personalEmail}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="workEmail">
                                Work Email
                            </FieldLabel>
                            <Input
                                id="workEmail"
                                type="email"
                                name="workEmail"
                                value={formData.workEmail}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">
                                Password
                            </FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="basicSalaryFils">
                                Basic Salary (Fils)
                            </FieldLabel>
                            <Input
                                id="basicSalaryFils"
                                type="number"
                                name="basicSalaryFils"
                                value={formData.basicSalaryFils}
                                onChange={handleChange}
                                min="0"
                                step="1"
                                required
                            />
                            <FieldDescription>
                                Enter the basic salary in fils.
                            </FieldDescription>
                        </Field>

                        <Button type="submit" className="w-full">
                            Create Employee
                        </Button>

                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    </main>
)

    // return (
    //     <main>
    //         <h1>Add Employee</h1>
    //         {error && (<p style={{ color: "red" }}> {error} </p>)}
    //         <form onSubmit={handleSubmit}>

    //             <div>
    //                 <label>Full Name</label>
    //                 <input
    //                     type="text"
    //                     name="fullName"
    //                     value={formData.fullName}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>CPR Number</label>
    //                 <input
    //                     type="text"
    //                     name="cprNumber"
    //                     value={formData.cprNumber}
    //                     onChange={handleChange}
    //                     maxLength="9"
    //                     pattern="\d{9}"
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>Gender</label>
    //                 <select
    //                     name="gender"
    //                     value={formData.gender}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="">Select Gender</option>
    //                     <option value="male">Male</option>
    //                     <option value="female">Female</option>
    //                 </select>
    //             </div>

    //             <div>
    //                 <label>Nationality</label>
    //                 <input
    //                     type="text"
    //                     name="nationality"
    //                     value={formData.nationality}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>
    //                     <input
    //                         type="checkbox"
    //                         name="isBahraini"
    //                         checked={formData.isBahraini}
    //                         onChange={handleChange}
    //                     />
    //                     Bahraini
    //                 </label>
    //             </div>

    //             <div>
    //                 <label>Date of Birth</label>
    //                 <input
    //                     type="date"
    //                     name="dateOfBirth"
    //                     value={formData.dateOfBirth}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             {/* <div>
    //                 <label>Employee Code</label>
    //                 <input
    //                     type="text"
    //                     name="employeeCode"
    //                     value={formData.employeeCode}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div> */}

    //             <div>
    //                 <label>Job Title</label>
    //                 <input
    //                     type="text"
    //                     name="jobTitle"
    //                     value={formData.jobTitle}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>Department</label>
    //                 <select name="department" value={formData.department} onChange={handleChange} required >
    //                     <option value=""> Select Department </option>
    //                     {departments.map((department) =>
    //                         (<option key={department._id} value={department._id} > {department.departmentName} </option>))} </select> </div>

    //             <div>
    //                 <label>Manager</label>
    //                 <select
    //                     name="manager"
    //                     value={formData.manager}
    //                     onChange={handleChange}
    //                 >
    //                     <option value="">No Manager</option>
    //                     {/* Map your managers here */}

    //                     {managers.map((manager) => (
    //                         <option key={manager._id} value={manager._id}>
    //                             {manager.fullName}
    //                         </option>
    //                     ))}

    //                 </select>
    //             </div>

    //             <div>
    //                 <label>Date of Joining</label>
    //                 <input
    //                     type="date"
    //                     name="dateOfJoining"
    //                     value={formData.dateOfJoining}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>Phone Number</label>
    //                 <input
    //                     type="tel"
    //                     name="phoneNumber"
    //                     value={formData.phoneNumber}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>Date of Leaving</label>
    //                 <input
    //                     type="date"
    //                     name="dateOfLeaving"
    //                     value={formData.dateOfLeaving}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             <div>
    //                 <label>Status</label>
    //                 <select
    //                     name="status"
    //                     value={formData.status}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="active">Active</option>
    //                     <option value="deactivated">Deactivated</option>
    //                     <option value="left">Left</option>
    //                 </select>
    //             </div>

    //             <div>
    //                 <label>Role</label>
    //                 <select
    //                     name="role"
    //                     value={formData.role}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="">Select Role</option>
    //                     <option value="Employee">Employee</option>
    //                     <option value="Manager">Manager</option>
    //                     <option value="HR Admin">HR Admin</option>
    //                 </select>
    //             </div>

    //             <div>
    //                 <label>Personal Email</label>
    //                 <input
    //                     type="email"
    //                     name="personalEmail"
    //                     value={formData.personalEmail}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>Work Email</label>
    //                 <input
    //                     type="email"
    //                     name="workEmail"
    //                     value={formData.workEmail}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>Password</label>
    //                 <input
    //                     type="password"
    //                     name="password"
    //                     value={formData.password}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             <div>
    //                 <label>Basic Salary (Fils)</label>
    //                 <input
    //                     type="number"
    //                     name="basicSalaryFils"
    //                     value={formData.basicSalaryFils}
    //                     onChange={handleChange}
    //                     min="0"
    //                     step="1"
    //                     required
    //                 />
    //             </div>

    //             <button type="submit">
    //                 Create Employee
    //             </button>

    //         </form>
    //     </main>)
}

export default AddUser