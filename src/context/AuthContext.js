import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig'; // Используем настроенный экземпляр

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const checkLoggedIn = async () => {
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await api.get(`/api/user`);
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    delete api.defaults.headers.common['Authorization'];
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        checkLoggedIn();
    }, [token]);

    const login = async (credentials) => {
        try {
            const response = await api.post(`/api/login`, credentials);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (err) {
            let errorMessage = 'Произошла ошибка. Попробуйте снова.';
            if (err.response && err.response.data) {
                const errors = err.response.data.errors;
                if (errors) {
                    const firstErrorKey = Object.keys(errors)[0];
                    errorMessage = errors[firstErrorKey][0];
                } else {
                    errorMessage = err.response.data.message || errorMessage;
                }
            }
            return { success: false, error: errorMessage };
        }
    };

    const register = async (data) => {
        try {
            await api.post(`/api/register`, data);
            const loginResult = await login({ email: data.email, password: data.password });
            return loginResult;
        } catch (err) {
            let errorMessage = 'Ошибка при регистрации. Попробуйте снова.';
            if (err.response && err.response.data) {
                const errors = err.response.data.errors;
                if (errors) {
                    const firstErrorKey = Object.keys(errors)[0];
                    errorMessage = errors[firstErrorKey][0];
                } else {
                    errorMessage = err.response.data.message || errorMessage;
                }
            }
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await api.post(`/api/logout`);
        } catch (error) {
            console.error("Logout request failed, but clearing client-side session anyway.", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    const updateUser = async (data) => {
        const response = await api.put(`/api/user`, data);
        setUser(response.data);
    };

    const updateVolunteerStatus = async (isVolunteer) => {
        try {
            const response = await api.put('/api/user/volunteer-status', { is_volunteer: isVolunteer });
            setUser(response.data); // Обновляем пользователя новыми данными с сервера
            return { success: true };
        } catch (error) {
            console.error("Failed to update volunteer status", error);
            return { success: false, error: "Не удалось обновить статус" };
        }
    };

    const value = { user, isLoading, login, register, logout, updateUser, updateVolunteerStatus };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);