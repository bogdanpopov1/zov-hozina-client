import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Мы больше не используем cookie для аутентификации,
// поэтому глобальная настройка withCredentials не нужна.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Мы по-прежнему используем localStorage для хранения токена
    const [token, setToken] = useState(localStorage.getItem('token'));

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        // Эта логика остается: при загрузке приложения, если есть токен,
        // мы добавляем его в заголовки и пытаемся получить данные пользователя.
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get(`${API_URL}/api/user`)
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    // Если токен недействителен, очищаем все
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                });
        }
    }, [token, API_URL]);

    const login = async (credentials) => {
        // УБРАЛИ ЗАПРОС CSRF-ТОКЕНА. Сразу отправляем данные.
        const response = await axios.post(`${API_URL}/api/login`, credentials);
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const register = async (data) => {
        // УБРАЛИ ЗАПРОС CSRF-ТОКЕНА. Сразу отправляем данные.
        await axios.post(`${API_URL}/api/register`, data);
        // После регистрации сразу логинимся, чтобы получить токен
        await login({ email: data.email, password: data.password });
    };

    const logout = async () => {
        try {
            // Запрос на выход по-прежнему требует токен, который уже в заголовках
            await axios.post(`${API_URL}/api/logout`);
        } catch (error) {
            console.error("Logout request failed, but clearing client-side session anyway.", error);
        } finally {
            // Очищаем состояние и localStorage в любом случае
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
