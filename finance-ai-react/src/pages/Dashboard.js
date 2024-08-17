import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthProvider';

const Dashboard = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(isAuthenticated)
        if (!isAuthenticated) {
            navigate("/login")
        }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated === undefined) {
        return null;
    }

    return  <h1>Dashboard</h1>;
  };
  
  export default Dashboard;