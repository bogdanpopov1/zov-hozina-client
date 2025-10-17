import React, { useState, useEffect, useRef } from 'react';
import AnnouncementCard from '../components/map/AnnouncementCard';
import YandexMap from '../components/map/YandexMap';
import styles from './MapPage.module.css';
import useYandexMaps from '../hooks/useYandexMaps';

const MapPage = () => {
    const { api: ymapsApi, loading: ymapsLoading, error: ymapsError } = useYandexMaps();

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [mapState, setMapState] = useState({
        center: [55.796127, 49.106414], // Казань
        zoom: 12, // Сделаем чуть меньше зум по умолчанию
        controls: ['zoomControl', 'fullscreenControl']
    });
    const listRef = useRef(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/announcements`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json();

                // === ГЛАВНОЕ ИСПРАВЛЕНИЕ ===
                // Этот код универсален. Он проверит, есть ли у ответа структура пагинации (.data).
                // Если да - возьмет массив из нее. Если нет - возьмет сам ответ.
                const announcementsArray = responseData.data ? responseData.data : responseData;

                setAnnouncements(Array.isArray(announcementsArray) ? announcementsArray : []);

            } catch (err) {
                console.error("Failed to fetch announcements:", err);
                setError(err.message);
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


    const handleCardClick = (announcement) => {
        setSelectedId(announcement.announcement_id);
        if (announcement.latitude && announcement.longitude) {
            setMapState(prev => ({ ...prev, center: [parseFloat(announcement.latitude), parseFloat(announcement.longitude)], zoom: 15 }));
        }
    };

    const handlePlacemarkClick = (announcement) => {
        try {
            if (announcement && announcement.announcement_id) {
                setSelectedId(announcement.announcement_id);
            }
        } catch (error) {
            console.error('Error handling placemark click:', error);
        }
    };


    if (loading || ymapsLoading) {
        return <div className={styles.loadingContainer}><div className={styles.loading}>Загрузка данных и карты...</div></div>;
    }
    
    if (error || ymapsError) {
         return <div className={styles.errorContainer}><div className={styles.error}>Ошибка загрузки: {error || ymapsError.message}</div></div>;
    }

    return (
        <div className={styles.mapPage}>
            <div className={styles.leftPanel}>
                <div className={styles.panelHeader}>
                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${styles.active}`}>Объявления</button>
                        <button className={styles.tab}>Фильтры</button>
                    </div>
                    <div className={styles.headerInfo}>
                        <span className={styles.count}>Найдено {announcements.length} объявлений</span>
                    </div>
                </div>
                <div className={styles.announcementsList} ref={listRef}>
                    {announcements.length > 0 ? (
                        announcements.map((announcement) => (
                            <div key={announcement.announcement_id} data-id={announcement.announcement_id}>
                                <AnnouncementCard
                                    announcement={announcement}
                                    onClick={() => handleCardClick(announcement)}
                                    isSelected={selectedId === announcement.announcement_id}
                                />
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Активных объявлений не найдено</p>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.rightPanel}>
                {ymapsApi && (
                     <YandexMap
                        ymaps={ymapsApi}
                        announcements={announcements}
                        mapState={mapState}
                        selectedId={selectedId}
                        onPlacemarkClick={handlePlacemarkClick}
                    />
                )}
            </div>
        </div>
    );
};

export default MapPage;