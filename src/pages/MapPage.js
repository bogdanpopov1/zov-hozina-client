import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import AnnouncementCard from '../components/map/AnnouncementCard';
import styles from './MapPage.module.css';

// Выносим ключ в константу для чистоты
const YANDEX_API_KEY = process.env.REACT_APP_YANDEX_MAPS_API_KEY;

const MapPage = () => {
    // ... весь остальной код компонента (хуки, хендлеры) остается без изменений ...
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [mapState, setMapState] = useState({
        center: [55.796127, 49.106414],
        zoom: 10,
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
                const data = await response.json();
                setAnnouncements(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const handleCardClick = (announcement) => {
        setSelectedId(announcement.announcement_id);
        if (announcement.latitude && announcement.longitude) {
            setMapState(prev => ({ ...prev, center: [parseFloat(announcement.latitude), parseFloat(announcement.longitude)], zoom: 15 }));
        }
    };

    const handlePlacemarkClick = (announcement) => {
        setSelectedId(announcement.announcement_id);
        const cardElement = document.getElementById(`announcement-${announcement.announcement_id}`);
        if (cardElement && listRef.current) {
            listRef.current.scrollTo({
                top: cardElement.offsetTop - listRef.current.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return <div className={styles.loadingContainer}><div className={styles.loading}>Загрузка объявлений...</div></div>;
    }

    return (
        <div className={styles.mapPage}>
            <div className={styles.leftPanel}>
                {/* ... левая панель без изменений ... */}
                <div className={styles.panelHeader}>
                    <div className={styles.headerInfo}>
                        <span className={styles.count}>Найдено {announcements.length} объявлений</span>
                        <select className={styles.sortSelect}>
                            <option value="newest">Сначала новые</option>
                            <option value="urgent">Сначала срочные</option>
                        </select>
                    </div>
                </div>
                <div className={styles.announcementsList} ref={listRef}>
                    {error && <div className={styles.errorContainer}><div className={styles.error}>Ошибка загрузки: {error}</div></div>}
                    {!error && announcements.length > 0 ? (
                        announcements.map((announcement) => (
                            <div 
                                id={`announcement-${announcement.announcement_id}`} 
                                key={announcement.announcement_id}
                                className={selectedId === announcement.announcement_id ? styles.selectedCard : ''}
                            >
                                <AnnouncementCard
                                    announcement={announcement}
                                    onClick={() => handleCardClick(announcement)}
                                />
                            </div>
                        ))
                    ) : (
                        !loading && <div className={styles.emptyState}><p>Активных объявлений не найдено</p></div>
                    )}
                </div>
            </div>
            <div className={styles.rightPanel}>
                {/* ДОБАВЛЕНА ПРОВЕРКА НАЛИЧИЯ КЛЮЧА */}
                {YANDEX_API_KEY ? (
                    <YMaps query={{ apikey: YANDEX_API_KEY }}>
                        <Map state={mapState} width="100%" height="100%">
                            {announcements.map((announcement) => {
                                if (!announcement.latitude || !announcement.longitude) return null;
                                const isSelected = selectedId === announcement.announcement_id;
                                return (
                                    <Placemark
                                        key={announcement.announcement_id}
                                        geometry={[parseFloat(announcement.latitude), parseFloat(announcement.longitude)]}
                                        properties={{
                                            balloonContentHeader: `${announcement.pet_breed}, ${announcement.pet_name}`,
                                            balloonContentBody: announcement.description,
                                        }}
                                        options={{
                                            preset: 'islands#circleIcon',
                                            iconColor: isSelected ? '#EBB000' : (announcement.is_featured ? '#ef4444' : '#3b82f6'),
                                            zIndex: isSelected ? 1000 : 1,
                                        }}
                                        onClick={() => handlePlacemarkClick(announcement)}
                                    />
                                );
                            })}
                        </Map>
                    </YMaps>
                ) : (
                    <div className={styles.errorContainer}>
                        <div className={styles.error}>Ключ API Яндекс.Карт не найден. Проверьте файл .env</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;