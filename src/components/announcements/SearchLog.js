import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import styles from './SearchLog.module.css';
import ImageUploader from '../form/ImageUploader';
import { Plus } from 'lucide-react';

const LogEntry = ({ log }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.logEntry}>
            <div className={styles.entryHeader}>
                <span className={styles.author}>{log.user?.name || 'Аноним'}</span>
                <span>{formatDate(log.created_at)}</span>
            </div>
            <p className={styles.comment}>{log.comment}</p>
            {log.photos && log.photos.length > 0 && (
                <div className={styles.photoGrid}>
                    {log.photos.map(photo => (
                        <img key={photo.photo_id} src={photo.url} alt="Фото из журнала поиска" />
                    ))}
                </div>
            )}
        </div>
    );
};

const AddLogEntryForm = ({ announcementId, onLogAdded, onCancel }) => {
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
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setComment('');
            setPhotos([]);
            onLogAdded();
            onCancel();
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
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Ваш комментарий..." rows="4" className={styles.textarea} />
            <ImageUploader newFiles={photos} onNewFilesChange={setPhotos} maxFiles={3} />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>Отмена</button>
                <button type="submit" disabled={submitting} className={styles.submitButton}>
                    {submitting ? 'Отправка...' : 'Опубликовать'}
                </button>
            </div>
        </form>
    );
};

const SearchLog = ({ announcementId, isOwner }) => {
    const { user, updateVolunteerStatus } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

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

    const handleVolunteerToggle = async (e) => {
        const newStatus = e.target.checked;
        setIsToggling(true);
        try {
            await updateVolunteerStatus(newStatus);
        } catch (error) {
            console.error("Failed to update volunteer status", error);
        } finally {
            setIsToggling(false);
        }
    };

    if (loading) {
        return <p>Загрузка журнала поиска...</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Журнал поиска</h3>
                {user?.is_volunteer && !isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className={styles.addEntryButton}>
                        <Plus size={20} /> Добавить запись
                    </button>
                )}
                {user && !user.is_volunteer && !isOwner && (
                    <div className={styles.volunteerToggleContainer}>
                        <span>Стать волонтером</span>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={user.is_volunteer}
                                onChange={handleVolunteerToggle}
                                disabled={isToggling}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                )}
            </div>
            {isFormVisible && (
                <AddLogEntryForm
                    announcementId={announcementId}
                    onLogAdded={fetchLogs}
                    onCancel={() => setIsFormVisible(false)}
                />
            )}
            <div className={styles.logsList}>
                {logs.length > 0 ? (
                    logs.map(log => <LogEntry key={log.log_id} log={log} />)
                ) : (
                    <p className={styles.noEntries}>В журнале поиска пока нет записей. Если вы волонтер, вы можете стать первым, кто добавит запись.</p>
                )}
            </div>
        </div>
    );
};

export default SearchLog;