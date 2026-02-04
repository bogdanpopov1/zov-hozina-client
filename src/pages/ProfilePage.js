import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './ProfilePage.module.css';
import VolunteerSubscriptions from '../components/profile/VolunteerSubscriptions';
import useDebounce from '../hooks/useDebounce';

const ProfilePage = () => {
    const { user, updateUser, updateVolunteerStatus, logout } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        telegram_username: '',
        location: '',
        bio: '',
    });
    const [message, setMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [isCityFocused, setIsCityFocused] = useState(false);
    const debouncedLocation = useDebounce(formData.location, 400);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                telegram_username: user.telegram_username || '',
                location: user.location || '',
                bio: user.bio || '',
            });
            setIsVolunteer(user.is_volunteer || false);
        }
    }, [user]);

    useEffect(() => {
        if (debouncedLocation.length > 2) {
            const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
            const token = process.env.REACT_APP_DADATA_API_KEY;
            const options = {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + token
                },
                body: JSON.stringify({
                    query: debouncedLocation,
                    count: 5,
                    from_bound: { "value": "city" },
                    to_bound: { "value": "city" }
                })
            };
            fetch(url, options)
                .then(response => response.json())
                .then(result => setCitySuggestions(result.suggestions || []))
                .catch(error => console.log("Ошибка DaData:", error));
        } else {
            setCitySuggestions([]);
        }
    }, [debouncedLocation]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCitySelect = (suggestion) => {
        setFormData(prev => ({ ...prev, location: suggestion.value }));
        setCitySuggestions([]);
        setIsCityFocused(false);
    };

    const handleVolunteerToggle = async (e) => {
        const newStatus = e.target.checked;
        setIsVolunteer(newStatus);
        const result = await updateVolunteerStatus(newStatus);
        if (result.success) {
            setMessage('Статус волонтера успешно обновлен!');
        } else {
            setMessage(result.error);
            setIsVolunteer(!newStatus);
        }
    };

    const validateForm = () => {
        const errors = {};
        const phoneRegex = /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            errors.phone = 'Введите корректный российский номер телефона.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!validateForm()) {
            return;
        }
        try {
            await updateUser(formData);
            setMessage('Профиль успешно обновлен!');
        } catch (error) {
            setMessage('Ошибка при обновлении профиля. Попробуйте снова.');
            console.error(error);
        }
    };

    if (!user) {
        return <div className={styles.loading}>Загрузка профиля...</div>;
    }

    return (
        <div className={styles.profilePage}>
            <div className={styles.container}>
                <h1>Профиль пользователя</h1>
                <div className={styles.profileContent}>
                    <div className={styles.avatarSection}>
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B82F6&color=fff`} alt={user.name} />
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                    </div>
                    <div className={styles.formSection}>
                        <form onSubmit={handleSubmit} className={styles.profileForm}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Имя</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input type="email" name="email" value={formData.email} disabled />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Телефон</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                    {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Telegram</label>
                                    <input type="text" name="telegram_username" value={formData.telegram_username} onChange={handleChange} />
                                </div>
                                <div className={`${styles.formGroup} ${styles.locationGroup}`}>
                                    <label>Город</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        onFocus={() => setIsCityFocused(true)}
                                        onBlur={() => setTimeout(() => setIsCityFocused(false), 200)}
                                        autoComplete="off"
                                    />
                                    {isCityFocused && citySuggestions.length > 0 && (
                                        <ul className={styles.suggestionsList}>
                                            {citySuggestions.map((s, i) => (
                                                <li key={i} onMouseDown={() => handleCitySelect(s)}>
                                                    {s.value}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className={styles.formGroup}>
                                    <label>О себе</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange}></textarea>
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <button type="submit" className={styles.submitButton}>Сохранить изменения</button>
                                <button type="button" onClick={logout} className={styles.logoutButton}>Выйти</button>
                            </div>
                        </form>
                        <div className={styles.volunteerSection}>
                            <div className={styles.volunteerToggleHeader}>
                                <div>
                                    <h3>Статус волонтера</h3>
                                    <p>Включите, чтобы помогать в поисках и получать уведомления.</p>
                                </div>
                                <label className={styles.switch}>
                                    <input type="checkbox" checked={isVolunteer} onChange={handleVolunteerToggle} />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                            {isVolunteer && <VolunteerSubscriptions />}
                        </div>
                    </div>
                </div>
                {message && <p className={styles.message}>{message}</p>}
            </div>
        </div>
    );
};

export default ProfilePage;