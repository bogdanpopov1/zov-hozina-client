import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import AnnouncementCard from '../components/map/AnnouncementCard';
import styles from './MyAnnouncementsPage.module.css';

const MyAnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/user/announcements');
                setAnnouncements(response.data.data);
            } catch (err) {
                setError('Не удалось загрузить ваши объявления.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const handleCardClick = (announcement) => {
        navigate(`/announcements/${announcement.announcement_id}`);
    };

    if (loading) {
        return <div className={styles.statusContainer}><div className={styles.statusMessage}>Загрузка объявлений...</div></div>;
    }

    if (error) {
        return <div className={styles.statusContainer}><div className={styles.statusMessage}>{error}</div></div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <h1>Мои объявления</h1>
                {announcements.length > 0 ? (
                    <>
                        <div className={styles.announcementsList}>
                            {announcements.map(ad => (
                                <div key={ad.announcement_id} className={styles.announcementItem}>
                                    <AnnouncementCard
                                        announcement={ad}
                                        onClick={handleCardClick}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className={styles.actions}>
                             <Link to="/create-announcement" className={styles.createButton}>
                                Создать новое объявление
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <p>У вас пока нет активных объявлений.</p>
                        <Link to="/create-announcement" className={styles.createButton}>
                            Создать первое объявление
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAnnouncementsPage;