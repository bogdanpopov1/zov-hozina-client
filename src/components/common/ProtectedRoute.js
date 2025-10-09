import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    // Получаем и пользователя, и состояние загрузки
    const { user, isLoading } = useAuth();

    // 1. Если проверка еще идет, показываем заглушку
    if (isLoading) {
        // Можете здесь разместить красивый спиннер
        return <div>Загрузка...</div>;
    }

    // 2. Если проверка завершилась и пользователя нет, перенаправляем
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 3. Если проверка завершилась и пользователь есть, показываем страницу
    return children;
};

export default ProtectedRoute;