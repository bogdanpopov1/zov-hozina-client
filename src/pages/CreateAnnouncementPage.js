import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; // <-- ИСПОЛЬЗУЕМ НАШ НОВЫЙ КЛИЕНТ
import { useAuth } from '../context/AuthContext';
import { useAnnouncement } from '../context/AnnouncementContext';
import AuthModal from '../components/common/AuthModal';
import styles from './CreateAnnouncementPage.module.css';

// Хук для "дебаунса" ввода, чтобы не слать запросы на каждый символ
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const CreateAnnouncementPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { quickFormData, resetQuickForm } = useAnnouncement();

    const [formData, setFormData] = useState({
        announcement_type: 'lost',
        pet_type: 'dog',
        other_pet_type: '',
        pet_name: '',
        pet_breed: '',
        description: '',
        location_address: '',
        latitude: null,
        longitude: null,
        gender: 'unknown',
        color: '',
        age: '',
    });

    // Состояния для DaData
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const debouncedLocationInput = useDebounce(formData.location_address, 500);

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            announcement_type: quickFormData.adType || 'lost',
            pet_type: ['dog', 'cat', 'bird'].includes(quickFormData.pet_type) ? quickFormData.pet_type : 'other',
            other_pet_type: ['dog', 'cat', 'bird'].includes(quickFormData.pet_type) ? '' : quickFormData.pet_type,
            gender: quickFormData.gender || 'unknown',
            location_address: quickFormData.location_address || '',
            latitude: quickFormData.latitude || null,
            longitude: quickFormData.longitude || null,
        }));
    }, [quickFormData]);

    // Эффект для получения подсказок адреса от DaData
    useEffect(() => {
        if (debouncedLocationInput.length > 2) {
            const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
            const token = process.env.REACT_APP_DADATA_API_KEY;
            const options = {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": "Token " + token },
                body: JSON.stringify({ query: debouncedLocationInput, count: 5 })
            };
            fetch(url, options)
                .then(response => response.json())
                .then(result => {
                    setSuggestions(result.suggestions || []);
                    setSuggestionsVisible(true);
                })
                .catch(error => console.log("Ошибка DaData:", error));
        } else {
            setSuggestions([]);
        }
    }, [debouncedLocationInput]);

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            location_address: suggestion.value,
            latitude: suggestion.data.geo_lat,
            longitude: suggestion.data.geo_lon,
        }));
        setSuggestionsVisible(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        if (!user) {
            setAuthModalOpen(true);
            return;
        }
        await submitData();
    };

    const submitData = async () => {
        setSubmitting(true);

        // Подготавливаем данные для отправки
        const dataToSend = {
            ...formData,
            pet_type: formData.pet_type === 'other' ? formData.other_pet_type : formData.pet_type,
        };
        delete dataToSend.other_pet_type; // Удаляем временное поле

        try {
            const response = await api.post('/api/announcements', dataToSend);
            resetQuickForm();
            navigate(`/map`); // Можно перенаправить на страницу объявления: /announcements/${response.data.announcement_id}
        } catch (err) {
            if (err.response?.status === 422) {
                // Ошибки валидации
                setErrors(err.response.data.errors);
            } else {
                // Все остальные ошибки (включая 405, 500 и т.д.)
                const errorMessage = err.response?.data?.message || err.message || 'Произошла непредвиденная ошибка.';
                setErrors({ general: errorMessage });
            }
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user && isAuthModalOpen) {
            setAuthModalOpen(false);
            submitData();
        }
    }, [user, isAuthModalOpen]);

    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.formWrapper}>
                    <h1>Новое объявление</h1>
                    <p className={styles.subtitle}>Заполните все детали, чтобы повысить шансы на успешный поиск.</p>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className={styles.formSection}>
                            <h3>Тип объявления</h3>
                            <div className={styles.buttonGroup}>
                                <button type="button" onClick={() => handleChange({ target: { name: 'announcement_type', value: 'lost' } })} className={formData.announcement_type === 'lost' ? styles.active : ''}>
                                    Ищу питомца
                                </button>
                                <button type="button" onClick={() => handleChange({ target: { name: 'announcement_type', value: 'found' } })} className={formData.announcement_type === 'found' ? styles.active : ''}>
                                    Нашел питомца
                                </button>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3>Основная информация</h3>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="pet_name">Кличка питомца</label>
                                    <input type="text" id="pet_name" name="pet_name" value={formData.pet_name} onChange={handleChange} />
                                    {errors.pet_name && <span className={styles.fieldError}>{errors.pet_name[0]}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="pet_type">Вид питомца</label>
                                    <select id="pet_type" name="pet_type" value={formData.pet_type} onChange={handleChange}>
                                        <option value="dog">Собака</option>
                                        <option value="cat">Кошка</option>
                                        <option value="bird">Птица</option>
                                        <option value="other">Другое</option>
                                    </select>
                                </div>
                                {formData.pet_type === 'other' && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="other_pet_type">Укажите вид</label>
                                        <input type="text" id="other_pet_type" name="other_pet_type" value={formData.other_pet_type} onChange={handleChange} />
                                    </div>
                                )}
                                <div className={styles.formGroup}>
                                    <label htmlFor="pet_breed">Порода</label>
                                    <input type="text" id="pet_breed" name="pet_breed" value={formData.pet_breed} onChange={handleChange} placeholder="Например, метис или неизвестна" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="color">Окрас</label>
                                    <input type="text" id="color" name="color" value={formData.color} onChange={handleChange} />
                                    {errors.color && <span className={styles.fieldError}>{errors.color[0]}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="gender">Пол</label>
                                    <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="male">Мальчик</option>
                                        <option value="female">Девочка</option>
                                        <option value="unknown">Неизвестно</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="age">Возраст (лет)</label>
                                    <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} min="0" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <h3>Описание и местоположение</h3>
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Подробное описание</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Опишите особые приметы, характер, обстоятельства..."></textarea>
                            </div>
                            <div className={`${styles.formGroup} ${styles.locationGroup}`}>
                                <label htmlFor="location_address">Адрес</label>
                                <input type="text" id="location_address" name="location_address" value={formData.location_address} onChange={handleChange} autoComplete="off" />
                                {errors.location_address && <span className={styles.fieldError}>{errors.location_address[0]}</span>}
                                {isSuggestionsVisible && suggestions.length > 0 && (
                                    <ul className={styles.suggestionsList}>
                                        {suggestions.map((suggestion, index) => (
                                            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>{suggestion.value}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {errors.general && <p className={styles.error}>{errors.general}</p>}

                        <button type="submit" className={styles.submitButton} disabled={submitting}>
                            {submitting ? 'Публикация...' : 'Опубликовать объявление'}
                        </button>
                    </form>
                </div>
            </div>
            {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        </>
    );
};

export default CreateAnnouncementPage;