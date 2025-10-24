import React, { useState, useEffect, useRef, useCallback } from 'react';
import AnnouncementCard from '../components/map/AnnouncementCard';
import YandexMap from '../components/map/YandexMap';
import styles from './MapPage.module.css'; // Правильный путь

const MapPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [mapState, setMapState] = useState({
        center: [49.106414, 55.796127], 
        zoom: 12,
    });
    const listRef = useRef(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                if (!apiUrl) throw new Error("REACT_APP_API_URL не определен.");
                
                const response = await fetch(`${apiUrl}/api/announcements`);
                if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
                
                const responseData = await response.json();
                const announcementsArray = responseData.data || responseData;
                setAnnouncements(Array.isArray(announcementsArray) ? announcementsArray : []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (!selectedId || !listRef.current) return;
        const selectedCard = listRef.current.querySelector(`[data-id="${selectedId}"]`);
        if (selectedCard) {
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedId]);

    const handleSelection = useCallback((announcement) => {
        setSelectedId(announcement.announcement_id);
        if (announcement.latitude && announcement.longitude) {
            setMapState(prev => ({
                ...prev,
                center: [parseFloat(announcement.longitude), parseFloat(announcement.latitude)],
                zoom: 15 
            }));
        }
    }, []);

    if (loading) {
        return <div className={styles.loadingContainer}><div className={styles.loading}>Загрузка объявлений...</div></div>;
    }
    if (error) {
        return <div className={styles.errorContainer}><div className={styles.error}>Ошибка загрузки: {error.message}</div></div>;
    }

    return (
        <div className={styles.mapPage}>
            <div className={styles.leftPanel}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.count}>Найдено {announcements.length} объявлений</h3>
                </div>
                <div className={styles.announcementsList} ref={listRef}>
                    {announcements.map((announcement) => (
                        <div key={announcement.announcement_id} data-id={announcement.announcement_id}>
                            <AnnouncementCard
                                announcement={announcement}
                                onClick={handleSelection}
                                isSelected={selectedId === announcement.announcement_id}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.rightPanel}>
                <YandexMap
                    announcements={announcements}
                    mapState={mapState}
                    selectedId={selectedId}
                    onPlacemarkClick={handleSelection}
                />
            </div>
        </div>
    );
};

export default MapPage;