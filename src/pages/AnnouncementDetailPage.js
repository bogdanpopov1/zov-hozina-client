import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useAnnouncement } from '../context/AnnouncementContext';
import styles from './AnnouncementDetailPage.module.css';
import { MapPin, Clock, User, Palette } from 'lucide-react';
import SearchLog from '../components/announcements/SearchLog';
import AuthModal from '../components/common/AuthModal';
import ContactOwnerModal from '../components/announcements/ContactOwnerModal';
import defaultIcon from '../assets/icons/default.svg';

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
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isContactModalOpen, setContactModalOpen] = useState(false);

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

    const handleContactClick = () => {
        if (user) {
            setContactModalOpen(true);
        } else {
            setAuthModalOpen(true);
        }
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
    const primaryPhoto = announcement.photos && announcement.photos.length > 0 ? announcement.photos[activePhoto] || announcement.photos[0] : null;
    const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const getTagInfo = () => {
        if (announcement.status === 'archived') {
            return { text: 'Питомец найден', className: styles.foundTag };
        }
        if (announcement.announcement_type === 'lost') {
            return { text: 'Пропал питомец', className: styles.lostTag };
        }
        return { text: 'Найден питомец', className: styles.defaultTag };
    };

    const tagInfo = getTagInfo();

    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.contentWrapper}>
                    <div className={styles.mainInfo}>
                        <div className={styles.gallery}>
                            <div className={styles.mainPhoto}>
                                <img
                                    src={primaryPhoto ? primaryPhoto.url : defaultIcon}
                                    alt="Фото питомца"
                                    className={!primaryPhoto ? styles.defaultPetImage : ''}
                                />
                            </div>
                            {announcement.photos && announcement.photos.length > 1 && (
                                <div className={styles.thumbnailGrid}>
                                    {announcement.photos.map((photo, index) => (
                                        <div key={photo.photo_id} className={`${styles.thumbnail} ${activePhoto === index ? styles.active : ''}`} onClick={() => setActivePhoto(index)}>
                                            <img src={photo.url} alt={`Фото питомца ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.details}>
                            <span className={`${styles.tag} ${tagInfo.className}`}>{tagInfo.text}</span>
                            <h1>{capitalize(announcement.pet_type)}, кличка "{announcement.pet_name}"</h1>
                            <p className={styles.description}>{announcement.description || 'Подробное описание отсутствует.'}</p>
                            <div className={styles.metaGrid}>
                                <div className={styles.metaItem}><MapPin size={20} /><span>{announcement.location_address}</span></div>
                                <div className={styles.metaItem}><Clock size={20} /><span>Опубликовано: {formatDate(announcement.created_at)}</span></div>
                                <div className={styles.metaItem}><Palette size={20} /><span>Окрас: {announcement.color}</span></div>
                                <div className={styles.metaItem}><User size={20} /><span>Владелец: {announcement.user?.name || 'Неизвестно'}</span></div>
                            </div>
                            <div className={styles.actions}>
                                {isOwner ? (
                                    <div className={styles.ownerActions}>
                                        <button onClick={handleEdit} className={styles.editButton}>Редактировать</button>
                                        {announcement.status === 'active' ? (
                                            <button onClick={() => handleStatusChange('archived')} disabled={isSubmitting} className={styles.foundButton}>{isSubmitting ? 'Архивация...' : 'Нашелся, в архив'}</button>
                                        ) : (
                                            <button onClick={() => handleStatusChange('active')} disabled={isSubmitting} className={styles.foundButton}>{isSubmitting ? 'Активация...' : 'Сделать актуальным'}</button>
                                        )}
                                        <button onClick={handleDelete} className={styles.deleteButton}>Удалить объявление</button>
                                    </div>
                                ) : (
                                    <button onClick={handleContactClick} className={styles.contactButton}>Связаться с владельцем</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.logWrapper}>
                    <SearchLog announcementId={announcement.announcement_id} isOwner={isOwner} />
                </div>
            </div>
            {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
            {isContactModalOpen && (
                <ContactOwnerModal
                    isOpen={isContactModalOpen}
                    onClose={() => setContactModalOpen(false)}
                    owner={announcement.user}
                />
            )}
        </>
    );
};

export default AnnouncementDetailPage;