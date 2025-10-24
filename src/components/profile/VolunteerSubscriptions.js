import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import styles from './VolunteerSubscriptions.module.css';
import { X, PlusCircle } from 'lucide-react';
import ZoneMapModal from './ZoneMapModal'; // Мы создадим этот компонент на следующем шаге

const VolunteerSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSubscriptions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/subscriptions');
            setSubscriptions(response.data);
            setError('');
        } catch (err) {
            setError('Не удалось загрузить подписки.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleSaveSubscription = async (newSubscription) => {
        setError('');
        try {
            const response = await api.post('/api/subscriptions', newSubscription);
            setSubscriptions(prev => [response.data, ...prev]);
            setIsModalOpen(false); // Закрываем модальное окно после успеха
        } catch (err) {
            if (err.response && err.response.data && err.response.data.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                // Мы будем передавать эту ошибку в модальное окно
                return Promise.reject(new Error(firstError));
            } else {
                const genericError = 'Произошла ошибка при добавлении подписки.';
                setError(genericError);
                return Promise.reject(new Error(genericError));
            }
        }
    };

    const handleDeleteSubscription = async (subscriptionId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту зону?')) {
            try {
                await api.delete(`/api/subscriptions/${subscriptionId}`);
                setSubscriptions(prev => prev.filter(sub => sub.subscription_id !== subscriptionId));
            } catch (err) {
                setError('Не удалось удалить подписку.');
                console.error(err);
            }
        }
    };

    return (
        <div className={styles.container}>
            <h4>Мои зоны уведомлений</h4>
            <p className={styles.subtitle}>Вы будете получать уведомления о новых пропажах в этих районах.</p>
            
            <div className={styles.listContainer}>
                {loading && <p>Загрузка...</p>}
                {error && <p className={styles.error}>{error}</p>}
                
                {!loading && subscriptions.length === 0 && (
                    <p className={styles.emptyMessage}>У вас пока нет добавленных зон.</p>
                )}
                <ul className={styles.list}>
                    {subscriptions.map(sub => (
                        <li key={sub.subscription_id}>
                            <span>{sub.location_name} (Радиус: {sub.radius} км)</span>
                            <button onClick={() => handleDeleteSubscription(sub.subscription_id)} className={styles.deleteButton}>
                                <X size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
                 <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
                    <PlusCircle size={20} />
                    Добавить новую зону
                </button>
            </div>

            {isModalOpen && (
                <ZoneMapModal 
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSubscription}
                />
            )}
        </div>
    );
};

export default VolunteerSubscriptions;