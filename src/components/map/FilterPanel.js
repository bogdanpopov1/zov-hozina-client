import React, { useState, useEffect } from 'react';
import styles from './FilterPanel.module.css';
import useDebounce from '../../hooks/useDebounce';

const hardcodedCategories = [
    { name: 'Собаки', slug: 'dogs' },
    { name: 'Кошки', slug: 'cats' },
    { name: 'Птицы', slug: 'birds' },
];

const FilterPanel = ({ initialFilters, onApply, onReset }) => {
    const [filters, setFilters] = useState(initialFilters);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const debouncedLocationInput = useDebounce(filters.location, 400);

    useEffect(() => {
        if (debouncedLocationInput.length > 2) {
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
            fetch(url, options)
                .then(response => response.json())
                .then(result => setAddressSuggestions(result.suggestions || []))
                .catch(error => console.log("Ошибка DaData:", error));
        } else {
            setAddressSuggestions([]);
        }
    }, [debouncedLocationInput]);

    const handleAddressSuggestionClick = (suggestion) => {
        setFilters(prev => ({
            ...prev,
            location: suggestion.value,
            latitude: suggestion.data.geo_lat,
            longitude: suggestion.data.geo_lon
        }));
        setSuggestionsVisible(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => {
            const newState = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'location') {
                newState.latitude = null;
                newState.longitude = null;
            }
            return newState;
        });
    };

    const handleButtonGroupChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: prev[name] === value ? '' : value
        }));
    };
    
    const handleReset = () => {
        onReset();
        setFilters(initialFilters);
    };
    
    const handleApply = () => {
        onApply(filters);
    };

    const getSingularPetType = (plural) => {
        return plural;
    };

    return (
        <div className={styles.filterPanel}>
            <div className={styles.formGroup}>
                <label>Населенный пункт</label>
                <div className={styles.locationGroup}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            name="location"
                            placeholder="Казань"
                            value={filters.location}
                            onChange={handleChange}
                            onFocus={() => setSuggestionsVisible(true)}
                            onBlur={() => setTimeout(() => setSuggestionsVisible(false), 200)}
                            autoComplete="off"
                        />
                        {filters.location && <button onClick={() => setFilters(f => ({ ...f, location: '', latitude: null, longitude: null }))} className={styles.clearButton}>×</button>}
                    </div>
                    {isSuggestionsVisible && addressSuggestions.length > 0 && (
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

            <div className={styles.formGroup}>
                <label>Вид животного</label>
                <div className={styles.buttonGroup}>
                    <button
                        className={!filters.pet_type_slug ? styles.active : ''}
                        onClick={() => handleButtonGroupChange('pet_type_slug', '')}
                    >
                        Все
                    </button>
                    {hardcodedCategories.map(cat => (
                         <button
                            key={cat.slug}
                            className={filters.pet_type_slug === cat.slug ? styles.active : ''}
                            onClick={() => handleButtonGroupChange('pet_type_slug', cat.slug)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Тип объявления</label>
                <div className={styles.buttonGroup}>
                    <button className={!filters.announcement_type ? styles.active : ''} onClick={() => handleButtonGroupChange('announcement_type', '')}>Любое</button>
                    <button className={filters.announcement_type === 'lost' ? styles.active : ''} onClick={() => handleButtonGroupChange('announcement_type', 'lost')}>Пропажа</button>
                    <button className={filters.announcement_type === 'found' ? styles.active : ''} onClick={() => handleButtonGroupChange('announcement_type', 'found')}>Обнаружение</button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Время публикации</label>
                <div className={styles.buttonGroup}>
                    <button className={!filters.time_period ? styles.active : ''} onClick={() => handleButtonGroupChange('time_period', '')}>Все</button>
                    <button className={filters.time_period === 'today' ? styles.active : ''} onClick={() => handleButtonGroupChange('time_period', 'today')}>Сегодня</button>
                    <button className={filters.time_period === 'week' ? styles.active : ''} onClick={() => handleButtonGroupChange('time_period', 'week')}>Неделя</button>
                    <button className={filters.time_period === 'month' ? styles.active : ''} onClick={() => handleButtonGroupChange('time_period', 'month')}>Месяц</button>
                    <button className={filters.time_period === 'year' ? styles.active : ''} onClick={() => handleButtonGroupChange('time_period', 'year')}>Год</button>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Период</label>
                <div className={styles.dateRange}>
                    <span>с</span>
                    <input type="date" name="date_from" placeholder="дд.мм.гггг" value={filters.date_from} onChange={handleChange} />
                    <span>по</span>
                    <input type="date" name="date_to" placeholder="дд.мм.гггг" value={filters.date_to} onChange={handleChange} />
                </div>
            </div>
            
            <div className={styles.toggleWrapper}>
                <span>Только актуальные объявления</span>
                <label className={styles.switch}>
                    <input type="checkbox" name="actual" checked={filters.actual} onChange={handleChange}/>
                    <span className={styles.slider}></span>
                </label>
            </div>

            <div className={styles.actions}>
                <button className={styles.resetButton} onClick={handleReset}>Сбросить фильтры</button>
                <button className={styles.applyButton} onClick={handleApply}>Применить</button>
            </div>
        </div>
    );
};

export default FilterPanel;