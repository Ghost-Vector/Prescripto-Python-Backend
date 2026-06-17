import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [doctors, setDoctors] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Initialize with token from localStorage
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });

    // Fetch doctors data
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Doctors fetch error:', error);
            toast.error("Failed to load doctors");
        }
    };

    // Load user profile
    const loadUserProfile = async () => {
        if (!token) {
            setUserData(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
                logout();
            }
        } catch (error) {
            console.error('Profile load error:', error);
            toast.error("Failed to load profile");
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserData(null);
    };

    // Initialize data
    useEffect(() => {
        getDoctorsData();
    }, []);

    // Load profile when token changes
    useEffect(() => {
        loadUserProfile();
    }, [token]);

    return (
        <AppContext.Provider value={{
            doctors, getDoctorsData,
            userData,
            token,
            setToken,
            backendUrl,
            loading,
            loadUserProfile,
            logout
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;