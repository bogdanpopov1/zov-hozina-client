import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useAnnouncement } from '../context/AnnouncementContext';
import AuthModal from '../components/common/AuthModal';
import ImageUploader from '../components/form/ImageUploader';
import BreedInput from '../components/form/BreedInput';
import styles from './CreateAnnouncementPage.module.css';
import useDebounce from '../hooks/useDebounce';

const CreateAnnouncementPage = () => {
    // ... (вся логика, хуки и функции остаются БЕЗ ИЗМЕНЕНИЙ)
    const navigate = useNavigate();
    const { user } = useAuth();
    const { quickFormData, resetQuickForm } = useAnnouncement();
    const isSubmittingRef = useRef(false);

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        announcement_type: 'lost',
        pet_type: '',
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

    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isAddressSuggestionsVisible, setAddressSuggestionsVisible] = useState(false);
    const debouncedLocationInput = useDebounce(formData.location_address, 400);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories');
                const activeCategories = response.data;
                setCategories(activeCategories);

                const quickCategory = activeCategories.find(c => c.slug.includes(quickFormData.pet_type));
                if (quickCategory) {
                    setFormData(prev => ({ ...prev, pet_type: quickCategory.name }));
                } else if (activeCategories.length > 0) {
                    setFormData(prev => ({ ...prev, pet_type: activeCategories[0].name }));
                }
            } catch (error) { console.error("Failed to fetch categories", error); }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            announcement_type: quickFormData.adType || 'lost',
            gender: quickFormData.gender || 'unknown',
            location_address: quickFormData.location_address || '',
            latitude: quickFormData.latitude || null,
            longitude: quickFormData.longitude || null,
        }));
    }, [quickFormData]);

    useEffect(() => {
        if (debouncedLocationInput.length > 2) {
            const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
            const token = process.env.REACT_APP_DADATA_API_KEY;
            const options = {
                method: "POST", mode: "cors",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": "Token " + token },
                body: JSON.stringify({ query: debouncedLocationInput, count: 5 })
            };
            fetch(url, options)
                .then(response => response.json())
                .then(result => setAddressSuggestions(result.suggestions || []))
                .catch(error => console.log("Ошибка DaData:", error));
        } else {
            setAddressSuggestions([]);
        }
    }, [debouncedLocationInput]);

    const handleAddressSuggestionClick = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            location_address: suggestion.value,
            latitude: suggestion.data.geo_lat,
            longitude: suggestion.data.geo_lon,
        }));
        setAddressSuggestionsVisible(false);
    };

    const selectedCategoryId = useMemo(() => {
        return categories.find(c => c.name === formData.pet_type)?.category_id;
    }, [formData.pet_type, categories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBreedChange = (value) => {
        setFormData(prev => ({ ...prev, pet_breed: value }));
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
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setSubmitting(true);
        
        const data = new FormData();
        const finalPetType = formData.pet_type === 'Другое' ? formData.other_pet_type : formData.pet_type;
        const dataToSend = { ...formData, pet_type: finalPetType };
        delete dataToSend.other_pet_type;

        for (const key in dataToSend) {
            if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
                data.append(key, dataToSend[key]);
            }
        }
        
        selectedFiles.forEach(file => { data.append('photos[]', file); });

        try {
            await api.post('/api/announcements', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            resetQuickForm();
            navigate(`/map`);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: err.response?.data?.message || 'Произошла непредвиденная ошибка.' });
            }
        } finally {
            isSubmittingRef.current = false;
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user && isAuthModalOpen) {
            setAuthModalOpen(false);
            submitData();
        }
    }, [user, isAuthModalOpen]);

    // --- НАЧАЛО ИСПРАВЛЕНИЙ В JSX ---
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
                                <button type="button" onClick={() => handleChange({ target: { name: 'announcement_type', value: 'lost' } })} className={formData.announcement_type === 'lost' ? styles.active : ''}>Ищу питомца</button>
                                <button type="button" onClick={() => handleChange({ target: { name: 'announcement_type', value: 'found' } })} className={formData.announcement_type === 'found' ? styles.active : ''}>Нашел питомца</button>
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
                                        {categories.map(cat => (
                                            <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                                        ))}
                                        <option value="Другое">Другое</option>
                                    </select>
                                </div>
                                
                                {formData.pet_type === 'Другое' && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="other_pet_type">Укажите вид</label>
                                        <input type="text" id="other_pet_type" name="other_pet_type" value={formData.other_pet_type} onChange={handleChange} placeholder="Например, Енот" />
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label htmlFor="pet_breed">Порода</label>
                                    <BreedInput
                                        value={formData.pet_breed}
                                        onChange={handleBreedChange}
                                        categoryId={selectedCategoryId}
                                        disabled={formData.pet_type === 'Другое'}
                                    />
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

                        {/* --- ВОССТАНОВЛЕННЫЙ БЛОК ДЛЯ ФОТОГРАФИЙ --- */}
                        <div className={styles.formSection}>
                            <h3>Фотографии</h3>
                            <ImageUploader files={selectedFiles} onFilesChange={setSelectedFiles} />
                            {errors.photos && <span className={styles.fieldError}>{errors.photos[0]}</span>}
                        </div>
                        
                        <div className={styles.formSection}>
                            <h3>Описание и местоположение</h3>
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Подробное описание</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="5" placeholder="Опишите особые приметы, характер, обстоятельства..."></textarea>
                            </div>
                            
                            <div className={`${styles.formGroup} ${styles.locationGroup}`}>
                                <label htmlFor="location_address">Адрес</label>
                                <input 
                                    type="text" 
                                    id="location_address" 
                                    name="location_address" 
                                    value={formData.location_address} 
                                    onChange={handleChange} 
                                    onFocus={() => setAddressSuggestionsVisible(true)}
                                    onBlur={() => setTimeout(() => setAddressSuggestionsVisible(false), 200)}
                                    autoComplete="off" 
                                />
                                {errors.location_address && <span className={styles.fieldError}>{errors.location_address[0]}</span>}
                                {isAddressSuggestionsVisible && addressSuggestions.length > 0 && (
                                    <ul className={styles.suggestionsList}>
                                        {addressSuggestions.map((suggestion, index) => (
                                            <li key={index} onMouseDown={() => handleAddressSuggestionClick(suggestion)}>
                                                {suggestion.value}
                                            </li>
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