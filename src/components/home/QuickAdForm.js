import React, { useState, useEffect } from 'react';
import styles from './QuickAdForm.module.css';

// Импорты иконок
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

// Кастомный хук для "дебаунса"
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const QuickAdForm = () => {
    const [adType, setAdType] = useState('lost');
    const [petType, setPetType] = useState('dog');
    const [gender, setGender] = useState('male');
    const [locationType, setLocationType] = useState('manual');
    const [locationInput, setLocationInput] = useState('');
    const [otherPetInput, setOtherPetInput] = useState('');
    const [detectedLocation, setDetectedLocation] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedLocationInput = useDebounce(locationInput, 500);

    const handleAutoDetectLocation = () => {
        setLocationType('auto');
        setDetectedLocation(null);
        setError(null);
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setTimeout(() => {
                    setDetectedLocation('Казань, Татарстан');
                    setIsLoading(false);
                }, 1000);
            },
            (err) => {
                setError('Не удалось определить местоположение. Проверьте разрешения в браузере.');
                setIsLoading(false);
                setLocationType('manual');
            }
        );
    };

    const handleManualLocationClick = () => {
        setLocationType('manual');
        setDetectedLocation(null);
    };

    useEffect(() => {
        if (debouncedLocationInput.length > 2 && locationType === 'manual') {
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
            setSuggestionsVisible(false);
        }
    }, [debouncedLocationInput, locationType]);

    const buttonClass = (groupState, value) => {
        return `${styles.button} ${groupState === value ? styles.active : ''}`;
    };

    const handleSuggestionClick = (suggestion) => {
        setLocationInput(suggestion.value);
        setSuggestionsVisible(false);
    };

    return (
        <section className={styles.quickAdSection}>
            <h2 className={styles.sectionTitle}>Быстрое объявление</h2>
            <div className={styles.formWrapper}>
                <div className={styles.iconHeader}>
                    <SearchPawIcon />
                </div>
                <div className={styles.formContainer}>
                    <div className={styles.buttonGroup}>
                        <button className={buttonClass(adType, 'lost')} onClick={() => setAdType('lost')}>
                             <span>Мой питомец потерялся</span>
                        </button>
                        <button className={buttonClass(adType, 'found')} onClick={() => setAdType('found')}>
                             <span>Я нашел питомца</span>
                        </button>
                    </div>
                    <div className={styles.petTypeGroup}>
                        <div className={styles.buttonGroup}>
                            <button className={buttonClass(petType, 'dog')} onClick={() => setPetType('dog')}>
                                <DogIcon /> <span>Собака</span>
                            </button>
                            <button className={buttonClass(petType, 'cat')} onClick={() => setPetType('cat')}>
                                <CatIcon /> <span>Кошка</span>
                            </button>
                            <button className={buttonClass(petType, 'bird')} onClick={() => setPetType('bird')}>
                                <BirdIcon /> <span>Птица</span>
                            </button>
                            <button className={buttonClass(petType, 'other')} onClick={() => setPetType('other')}>
                                <SquirrelIcon /> <span>Другое</span>
                            </button>
                        </div>
                        {petType === 'other' && (
                            <div className={styles.inputWrapper}>
                                <HouseIcon />
                                <input
                                    type="text"
                                    placeholder="Введите название животного"
                                    value={otherPetInput}
                                    onChange={(e) => setOtherPetInput(e.target.value)}
                                />
                                {otherPetInput && (
                                    <button className={styles.clearButton} onClick={() => setOtherPetInput('')}>
                                        <VscClose />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={buttonClass(gender, 'male')} onClick={() => setGender('male')}>
                            <MaleIcon /> <span>Мальчик</span>
                        </button>
                        <button className={buttonClass(gender, 'female')} onClick={() => setGender('female')}>
                            <FemaleIcon /> <span>Девочка</span>
                        </button>
                        <button className={buttonClass(gender, 'unknown')} onClick={() => setGender('unknown')}>
                            <UnknownIcon /> <span>Не знаю</span>
                        </button>
                    </div>
                    <div className={styles.buttonGroup}>
                        <div
                            className={`${styles.locationInputContainer} ${locationType === 'manual' ? styles.active : ''}`}
                        >
                            <div className={styles.inputWrapperLocation}>
                                <MapPinIcon />
                                <input
                                    type="text"
                                    placeholder="Введите местоположение"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    onFocus={() => {
                                        handleManualLocationClick();
                                        if (suggestions.length > 0) setSuggestionsVisible(true);
                                    }}
                                />
                                {locationInput && (
                                    <button className={styles.clearButton} onClick={() => setLocationInput('')}>
                                        <VscClose />
                                    </button>
                                )}
                            </div>
                            {isSuggestionsVisible && suggestions.length > 0 && (
                                <div className={styles.suggestionsList}>
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className={styles.suggestionItem}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion.value}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            className={buttonClass(locationType, 'auto')}
                            onClick={handleAutoDetectLocation}
                            disabled={isLoading}
                        >
                            <AutoDetectIcon />
                            <span>
                                {isLoading ? 'Определяем...' : (detectedLocation ? detectedLocation : 'Определить автоматически')}
                            </span>
                        </button>
                    </div>
                    {error && <p className={styles.errorText}>{error}</p>}
                    <button className={styles.ctaButton}>Перейти к деталям</button>
                </div>
            </div>
        </section>
    );
};

export default QuickAdForm;