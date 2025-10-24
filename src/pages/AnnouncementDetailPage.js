import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useAnnouncement } from '../context/AnnouncementContext';
import styles from './AnnouncementDetailPage.module.css';
import { MapPin, Clock, User, Palette } from 'lucide-react';
import SearchLog from '../components/announcements/SearchLog'; // Импортируем наш новый компонент

const AnnouncementDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { setAnnouncementToEdit } = useAnnouncement();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activePhoto, setActivePhoto] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleStatusChange = async (newStatus) => {
        setIsSubmitting(true);
        try {
            const response = await api.patch(`/api/announcements/${id}/status`, { status: newStatus });
            setAnnouncement(response.data);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Ошибка при изменении статуса.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Вы уверены, что хотите безвозвратно удалить это объявление?')) {
            setIsSubmitting(true);
            try {
                await api.delete(`/api/announcements/${id}`);
                navigate('/my-ads');
            } catch (err) {
                console.error("Failed to delete announcement", err);
                alert("Ошибка при удалении объявления.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleEdit = () => {
        setAnnouncementToEdit(announcement);
        navigate('/create-announcement');
    };

    if (loading) {
        return <div className={styles.status}>Загрузка объявления...</div>;
    }

    if (error) {
        return <div className={`${styles.status} ${styles.error}`}>{error}</div>;
    }

    if (!announcement) {
        return null;
    }

    const isOwner = user && user.user_id === announcement.user_id;
    const primaryPhoto = announcement.photos?.[activePhoto] || announcement.photos?.[0];
    const getTagText = () => {
        if (announcement.status === 'archived') {
            return 'Питомец найден';
        }
        return announcement.announcement_type === 'lost' ? 'Пропал питомец' : 'Найден питомец';
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.gallery}>
                    <div className={styles.mainPhoto}>
                        {primaryPhoto ? <img src={primaryPhoto.url} alt="Фото питомца" /> : <img src="/images/mock/story-cat1.png" alt="Фото питомца" />}
                    </div>
                    {announcement.photos && announcement.photos.length > 1 && (
                        <div className={styles.thumbnailGrid}>
                            {announcement.photos.map((photo, index) => (
                                <div
                                    key={photo.photo_id}
                                    className={`${styles.thumbnail} ${activePhoto === index ? styles.active : ''}`}
                                    onClick={() => setActivePhoto(index)}
                                >
                                    <img src={photo.url} alt={`Фото питомца ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.details}>
                    <span className={styles.tag}>{getTagText()}</span>
                    <h1>{announcement.pet_type}, кличка "{announcement.pet_name}"</h1>
                    <p className={styles.description}>{announcement.description || 'Подробное описание отсутствует.'}</p>
                    <div className={styles.metaGrid}>
                        <div className={styles.metaItem}><MapPin size={20} /><span>{announcement.location_address}</span></div>
                        <div className={styles.metaItem}><Clock size={20} /><span>Опубликовано: {new Date(announcement.created_at).toLocaleDateString()}</span></div>
                        <div className={styles.metaItem}><Palette size={20} /><span>Окрас: {announcement.color}</span></div>
                        <div className={styles.metaItem}><User size={20} /><span>Владелец: {announcement.user?.name || 'Неизвестно'}</span></div>
                    </div>
                    <div className={styles.actions}>
                        {isOwner ? (
                            <div className={styles.ownerActions}>
                                <button onClick={handleEdit} className={styles.editButton}>Редактировать</button>
                                {announcement.status === 'active' ? (
                                    <button onClick={() => handleStatusChange('archived')} disabled={isSubmitting} className={styles.foundButton}>
                                        {isSubmitting ? 'Архивация...' : 'Нашелся, в архив'}
                                    </button>
                                ) : (
                                    <button onClick={() => handleStatusChange('active')} disabled={isSubmitting} className={styles.foundButton}>
                                        {isSubmitting ? 'Активация...' : 'Сделать актуальным'}
                                    </button>
                                )}
                                <button onClick={handleDelete} className={styles.deleteButton}>Удалить объявление</button>
                            </div>
                        ) : (
                            <button className={styles.contactButton}>Связаться с владельцем</button>
                        )}
                    </div>
                </div>

                <div className={styles.fullWidthSection}>
                    <SearchLog announcementId={announcement.announcement_id} />
                </div>

            </div>
        </div>
    );
};

export default AnnouncementDetailPage;