import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useAnnouncement } from '../context/AnnouncementContext';
import AuthModal from '../components/common/AuthModal';
import ImageUploader from '../components/form/ImageUploader';
import BreedInput from '../components/form/BreedInput';
import styles from './CreateAnnouncementPage.module.css';
import useDebounce from '../hooks/useDebounce';
import { LocateFixed, Loader2 } from 'lucide-react';

const CreateAnnouncementPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { quickFormData, resetQuickForm } = useAnnouncement();
    const isSubmittingRef = useRef(false);

    const isEditMode = !!id;

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
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

    const [existingPhotos, setExistingPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [photosToDelete, setPhotosToDelete] = useState([]);
    const [primaryPhotoId, setPrimaryPhotoId] = useState(null);

    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isAddressSuggestionsVisible, setAddressSuggestionsVisible] = useState(false);
    const debouncedLocationInput = useDebounce(formData.location_address, 400);

    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const initData = async () => {
            if (isEditMode) {
                setIsLoadingData(true);
                try {
                    const response = await api.get(`/api/announcements/${id}`);
                    const data = response.data;

                    if (user && data.user_id !== user.user_id) {
                        alert("Вы не можете редактировать чужое объявление");
                        navigate('/');
                        return;
                    }

                    setFormData({
                        announcement_type: data.announcement_type || 'lost',
                        pet_type: data.pet_type || '',
                        other_pet_type: '',
                        pet_name: data.pet_name || '',
                        pet_breed: data.pet_breed || '',
                        description: data.description || '',
                        location_address: data.location_address || '',
                        latitude: data.latitude || null,
                        longitude: data.longitude || null,
                        gender: data.gender || 'unknown',
                        color: data.color || '',
                        age: data.age || '',
                    });

                    setExistingPhotos(data.photos || []);
                    const primary = data.photos?.find(p => p.is_primary);
                    setPrimaryPhotoId(primary ? primary.photo_id : (data.photos?.[0]?.photo_id || null));

                } catch (error) {
                    console.error("Ошибка загрузки объявления:", error);
                    alert("Не удалось загрузить данные объявления.");
                    navigate('/my-ads');
                } finally {
                    setIsLoadingData(false);
                }
            } else {
                if (categories.length > 0) {
                    const petTypeMap = { dog: 'Собака', cat: 'Кошка', bird: 'Птица' };
                    const incomingPetType = petTypeMap[quickFormData.pet_type] || quickFormData.pet_type;
                    const categoryNames = categories.map(c => c.name);
                    const isKnownCategory = categoryNames.includes(incomingPetType);

                    setFormData(prev => ({
                        ...prev,
                        announcement_type: quickFormData.adType || 'lost',
                        pet_type: isKnownCategory ? incomingPetType : (incomingPetType ? 'Другое' : ''),
                        other_pet_type: isKnownCategory ? '' : (incomingPetType || ''),
                        gender: quickFormData.gender || 'unknown',
                        location_address: quickFormData.location_address || '',
                        latitude: quickFormData.latitude || null,
                        longitude: quickFormData.longitude || null,
                    }));
                }
                setIsLoadingData(false);
            }
        };

        if (categories.length > 0 || isEditMode) {
            initData();
        }
    }, [isEditMode, id, categories, quickFormData, user, navigate]);


    useEffect(() => {
        if (!debouncedLocationInput || debouncedLocationInput.length <= 2) {
            setAddressSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
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
                body: JSON.stringify({ query: debouncedLocationInput, count: 5 })
            };
            try {
                const response = await fetch(url, options);
                const result = await response.json();
                setAddressSuggestions(result.suggestions || []);
            } catch (error) {
                console.log("Ошибка DaData:", error);
            }
        };

        fetchSuggestions();
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

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Ваш браузер не поддерживает геолокацию.');
            return;
        }
        setIsDetectingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address";
                const token = process.env.REACT_APP_DADATA_API_KEY;
                const options = {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": "Token " + token
                    },
                    body: JSON.stringify({ lat: latitude, lon: longitude, count: 1 })
                };
                try {
                    const response = await fetch(url, options);
                    const result = await response.json();
                    if (result.suggestions && result.suggestions.length > 0) {
                        handleAddressSuggestionClick(result.suggestions[0]);
                    }
                } catch (error) {
                    console.error("Ошибка обратного геокодирования DaData:", error);
                    alert('Не удалось определить адрес по координатам.');
                } finally {
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                setIsDetectingLocation(false);
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Вы запретили доступ к геолокации. Пожалуйста, разрешите доступ в настройках браузера.');
                } else {
                    alert('Не удалось определить ваше местоположение.');
                }
            }
        );
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

    const handleDeleteExistingPhoto = (photoId) => {
        setExistingPhotos(prev => prev.filter(p => p.photo_id !== photoId));
        setPhotosToDelete(prev => [...prev, photoId]);
        if (primaryPhotoId === photoId) {
            const remainingPhotos = existingPhotos.filter(p => p.photo_id !== photoId);
            setPrimaryPhotoId(remainingPhotos.length > 0 ? remainingPhotos[0].photo_id : null);
        }
    };

    const submitData = useCallback(async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setSubmitting(true);

        const data = new FormData();
        const finalPetType = formData.pet_type === 'Другое' ? formData.other_pet_type : formData.pet_type;
        const dataToSend = { ...formData, pet_type: finalPetType };
        const fieldsToDelete = ['other_pet_type', 'photos', 'created_at', 'updated_at', 'user'];
        fieldsToDelete.forEach(field => delete dataToSend[field]);

        for (const key in dataToSend) {
            if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
                data.append(key, dataToSend[key]);
            }
        }
        newPhotos.forEach(file => {
            data.append('photos[]', file);
        });

        if (isEditMode) {
            photosToDelete.forEach(id => data.append('photos_to_delete[]', id));
            if (primaryPhotoId) {
                data.append('primary_photo_id', primaryPhotoId);
            }
        }

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' }
        };

        try {
            let response;
            if (isEditMode) {
                data.append('_method', 'PUT');
                response = await api.post(`/api/announcements/${id}`, data, config);
                navigate(`/announcements/${response.data.announcement_id}`);
            } else {
                response = await api.post('/api/announcements', data, config);
                resetQuickForm();
                navigate(`/map`);
            }
        } catch (err) {
            console.error("Ошибка при отправке формы:", err);
            if (err.response?.status === 422) {
                const backendErrors = err.response.data.errors;
                const processedErrors = { ...backendErrors };

                Object.keys(backendErrors).forEach(key => {
                    if (key.startsWith('photos.')) {
                        processedErrors.photos = backendErrors[key];
                    }
                });

                setErrors(processedErrors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setErrors({ general: err.response?.data?.message || 'Произошла непредвиденная ошибка.' });
            }
        } finally {
            isSubmittingRef.current = false;
            setSubmitting(false);
        }
    }, [formData, newPhotos, isEditMode, photosToDelete, primaryPhotoId, id, navigate, resetQuickForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        if (!user) {
            setAuthModalOpen(true);
            return;
        }
        await submitData();
    };

    useEffect(() => {
        if (user && isAuthModalOpen) {
            setAuthModalOpen(false);
            submitData();
        }
    }, [user, isAuthModalOpen, submitData]);

    if (isLoadingData) {
        return <div className={styles.pageContainer}><div className={styles.formWrapper}><p>Загрузка данных...</p></div></div>;
    }

    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.formWrapper}>
                    <h1>{isEditMode ? 'Редактирование объявления' : 'Новое объявление'}</h1>
                    <p className={styles.subtitle}>
                        {isEditMode ? 'Обновите информацию о вашем питомце.' : 'Заполните все детали, чтобы повысить шансы на успешный поиск.'}
                    </p>
                    <div className={styles.formSection}>
                        <h3>Тип объявления</h3>
                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={() => handleChange({ target: { name: 'announcement_type', value: 'lost' } })}
                                className={formData.announcement_type === 'lost' ? styles.active : ''}
                            >
                                Ищу питомца
                            </button>
                            <button
                                type="button"
                                onClick={() => handleChange({ target: { name: 'announcement_type', value: 'found' } })}
                                className={formData.announcement_type === 'found' ? styles.active : ''}
                            >
                                Нашел питомца
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}>
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
                                        <option value="">Выберите вид</option>
                                        {categories.map(cat => (
                                            <option key={cat.category_id} value={cat.name}>{cat.name}</option>
                                        ))}
                                        <option value="Другое">Другое</option>
                                    </select>
                                    {errors.pet_type && <span className={styles.fieldError}>{errors.pet_type[0]}</span>}
                                </div>
                                {formData.pet_type === 'Другое' && (
                                    <div className={styles.formGroup}>
                                        <label htmlFor="other_pet_type">Укажите вид</label>
                                        <input type="text" id="other_pet_type" name="other_pet_type" value={formData.other_pet_type} onChange={handleChange} />
                                    </div>
                                )}
                                <div className={styles.formGroup}>
                                    <label htmlFor="pet_breed">Порода</label>
                                    <BreedInput
                                        value={formData.pet_breed}
                                        onChange={handleBreedChange}
                                        categoryId={selectedCategoryId}
                                    />
                                    {errors.pet_breed && <span className={styles.fieldError}>{errors.pet_breed[0]}</span>}
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
                                    {errors.gender && <span className={styles.fieldError}>{errors.gender[0]}</span>}
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="age">Возраст (лет)</label>
                                    <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} />
                                    {errors.age && <span className={styles.fieldError}>{errors.age[0]}</span>}
                                </div>
                            </div>
                        </div>
                        <div className={styles.formSection}>
                            <h3>Фотографии</h3>
                            <ImageUploader
                                existingPhotos={existingPhotos}
                                newFiles={newPhotos}
                                onNewFilesChange={setNewPhotos}
                                onDeleteExisting={handleDeleteExistingPhoto}
                                onSetPrimary={setPrimaryPhotoId}
                                primaryPhotoId={primaryPhotoId}
                            />
                            {errors.photos && <span className={styles.fieldError}>{errors.photos[0]}</span>}
                        </div>
                        <div className={styles.formSection}>
                            <h3>Описание и местоположение</h3>
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Подробное описание</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
                                {errors.description && <span className={styles.fieldError}>{errors.description[0]}</span>}
                            </div>
                            <div className={`${styles.formGroup} ${styles.locationGroup}`}>
                                <label htmlFor="location_address">Адрес</label>
                                <div className={styles.inputWithButton}>
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
                                    <button type="button" onClick={handleAutoDetectLocation} disabled={isDetectingLocation} className={styles.detectButton}>
                                        {isDetectingLocation ? <Loader2 className={styles.spinner} /> : <LocateFixed />}
                                    </button>
                                </div>
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
                        {errors.general && <div className={styles.error}>{errors.general}</div>}
                        <button type="submit" disabled={submitting} className={styles.submitButton}>
                            {submitting ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Опубликовать объявление')}
                        </button>
                    </form>
                </div>
            </div>
            {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        </>
    );
};

export default CreateAnnouncementPage;