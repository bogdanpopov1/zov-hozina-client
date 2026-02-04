import React, { useState, useEffect } from 'react';
import styles from './FilterPanel.module.css';
import useDebounce from '../../hooks/useDebounce';
import api from '../../api/axiosConfig';

const FilterPanel = ({ initialFilters, onApply, onReset }) => {
    const [filters, setFilters] = useState(initialFilters);
    const [categories, setCategories] = useState([]);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const debouncedLocationInput = useDebounce(filters.location, 400);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories for filter", error);
            }
        };
        fetchCategories();
    }, []);

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
                .then(result => setAddressSuggestions(result.suggestions || []))
                .catch(error => console.log("Ошибка DaData:", error));
        } else {
            setAddressSuggestions([]);
        }
    }, [debouncedLocationInput]);

    const handleAddressSuggestionClick = (suggestion) => {
        setFilters(prev => ({ ...prev, location: suggestion.value, latitude: suggestion.data.geo_lat, longitude: suggestion.data.geo_lon }));
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
        setFilters(prev => ({ ...prev, [name]: prev[name] === value ? '' : value }));
    };

    const handleReset = () => {
        onReset();
        setFilters(initialFilters);
    };

    const handleApply = () => {
        onApply(filters);
    };

    return (
        <div className={styles.filterPanel}>
            <div className={styles.formGroup}>
                <label>Населенный пункт</label>
                <div className={styles.inputWrapper}>
                    <input type="text" name="location" value={filters.location} onChange={handleChange} onFocus={() => setSuggestionsVisible(true)} onBlur={() => setTimeout(() => setSuggestionsVisible(false), 200)} autoComplete="off" />
                    {filters.location && <button onClick={() => setFilters(f => ({ ...f, location: '', latitude: null, longitude: null }))} className={styles.clearButton}>×</button>}
                </div>
                {isSuggestionsVisible && addressSuggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                        {addressSuggestions.map((suggestion, index) => (
                            <li key={index} onMouseDown={() => handleAddressSuggestionClick(suggestion)}>{suggestion.value}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div className={styles.formGroup}>
                <label>Вид животного</label>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={() => handleButtonGroupChange('pet_type_slug', '')}
                        className={filters.pet_type_slug === '' ? styles.active : ''}
                    >
                        Все
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.category_id}
                            onClick={() => handleButtonGroupChange('pet_type_slug', cat.slug)}
                            className={filters.pet_type_slug === cat.slug ? styles.active : ''}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>Тип объявления</label>
                <div className={styles.buttonGroup}>
                    <button onClick={() => handleButtonGroupChange('announcement_type', '')} className={filters.announcement_type === '' ? styles.active : ''}>Любое</button>
                    <button onClick={() => handleButtonGroupChange('announcement_type', 'lost')} className={filters.announcement_type === 'lost' ? styles.active : ''}>Пропажа</button>
                    <button onClick={() => handleButtonGroupChange('announcement_type', 'found')} className={filters.announcement_type === 'found' ? styles.active : ''}>Обнаружение</button>
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>Время публикации</label>
                <div className={styles.buttonGroup}>
                    <button onClick={() => handleButtonGroupChange('time_period', '')} className={filters.time_period === '' ? styles.active : ''}>Все</button>
                    <button onClick={() => handleButtonGroupChange('time_period', 'today')} className={filters.time_period === 'today' ? styles.active : ''}>Сегодня</button>
                    <button onClick={() => handleButtonGroupChange('time_period', 'week')} className={filters.time_period === 'week' ? styles.active : ''}>Неделя</button>
                    <button onClick={() => handleButtonGroupChange('time_period', 'month')} className={filters.time_period === 'month' ? styles.active : ''}>Месяц</button>
                </div>
            </div>
            <div className={styles.formGroup}>
                <label>Период</label>
                <div className={styles.dateRange}>
                    с <input type="date" name="date_from" value={filters.date_from} onChange={handleChange} />
                    по <input type="date" name="date_to" value={filters.date_to} onChange={handleChange} />
                </div>
            </div>
            <div className={styles.toggleWrapper}>
                <span>Только актуальные объявления</span>
                <label className={styles.switch}>
                    <input type="checkbox" name="actual" checked={filters.actual} onChange={handleChange} />
                    <span className={styles.slider}></span>
                </label>
            </div>
            <div className={styles.actions}>
                <button onClick={handleReset} className={styles.resetButton}>Сбросить фильтры</button>
                <button onClick={handleApply} className={styles.applyButton}>Применить</button>
            </div>
        </div>
    );
};

export default FilterPanel;