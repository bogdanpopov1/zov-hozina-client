import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import styles from './SearchLog.module.css';
import ImageUploader from '../form/ImageUploader'; // Мы переиспользуем наш ImageUploader

const LogEntry = ({ log }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.logEntry}>
            <div className={styles.entryHeader}>
                <span className={styles.author}>{log.user?.name || 'Аноним'}</span>
                <span className={styles.date}>{formatDate(log.created_at)}</span>
            </div>
            <p className={styles.comment}>{log.comment}</p>
            {log.photos && log.photos.length > 0 && (
                <div className={styles.photoGrid}>
                    {log.photos.map(photo => (
                        <a key={photo.photo_id} href={photo.url} target="_blank" rel="noopener noreferrer">
                            <img src={photo.url} alt="Фото из журнала поиска" />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};


const AddLogEntryForm = ({ announcementId, onLogAdded }) => {
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError('Комментарий не может быть пустым.');
            return;
        }
        setError('');
        setSubmitting(true);

        const formData = new FormData();
        formData.append('comment', comment);
        photos.forEach(photo => {
            formData.append('photos[]', photo);
        });

        try {
            await api.post(`/api/announcements/${announcementId}/logs`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setComment('');
            setPhotos([]);
            onLogAdded(); // Вызываем колбэк для обновления списка
        } catch (err) {
            setError('Не удалось добавить запись. Попробуйте снова.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h4>Добавить запись в журнал</h4>
            <p>Опишите, где и при каких обстоятельствах вы видели животное. Прикрепите фото, если удалось его сделать.</p>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ваш комментарий..."
                rows="4"
                className={styles.textarea}
            />
            <ImageUploader
                newFiles={photos}
                onNewFilesChange={setPhotos}
                maxFiles={3}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={submitting} className={styles.submitButton}>
                {submitting ? 'Отправка...' : 'Опубликовать'}
            </button>
        </form>
    );
};


const SearchLog = ({ announcementId }) => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            const response = await api.get(`/api/announcements/${announcementId}/logs`);
            setLogs(response.data);
        } catch (error) {
            console.error("Failed to fetch search logs", error);
        } finally {
            setLoading(false);
        }
    }, [announcementId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    if (loading) {
        return <p>Загрузка журнала поиска...</p>;
    }

    return (
        <div className={styles.container}>
            <h3>Журнал поиска</h3>
            {user?.is_volunteer && (
                <AddLogEntryForm announcementId={announcementId} onLogAdded={fetchLogs} />
            )}
            <div className={styles.logsList}>
                {logs.length > 0 ? (
                    logs.map(log => <LogEntry key={log.log_id} log={log} />)
                ) : (
                    <p>В журнале поиска пока нет записей. Если вы волонтер, вы можете стать первым, кто добавит запись.</p>
                )}
            </div>
        </div>
    );
};

export default SearchLog;