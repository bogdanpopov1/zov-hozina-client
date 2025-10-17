import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Импортируем
import { useAnnouncement } from '../../context/AnnouncementContext'; // <-- Импортируем
import styles from './QuickAdForm.module.css';
// ... (остальные импорты иконок)
import { ReactComponent as SearchPawIcon } from '../../assets/icons/search-paw.svg';
import { ReactComponent as DogIcon } from '../../assets/icons/dog.svg';
import { ReactComponent as CatIcon } from '../../assets/icons/cat.svg';
import { ReactComponent as BirdIcon } from '../../assets/icons/bird.svg';
import { ReactComponent as SquirrelIcon } from '../../assets/icons/squirrel.svg';
import { ReactComponent as HouseIcon } from '../../assets/icons/house.svg';
import { ReactComponent as MaleIcon } from '../../assets/icons/male.svg';
import { ReactComponent as FemaleIcon } from '../../assets/icons/female.svg';
import { ReactComponent as UnknownIcon } from '../../assets/icons/unknown.svg';
import { ReactComponent as MapPinIcon } from '../../assets/icons/map-pin.svg';
import { ReactComponent as AutoDetectIcon } from '../../assets/icons/auto-detect.svg';
import { VscClose } from 'react-icons/vsc';

// ... (хук useDebounce остается без изменений)
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};


const QuickAdForm = () => {
    const navigate = useNavigate(); // <-- Инициализируем
    const { updateQuickForm } = useAnnouncement(); // <-- Получаем функцию из контекста

    const [adType, setAdType] = useState('lost');
    const [petType, setPetType] = useState('dog');
    const [gender, setGender] = useState('male');
    const [locationInput, setLocationInput] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState(null); // Для хранения координат
    
    // ... (остальные состояния без изменений)
    const [otherPetInput, setOtherPetInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const debouncedLocationInput = useDebounce(locationInput, 500);

    useEffect(() => {
        if (debouncedLocationInput.length > 2) {
            const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
            const token = process.env.REACT_APP_DADATA_API_KEY;
            const options = {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": "Token " + token },
                body: JSON.stringify({ query: debouncedLocationInput, count: 5, "from_bound": { "value": "city" }, "to_bound": { "value": "house" } })
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
            setSuggestionsVisible(false);
        }
    }, [debouncedLocationInput]);

    const handleSuggestionClick = (suggestion) => {
        setLocationInput(suggestion.value);
        setSelectedSuggestion(suggestion.data); // Сохраняем все данные, включая geo_lat, geo_lon
        setSuggestionsVisible(false);
    };

    const handleGoToDetails = () => {
        const formData = {
            adType: adType,
            pet_type: petType === 'other' ? otherPetInput : petType,
            gender: gender,
            location_address: locationInput,
            latitude: selectedSuggestion?.geo_lat || null,
            longitude: selectedSuggestion?.geo_lon || null,
        };
        updateQuickForm(formData);
        navigate('/create-announcement');
    };

    const buttonClass = (groupState, value) => `${styles.button} ${groupState === value ? styles.active : ''}`;

    return (
        <section className={styles.quickAdSection}>
            <div className="container">
                <h2 className={styles.sectionTitle}>Быстрое объявление</h2>
                <div className={styles.formWrapper}>
                    <div className={styles.iconHeader}><SearchPawIcon /></div>
                    <div className={styles.formContainer}>
                        <div className={styles.buttonGroup}>
                            <button className={buttonClass(adType, 'lost')} onClick={() => setAdType('lost')}><HouseIcon /> Мой питомец потерялся</button>
                            <button className={buttonClass(adType, 'found')} onClick={() => setAdType('found')}><SearchPawIcon /> Я нашел питомца</button>
                        </div>
                        <div className={styles.petTypeGroup}>
                            <div className={styles.buttonGroup}>
                                <button className={buttonClass(petType, 'dog')} onClick={() => setPetType('dog')}><DogIcon /> Собака</button>
                                <button className={buttonClass(petType, 'cat')} onClick={() => setPetType('cat')}><CatIcon /> Кошка</button>
                                <button className={buttonClass(petType, 'bird')} onClick={() => setPetType('bird')}><BirdIcon /> Птица</button>
                                <button className={buttonClass(petType, 'other')} onClick={() => setPetType('other')}><SquirrelIcon /> Другое</button>
                            </div>
                            {petType === 'other' && (
                                <div className={styles.inputWrapper}>
                                    <input type="text" placeholder="Укажите вид" value={otherPetInput} onChange={(e) => setOtherPetInput(e.target.value)} />
                                    {otherPetInput && <button className={styles.clearButton} onClick={() => setOtherPetInput('')}><VscClose /></button>}
                                </div>
                            )}
                        </div>
                        <div className={styles.buttonGroup}>
                            <button className={buttonClass(gender, 'male')} onClick={() => setGender('male')}><MaleIcon /> Мальчик</button>
                            <button className={buttonClass(gender, 'female')} onClick={() => setGender('female')}><FemaleIcon /> Девочка</button>
                            <button className={buttonClass(gender, 'unknown')} onClick={() => setGender('unknown')}><UnknownIcon /> Не знаю</button>
                        </div>
                        <div className={styles.locationInputContainer}>
                             <div className={styles.inputWrapperLocation}>
                                <MapPinIcon />
                                <input
                                    type="text"
                                    placeholder="Где потерялся / нашелся?"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    onFocus={() => { if (suggestions.length > 0) setSuggestionsVisible(true); }}
                                />
                                {locationInput && <button className={styles.clearButton} onClick={() => setLocationInput('')}><VscClose /></button>}
                            </div>
                            {isSuggestionsVisible && suggestions.length > 0 && (
                                <ul className={styles.suggestionsList}>
                                    {suggestions.map((suggestion, index) => (
                                        <li key={index} className={styles.suggestionItem} onClick={() => handleSuggestionClick(suggestion)}>
                                            {suggestion.value}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button className={styles.ctaButton} onClick={handleGoToDetails}>
                            Перейти к деталям
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuickAdForm;