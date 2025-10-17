import React, { createContext, useState, useContext } from 'react';

    const AnnouncementContext = createContext();

    export const useAnnouncement = () => useContext(AnnouncementContext);

    const initialState = {
        adType: 'lost', // 'lost' или 'found'
        pet_type: 'dog',
        gender: 'male',
        location_address: '',
        latitude: null,
        longitude: null,
    };

    export const AnnouncementProvider = ({ children }) => {
        const [quickFormData, setQuickFormData] = useState(initialState);

        const updateQuickForm = (data) => {
            setQuickFormData(prev => ({ ...prev, ...data }));
        };

        const resetQuickForm = () => {
            setQuickFormData(initialState);
        };

        const value = {
            quickFormData,
            updateQuickForm,
            resetQuickForm,
        };

        return (
            <AnnouncementContext.Provider value={value}>
                {children}
            </AnnouncementContext.Provider>
        );
    };
