import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import useDebounce from '../../hooks/useDebounce'; // Предполагаем, что хук лежит здесь
import styles from './BreedInput.module.css';

const BreedInput = ({ value, onChange, categoryId }) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const debouncedSearchTerm = useDebounce(inputValue, 300);

    useEffect(() => {
        setInputValue(value); // Синхронизация с состоянием родителя
    }, [value]);

    useEffect(() => {
        if (debouncedSearchTerm.length < 2 || !categoryId) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const response = await api.get(`/api/breeds/search`, {
                    params: { query: debouncedSearchTerm, category_id: categoryId }
                });
                setSuggestions(response.data);
            } catch (error) {
                console.error("Failed to fetch breeds", error);
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchTerm, categoryId]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
    };

    const handleSuggestionClick = (breedName) => {
        setInputValue(breedName);
        onChange(breedName);
        setSuggestions([]);
    };

    return (
        <div className={styles.container}>
            <input
                type="text"
                id="pet_breed"
                name="pet_breed"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Начните вводить породу..."
                autoComplete="off"
            />
            {suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                    {suggestions.map(breed => (
                        <li key={breed.breed_id} onClick={() => handleSuggestionClick(breed.name)}>
                            {breed.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BreedInput;