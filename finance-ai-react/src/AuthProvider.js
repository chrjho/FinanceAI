import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { HttpStatusCode } from "axios";
import Cookies from "universal-cookie"

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const cookies = new Cookies();

    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        const checkAuth = () => {
            const token = cookies.get("access");
            console.log("Token on refresh:", token);

            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuth();

        window.addEventListener("focus", checkAuth);

        return () => {
            window.removeEventListener("focus", checkAuth);
        };
    }, []);

    if (isAuthenticated === undefined) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        {children}
    </AuthContext.Provider>;
}

export default AuthProvider