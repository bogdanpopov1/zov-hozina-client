import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    // НОВОЕ СОСТОЯНИЕ: отслеживаем первоначальную загрузку/проверку аутентификации
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL;

    // ИЗМЕНЕННЫЙ useEffect: теперь он управляет состоянием isLoading
    useEffect(() => {
        const checkLoggedIn = async () => {
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await axios.get(`${API_URL}/api/user`);
                    setUser(response.data);
                } catch (error) {
                    // Если токен недействителен, очищаем все
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                } finally {
                    // Проверка завершена (успешно или нет), убираем загрузку
                    setIsLoading(false);
                }
            } else {
                // Если токена нет, проверять нечего, загрузка завершена
                setIsLoading(false);
            }
        };

        checkLoggedIn();
    }, [token, API_URL]);

    const login = async (credentials) => {
        const response = await axios.post(`${API_URL}/api/login`, credentials);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token); // Это вызовет повторный запуск useEffect и установит user
    };

    const register = async (data) => {
        await axios.post(`${API_URL}/api/register`, data);
        await login({ email: data.email, password: data.password });
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/api/logout`);
        } catch (error) {
            console.error("Logout request failed, but clearing client-side session anyway.", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };
    
    const updateUser = async (data) => {
        const response = await axios.put(`${API_URL}/api/user`, data);
        setUser(response.data);
    };

    return (
        // Добавляем isLoading в контекст
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);