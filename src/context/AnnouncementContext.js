import React, { createContext, useState, useContext } from 'react';

const AnnouncementContext = createContext();

export const useAnnouncement = () => useContext(AnnouncementContext);

const initialQuickFormState = {
    adType: 'lost', // 'lost' или 'found'
    pet_type: 'dog',
    gender: 'male',
    location_address: '',
    latitude: null,
    longitude: null,
};

export const AnnouncementProvider = ({ children }) => {
    const [quickFormData, setQuickFormData] = useState(initialQuickFormState);
    const [announcementToEdit, setAnnouncementToEdit] = useState(null);

    const updateQuickForm = (data) => {
        setQuickFormData(prev => ({ ...prev, ...data }));
    };

    const resetQuickForm = () => {
        setQuickFormData(initialQuickFormState);
    };

    const clearAnnouncementToEdit = () => {
        setAnnouncementToEdit(null);
    };

    const value = {
        quickFormData,
        updateQuickForm,
        resetQuickForm,
        announcementToEdit,
        setAnnouncementToEdit,
        clearAnnouncementToEdit,
    };

    return (
        <AnnouncementContext.Provider value={value}>
            {children}
        </AnnouncementContext.Provider>
    );
};
