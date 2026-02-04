import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthModal.module.css';
import { X } from 'lucide-react';

const AuthModal = ({ onClose }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isRegister) {
            if (password !== passwordConfirmation) {
                setError('Пароли не совпадают');
                return;
            }
            result = await register({ name, email, password, password_confirmation: passwordConfirmation });
        } else {
            result = await login({ email, password });
        }

        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
                <h2>{isRegister ? 'Регистрация' : 'Вход в аккаунт'}</h2>
                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <input type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} required />
                    )}
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {isRegister && (
                        <input type="password" placeholder="Повторите пароль" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
                    )}
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.submitButton}>
                        {isRegister ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                    {/* <div className={styles.separator}>или</div>
                    <button type="button" className={styles.telegramButton}>
                        Войти через Telegram
                    </button> */}
                </form>
                <div className={styles.toggleForm}>
                    {isRegister ? 'Уже есть аккаунт?' : 'Еще нет аккаунта?'}
                    <button onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Войти' : 'Создать'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;