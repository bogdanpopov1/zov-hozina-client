import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './ProfilePage.module.css'; // Создадим стили далее

const ProfilePage = () => {
    const { user, updateUser } = useAuth(); // Получаем пользователя и новую функцию updateUser
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        bio: '',
    });
    const [message, setMessage] = useState('');

    // Когда компонент загружается или меняется user, заполняем форму его данными
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await updateUser(formData);
            setMessage('Профиль успешно обновлен!');
        } catch (error) {
            setMessage('Ошибка при обновлении профиля. Попробуйте снова.');
            console.error(error);
        }
    };

    if (!user) {
        return <div>Загрузка профиля...</div>;
    }

    return (
        <div className={styles.profilePage}>
            <div className={styles.container}>
                <h1>Профиль пользователя</h1>
                <div className={styles.profileContent}>
                    <div className={styles.avatarSection}>
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Аватар" />
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                    </div>
                    <div className={styles.formSection}>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Имя</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Телефон</label>
                                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="location">Город</label>
                                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="bio">О себе</label>
                                <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows="4"></textarea>
                            </div>
                            <button type="submit" className={styles.submitButton}>Сохранить изменения</button>
                            {message && <p className={styles.message}>{message}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;