import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import styles from './AnnouncementDetailPage.module.css';
import placeholderImage from '../assets/stories/cat-illustration.svg';
import { MapPin, Clock, User, Palette } from 'lucide-react';

const AnnouncementDetailPage = () => {
    const { id } = useParams(); // Получаем ID из URL
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePhoto, setActivePhoto] = useState(0);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/announcements/${id}`);
                setAnnouncement(response.data);
            } catch (err) {
                setError('Не удалось загрузить объявление. Возможно, оно было удалено.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncement();
    }, [id]);

    if (loading) {
        return <div className={styles.status}>Загрузка объявления...</div>;
    }

    if (error) {
        return <div className={`${styles.status} ${styles.error}`}>{error}</div>;
    }

    if (!announcement) {
        return null;
    }

    const primaryPhoto = announcement.photos?.find(p => p.is_primary) || announcement.photos?.[0];
    const otherPhotos = announcement.photos?.filter(p => p.photo_id !== primaryPhoto?.photo_id) || [];

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.gallery}>
                    <div className={styles.mainPhoto}>
                        <img src={announcement.photos?.[activePhoto]?.url || placeholderImage} alt={announcement.pet_name} />
                    </div>
                    {announcement.photos && announcement.photos.length > 1 && (
                        <div className={styles.thumbnailGrid}>
                            {announcement.photos.map((photo, index) => (
                                <div 
                                    key={photo.photo_id} 
                                    className={`${styles.thumbnail} ${index === activePhoto ? styles.active : ''}`}
                                    onClick={() => setActivePhoto(index)}
                                >
                                    <img src={photo.url} alt={`thumbnail ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.details}>
                    <span className={styles.tag}>{announcement.announcement_type === 'lost' ? 'Пропал питомец' : 'Найден питомец'}</span>
                    <h1>{announcement.pet_type}, кличка "{announcement.pet_name}"</h1>
                    <p className={styles.description}>{announcement.description || 'Подробное описание отсутствует.'}</p>
                    
                    <div className={styles.metaGrid}>
                        <div className={styles.metaItem}><MapPin size={20} /> <span>{announcement.location_address}</span></div>
                        <div className={styles.metaItem}><Clock size={20} /> <span>Опубликовано: {new Date(announcement.created_at).toLocaleDateString()}</span></div>
                        <div className={styles.metaItem}><Palette size={20} /> <span>Окрас: {announcement.color}</span></div>
                        <div className={styles.metaItem}><User size={20} /> <span>Владелец: {announcement.user?.name || 'Неизвестно'}</span></div>
                    </div>

                    <button className={styles.contactButton}>Связаться с владельцем</button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetailPage;