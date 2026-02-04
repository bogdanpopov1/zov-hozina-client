import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import useDebounce from '../../hooks/useDebounce';
import styles from './BreedInput.module.css';

const BreedInput = ({ value, onChange, categoryId }) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const debouncedSearchTerm = useDebounce(inputValue, 300);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        if (!isSuggestionsVisible) {
            return;
        }

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
    }, [debouncedSearchTerm, categoryId, isSuggestionsVisible]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
        setSuggestionsVisible(true);
    };

    const handleSuggestionClick = (breedName) => {
        setInputValue(breedName);
        onChange(breedName);
        setSuggestions([]);
        setSuggestionsVisible(false);
    };

    return (
        <div className={styles.container}>
            <input
                type="text"
                id="pet_breed"
                name="pet_breed"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                    if (inputValue.length >= 2) setSuggestionsVisible(true);
                }}
                onBlur={() => setTimeout(() => setSuggestionsVisible(false), 200)}
                placeholder="Начните вводить породу..."
                autoComplete="off"
            />
            {isSuggestionsVisible && suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                    {suggestions.map(breed => (
                        <li key={breed.breed_id} onMouseDown={() => handleSuggestionClick(breed.name)}>
                            {breed.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BreedInput;