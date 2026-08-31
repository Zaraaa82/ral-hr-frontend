import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "../styles/attendance-calendar.css";

const socket = io("http://localhost:3000");

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function AdminAttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const getEmployeeId = (employee) => {
    if (!employee) return null;

    if (typeof employee === "string") {
      return employee;
    }

    return employee._id || null;
  };

  const getDepartmentId = (department) => {
    if (!department) return null;

    if (typeof department === "string") {
      return department;
    }

    return department._id || null;
  };

  const getEmployeeName = (employee) => {
    if (!employee) return "Employee";

    return employee.fullName || employee.name || "Employee";
  };

  const getDepartmentName = (department) => {
    if (!department) return "No Department";

    if (typeof department === "string") {
      return department;
    }

    return department.name || "No Department";
  };

  const getDateKey = (date) => {
    const d = new Date(date);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
  };

  const getCalendarDateKey = (yearValue, monthValue, day) => {
    return `${yearValue}-${String(monthValue).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
  };

  const formatTime = (time) => {
    if (!time) return "--";

    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // FETCH EMPLOYEES

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:5000/employees", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch employee list.");
        }

        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch employee list:", err);
      }
    };

    fetchEmployees();
  }, []);

  const departments = useMemo(() => {
    const departmentMap = new Map();

    employees.forEach((employee) => {
      const department = employee.department;

      if (!department) return;

      const departmentId = getDepartmentId(department);

      if (!departmentId) return;

      const departmentName = getDepartmentName(department);

      if (!departmentMap.has(departmentId)) {
        departmentMap.set(departmentId, {
          id: departmentId,
          name: departmentName,
        });
      }
    });

    return Array.from(departmentMap.values());
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!selectedDepartment) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        getDepartmentId(employee.department)?.toString() ===
        selectedDepartment.toString()
      );
    });
  }, [employees, selectedDepartment]);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);

    setSelectedEmployee("");
  };

  const fetchMonthlyLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      });

      if (selectedDepartment) {
        params.append("department", selectedDepartment);
      }

      if (selectedEmployee) {
        params.append("employeeId", selectedEmployee);
      }

      const response = await fetch(
        `http://localhost:5000/attendance/admin/calendar?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch attendance logs.");
      }

      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchMonthlyLogs:", err);
      setError(err.message || "Failed to fetch attendance logs.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH WHEN FILTER / MONTH CHANGES

  useEffect(() => {
    fetchMonthlyLogs();
  }, [year, month, selectedDepartment, selectedEmployee]);

  useEffect(() => {
    const handleClockedIn = ({ attendance: newRecord }) => {
      if (!newRecord) return;

      const newEmployeeId = getEmployeeId(newRecord.employee);

      if (
        selectedEmployee &&
        newEmployeeId?.toString() !== selectedEmployee.toString()
      ) {
        return;
      }

      const newDepartmentId = getDepartmentId(newRecord.employee?.department);

      if (
        selectedDepartment &&
        newDepartmentId?.toString() !== selectedDepartment.toString()
      ) {
        return;
      }

      setLogs((previousLogs) => {
        const existing = previousLogs.some((log) => log._id === newRecord._id);

        if (existing) {
          return previousLogs.map((log) =>
            log._id === newRecord._id ? newRecord : log,
          );
        }

        return [...previousLogs, newRecord];
      });
    };

    const handleClockedOut = ({ attendance: updatedRecord }) => {
      if (!updatedRecord) return;

      setLogs((previousLogs) =>
        previousLogs.map((log) =>
          log._id === updatedRecord._id ? updatedRecord : log,
        ),
      );
    };

    socket.on("attendance:clockedIn", handleClockedIn);
    socket.on("attendance:clockedOut", handleClockedOut);

    return () => {
      socket.off("attendance:clockedIn", handleClockedIn);
      socket.off("attendance:clockedOut", handleClockedOut);
    };
  }, [selectedDepartment, selectedEmployee]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const daysInMonth = new Date(year, month, 0).getDate();

  const firstDayIndex = new Date(year, month - 1, 1).getDay();

  const logsByEmployeeAndDate = useMemo(() => {
    const map = new Map();

    logs.forEach((log) => {
      const employeeId = getEmployeeId(log.employee);

      if (!employeeId || !log.date) return;

      const dateKey = getDateKey(log.date);

      const key = `${employeeId}_${dateKey}`;

      map.set(key, log);
    });

    return map;
  }, [logs]);

  // GET ATTENDANCE RECORD FOR A DAY

  const getAttendanceForEmployeeDate = (employee, day) => {
    const employeeId = getEmployeeId(employee);

    if (!employeeId) return null;

    const dateKey = getCalendarDateKey(year, month, day);

    const key = `${employeeId}_${dateKey}`;

    return logsByEmployeeAndDate.get(key) || null;
  };

  // DETERMINE STATUS FOR CALENDAR

  const getStatusForEmployeeDate = (employee, day) => {
    const attendance = getAttendanceForEmployeeDate(employee, day);

    // If attendance record exists, trust its status.
    if (attendance?.status) {
      return attendance.status;
    }

    // Determine day of week.
    const date = new Date(year, month - 1, day);

    const dayName = DAYS_OF_WEEK[date.getDay()];

    const workingDays = employee?.workSchedule?.workingDays || [];

    // No attendance record on a scheduled working day = Absent.
    if (workingDays.includes(dayName)) {
      return "Absent";
    }

    // No attendance record on a non-working day = Weekly Off.
    return "Weekly Off";
  };

  // GET STATUS

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "present";

      case "Absent":
        return "absent";

      case "Half Day":
        return "half-day";

      case "On Leave":
        return "on-leave";

      case "Holiday":
        return "holiday";

      case "Weekly Off":
        return "weekly-off";

      default:
        return "";
    }
  };

  // FILTER EMPLOYEES USED BY CALENDAR

  const calendarEmployees = selectedEmployee
    ? filteredEmployees.filter(
        (employee) => employee._id?.toString() === selectedEmployee.toString(),
      )
    : filteredEmployees;

  return (
    <div className="admin-calendar-container">
      {/* HEADER */}
      <div className="calendar-header">
        <h2>
          {MONTH_NAMES[month - 1]} {year}
        </h2>

        <div className="calendar-actions">
          {/* DEPARTMENT */}
          <div className="filter-select-group">
            <label htmlFor="deptSelect">Department:</label>

            <select
              id="deptSelect"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
            >
              <option value="">All Departments</option>

              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* EMPLOYEE */}
          <div className="filter-select-group">
            <label htmlFor="employeeSelect">Employee:</label>

            <select
              id="employeeSelect"
              value={selectedEmployee}
              onChange={(event) => setSelectedEmployee(event.target.value)}
            >
              <option value="">All Employees</option>

              {filteredEmployees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {getEmployeeName(employee)}
                </option>
              ))}
            </select>
          </div>

          {/* MONTH NAVIGATION */}
          <div className="calendar-nav">
            <button onClick={handlePrevMonth}>&larr; Prev</button>

            <button onClick={handleNextMonth}>Next &rarr;</button>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && <p className="loading">Loading calendar...</p>}

      {/* ERROR */}
      {error && <p className="error-message">{error}</p>}

      {/* CALENDAR */}
      {!loading && !error && (
        <>
          {/* LEGEND */}
          <div className="attendance-legend">
            <span className="legend-item">
              <span className="legend-dot present"></span>
              Present
            </span>

            <span className="legend-item">
              <span className="legend-dot absent"></span>
              Absent
            </span>

            <span className="legend-item">
              <span className="legend-dot half-day"></span>
              Half Day
            </span>

            <span className="legend-item">
              <span className="legend-dot on-leave"></span>
              On Leave
            </span>

            <span className="legend-item">
              <span className="legend-dot holiday"></span>
              Holiday
            </span>

            <span className="legend-item">
              <span className="legend-dot weekly-off"></span>
              Weekly Off
            </span>
          </div>

          <div className="calendar-grid">
            {/* DAY HEADERS */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}

            {/* EMPTY CELLS BEFORE FIRST DAY */}
            {Array.from({
              length: firstDayIndex,
            }).map((_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty"></div>
            ))}

            {/* DAYS */}
            {Array.from({
              length: daysInMonth,
            }).map((_, index) => {
              const day = index + 1;

              const date = new Date(year, month - 1, day);

              const dayName = DAYS_OF_WEEK[date.getDay()];

              /*
               * Employees shown for this calendar.
               *
               * If no employee is selected:
               * show every employee.
               *
               * If an employee is selected:
               * only show that employee.
               */
              const employeesForDay = calendarEmployees;

              return (
                <div
                  key={day}
                  className="calendar-day"
                  title={`${dayName}, ${MONTH_NAMES[month - 1]} ${day}, ${year}`}
                >
                  {/* DAY NUMBER */}
                  <span className="day-number">{day}</span>

                  <div className="day-logs">
                    {employeesForDay.map((employee) => {
                      const attendance = getAttendanceForEmployeeDate(
                        employee,
                        day,
                      );

                      const status = getStatusForEmployeeDate(employee, day);

                      const statusClass = getStatusClass(status);

                      const employeeName = getEmployeeName(employee);

                      return (
                        <div
                          key={`${employee._id}-${day}`}
                          className={`calendar-badge ${statusClass}`}
                          title={`${employeeName} - ${status}${
                            attendance
                              ? ` | In: ${formatTime(
                                  attendance.inTime,
                                )} | Out: ${formatTime(attendance.outTime)}`
                              : ""
                          }`}
                        >
                          <span className="emp-name">{employeeName}</span>

                          <div className="badge-info">
                            {/* STATUS */}
                            <span className="badge-status">{status}</span>

                            {/* LATE */}
                            {attendance?.flags?.includes("late") && (
                              <span className="badge-late">L</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* NO EMPLOYEES */}
                    {calendarEmployees.length === 0 && (
                      <span className="no-employees">No employees</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminAttendanceCalendar;
