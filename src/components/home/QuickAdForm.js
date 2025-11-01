import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncement } from '../../context/AnnouncementContext';
import styles from './QuickAdForm.module.css';
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
import { VscClose } from 'react-icons/vsc';
import useDebounce from '../../hooks/useDebounce';

const QuickAdForm = () => {
    const navigate = useNavigate();
    const { updateQuickForm } = useAnnouncement();
    const [adType, setAdType] = useState('lost');
    const [petType, setPetType] = useState('dog');
    const [gender, setGender] = useState('male');
    const [locationInput, setLocationInput] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
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
        setSelectedSuggestion(suggestion.data);
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
        <div className={styles.quickAdSection}>
            <h2 className={styles.sectionTitle}>Быстрое объявление</h2>
            <div className={styles.formWrapper}>
                <div className={styles.iconHeader}><SearchPawIcon /></div>
                <div className={styles.formContainer}>
                    <div className={styles.buttonGroup}>
                        <button onClick={() => setAdType('lost')} className={buttonClass(adType, 'lost')}>Мой питомец потерялся</button>
                        <button onClick={() => setAdType('found')} className={buttonClass(adType, 'found')}>Я нашел питомца</button>
                    </div>

                    <div className={styles.petTypeGroup}>
                         <div className={styles.buttonGroup}>
                            <button onClick={() => setPetType('dog')} className={buttonClass(petType, 'dog')}><DogIcon /> Собака</button>
                            <button onClick={() => setPetType('cat')} className={buttonClass(petType, 'cat')}><CatIcon /> Кошка</button>
                            <button onClick={() => setPetType('bird')} className={buttonClass(petType, 'bird')}><BirdIcon /> Птица</button>
                            <button onClick={() => setPetType('other')} className={buttonClass(petType, 'other')}><SquirrelIcon /> Другое</button>
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
                                {otherPetInput && <button onClick={() => setOtherPetInput('')} className={styles.clearButton}><VscClose /></button>}
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.buttonGroup}>
                        <button onClick={() => setGender('male')} className={buttonClass(gender, 'male')}><MaleIcon /> Мальчик</button>
                        <button onClick={() => setGender('female')} className={buttonClass(gender, 'female')}><FemaleIcon /> Девочка</button>
                        <button onClick={() => setGender('unknown')} className={buttonClass(gender, 'unknown')}><UnknownIcon /> Не знаю</button>
                    </div>

                    <div className={styles.locationRow}>
                        <div className={styles.locationInputContainer}>
                            <MapPinIcon />
                            <input
                                type="text"
                                placeholder="Уточнить местоположение"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                onFocus={() => { if (suggestions.length > 0) setSuggestionsVisible(true); }}
                                onBlur={() => setTimeout(() => setSuggestionsVisible(false), 200)}
                            />
                            {locationInput && <button onClick={() => setLocationInput('')} className={styles.clearButton}><VscClose /></button>}
                        </div>
                        {isSuggestionsVisible && suggestions.length > 0 && (
                            <ul className={styles.suggestionsList}>
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} onMouseDown={() => handleSuggestionClick(suggestion)}>
                                        {suggestion.value}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button onClick={handleGoToDetails} className={styles.ctaButton}>Перейти к деталям</button>
                </div>
            </div>
        </div>
    );
};

export default QuickAdForm;