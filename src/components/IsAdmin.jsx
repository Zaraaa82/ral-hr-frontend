import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function IsAdmin({ children }) {
    const { loading, user } = useAuth()

    if (loading) return <p>Loading...</p>

    if (user.role !== 'HR Admin') {
        return <Navigate to="/" />;
    }

    return children;
}

export default IsAdmin;