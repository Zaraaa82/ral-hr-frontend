import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "../../styles/attendance/attendance-calendar.css";

const API_BASE_URL =
  import.meta.env.VITE_BACK_END_SERVER_URL || "http://localhost:3000";

const socket = io(API_BASE_URL);

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
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getEmployeeId = (employee) => {
    if (!employee) return null;
    if (typeof employee === "string") return employee;
    return employee._id || employee.id || null;
  };

  const getDepartmentId = (dept) => {
    if (!dept) return null;
    if (typeof dept === "string") return dept;
    return dept._id || dept.id || dept.name || null;
  };

  const getEmployeeName = (employee) => {
    if (!employee) return "Employee";
    return employee.fullName || employee.name || "Employee";
  };

  const getDepartmentName = (dept) => {
    if (!dept) return "No Department";
    if (typeof dept === "string") return dept;
    return dept.name || dept.departmentName || dept.title || "No Department";
  };

  const getDateKey = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
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
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        setError("");

        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/user/allUsers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch employee list.");
        }

        const userList = Array.isArray(data)
          ? data
          : data.allUsers || data.users || [];
        setEmployees(userList);
      } catch (err) {
        console.error("Failed to fetch employee list:", err);
        setEmployees([]);
        setError(err.message || "Failed to fetch employee list.");
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const departments = useMemo(() => {
    const departmentMap = new Map();

    employees.forEach((employee) => {
      const dept = employee.department || employee.Department;
      if (!dept) return;

      const deptId = getDepartmentId(dept);
      if (!deptId) return;

      const deptName = getDepartmentName(dept);

      if (!departmentMap.has(deptId.toString())) {
        departmentMap.set(deptId.toString(), {
          id: deptId.toString(),
          name: deptName,
        });
      }
    });

    return Array.from(departmentMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [employees]);

  // FILTER EMPLOYEES BY SELECTED DEPARTMENT
  const filteredEmployees = useMemo(() => {
    if (!selectedDepartment) {
      return employees;
    }

    return employees.filter((employee) => {
      const dept = employee.department || employee.Department;
      const deptId = getDepartmentId(dept);
      return deptId && deptId.toString() === selectedDepartment.toString();
    });
  }, [employees, selectedDepartment]);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
    setSelectedEmployee("");
  };

  // FETCH MONTHLY ATTENDANCE
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

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/attendance/admin/calendar?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch attendance logs.");
      }

      if (Array.isArray(data)) {
        setLogs(data);
      } else if (Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else if (Array.isArray(data.data)) {
        setLogs(data.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("fetchMonthlyLogs error:", err);
      setLogs([]);
      setError(err.message || "Failed to fetch attendance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyLogs();
  }, [year, month, selectedDepartment, selectedEmployee]);

  // SOCKET.IO REAL-TIME LISTENERS
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

      const newDeptId = getDepartmentId(
        newRecord.employee?.department || newRecord.employee?.Department,
      );
      if (
        selectedDepartment &&
        newDeptId?.toString() !== selectedDepartment.toString()
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
      if (!dateKey) return;

      const key = `${employeeId}_${dateKey}`;
      map.set(key, log);
    });

    return map;
  }, [logs]);

  const getAttendanceForEmployeeDate = (employee, day) => {
    const employeeId = getEmployeeId(employee);
    if (!employeeId) return null;

    const dateKey = getCalendarDateKey(year, month, day);
    const key = `${employeeId}_${dateKey}`;
    return logsByEmployeeAndDate.get(key) || null;
  };

  const getStatusForEmployeeDate = (employee, day) => {
    const attendance = getAttendanceForEmployeeDate(employee, day);
    if (attendance?.status) {
      return attendance.status;
    }

    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // IF DATE IS IN THE FUTURE, DO NOT MARK ABSENT
    if (date > today) {
      return null;
    }

    const dayName = DAYS_OF_WEEK[date.getDay()];

    const workingDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
    ];

    if (workingDays.includes(dayName)) {
      return "Absent";
    }

    return "Weekly Off";
  };

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
          {/* DEPARTMENT FILTER */}
          <div className="filter-select-group">
            <label htmlFor="deptSelect">Department:</label>
            <select
              id="deptSelect"
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              disabled={employeesLoading}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* EMPLOYEE FILTER */}
          <div className="filter-select-group">
            <label htmlFor="employeeSelect">Employee:</label>
            <select
              id="employeeSelect"
              value={selectedEmployee}
              onChange={(event) => setSelectedEmployee(event.target.value)}
              disabled={employeesLoading}
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
            <button type="button" onClick={handlePrevMonth}>
              &larr; Prev
            </button>
            <button type="button" onClick={handleNextMonth}>
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {employeesLoading && <p className="loading">Loading employees...</p>}
      {!employeesLoading && loading && (
        <p className="loading">Loading calendar...</p>
      )}
      {error && <p className="error-message">{error}</p>}

      {!employeesLoading && !loading && !error && (
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

          {/* CALENDAR GRID */}
          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayIndex }).map((_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(year, month - 1, day);
              const dayName = DAYS_OF_WEEK[date.getDay()];
              const employeesForDay = calendarEmployees;

              // Check if date is in the future
              const today = new Date();
              today.setHours(23, 59, 59, 999);
              const isFuture = date > today;
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={day}
                  className={`calendar-day ${isFuture ? "future-day" : ""} ${
                    isToday ? "today" : ""
                  }`}
                  title={`${dayName}, ${MONTH_NAMES[month - 1]} ${day}, ${year}`}
                >
                  <span className="day-number">{day}</span>

                  <div className="day-logs">
                    {/* ONLY SHOW LOGS/BADGES UP TO TODAY */}
                    {!isFuture &&
                      employeesForDay.map((employee) => {
                        const attendance = getAttendanceForEmployeeDate(
                          employee,
                          day,
                        );
                        const status = getStatusForEmployeeDate(employee, day);
                        if (!status) return null;

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
                              <span className="badge-status">{status}</span>
                              {attendance?.flags?.includes("late") && (
                                <span className="badge-late">L</span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {!isFuture && calendarEmployees.length === 0 && (
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
