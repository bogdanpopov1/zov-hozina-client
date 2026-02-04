import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import styles from './SearchLog.module.css';
import ImageUploader from '../form/ImageUploader';
import { Plus, Pencil, Trash2, X, MoreVertical } from 'lucide-react';

const LogEntry = ({ log, onEdit, onDelete }) => {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const isAuthor = user && user.user_id === log.user_id;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.logEntry}>
            <div className={styles.entryHeader}>
                <span className={styles.author}>{log.user?.name || 'Аноним'}</span>
                <div className={styles.headerRight}>
                    <span className={styles.date}>{formatDate(log.created_at)}</span>
                    {isAuthor && (
                        <div className={styles.menuContainer} ref={menuRef}>
                            <button
                                className={styles.moreButton}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <MoreVertical size={20} />
                            </button>
                            {isMenuOpen && (
                                <div className={styles.dropdownMenu}>
                                    <button onClick={() => { onEdit(log); setIsMenuOpen(false); }}>
                                        <Pencil size={14} /> Изменить
                                    </button>
                                    <button
                                        className={styles.deleteOption}
                                        onClick={() => { onDelete(log.log_id); setIsMenuOpen(false); }}
                                    >
                                        <Trash2 size={14} /> Удалить
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className={styles.comment}>{log.comment}</p>

            {log.photos && log.photos.length > 0 && (
                <div className={styles.photoGrid}>
                    {log.photos.map(photo => (
                        <img
                            key={photo.photo_id}
                            src={photo.url}
                            alt="Фото из журнала поиска"
                            onClick={() => window.open(photo.url, '_blank')}
                            className={styles.clickableImage}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const LogEntryForm = ({ announcementId, logToEdit, onLogProcessed, onCancel }) => {
    const [comment, setComment] = useState(logToEdit ? logToEdit.comment : '');
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError('Комментарий не может быть пустым.');
            return;
        }
        setSubmitting(true);

        try {
            if (logToEdit) {
                await api.put(`/api/logs/${logToEdit.log_id}`, { comment });
            } else {
                const formData = new FormData();
                formData.append('comment', comment);
                photos.forEach(p => formData.append('photos[]', p));
                await api.post(`/api/announcements/${announcementId}/logs`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onLogProcessed();
            onCancel();
        } catch (err) {
            setError('Ошибка сохранения. Попробуйте снова.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formHeader}>
                <h4>{logToEdit ? 'Редактировать запись' : 'Добавить запись в журнал'}</h4>
                <button type="button" onClick={onCancel} className={styles.closeButton}>
                    <X size={20} />
                </button>
            </div>
            {!logToEdit && <p className={styles.formSubtitle}>Опишите, где и при каких обстоятельствах вы видели животное. Прикрепите фото, если удалось его сделать.</p>}

            <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ваш комментарий..."
                className={styles.textarea}
            />

            {!logToEdit && <ImageUploader newFiles={photos} onNewFilesChange={setPhotos} maxFiles={3} />}

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>Отмена</button>
                <button type="submit" disabled={submitting} className={styles.submitButton}>
                    {submitting ? 'Загрузка...' : (logToEdit ? 'Сохранить' : 'Опубликовать')}
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
    const [editingLog, setEditingLog] = useState(null);

    const fetchLogs = useCallback(async () => {
        try {
            const response = await api.get(`/api/announcements/${announcementId}/logs`);
            setLogs(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [announcementId]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleDelete = async (id) => {
        if (window.confirm('Удалить эту запись?')) {
            try {
                await api.delete(`/api/logs/${id}`);
                setLogs(prev => prev.filter(l => l.log_id !== id));
            } catch (error) { alert('Ошибка удаления'); }
        }
    };

    if (loading) return <p className={styles.noEntries}>Загрузка...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Журнал поиска</h3>
                {user?.is_volunteer && !isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className={styles.addEntryButton}>
                        <Plus size={20} /> Запись
                    </button>
                )}
                {user && !user.is_volunteer && !isOwner && (
                    <div className={styles.volunteerToggleContainer}>
                        <span>Стать волонтером</span>
                        <label className={styles.switch}>
                            <input type="checkbox" checked={user.is_volunteer} onChange={(e) => updateVolunteerStatus(e.target.checked)} />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                )}
            </div>

            {isFormVisible && (
                <LogEntryForm
                    announcementId={announcementId}
                    logToEdit={editingLog}
                    onLogProcessed={fetchLogs}
                    onCancel={() => { setIsFormVisible(false); setEditingLog(null); }}
                />
            )}

            <div className={styles.logsList}>
                {logs.length > 0 ? (
                    logs.map(log => (
                        <LogEntry
                            key={log.log_id}
                            log={log}
                            onEdit={(l) => { setEditingLog(l); setIsFormVisible(true); }}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <p className={styles.noEntries}>В журнале поиска пока нет записей. Если вы волонтер, вы можете стать первым, кто добавит запись.</p>
                )}
            </div>
        </div>
    );
};

export default SearchLog;