import React, { useState, useEffect } from 'react';
import styles from './SuccessStories.module.css';
import illustration from '../../assets/stories/cat-illustration.svg';
import { Star, Flame } from 'lucide-react';

const StarRating = () => { // Убираем props, рейтинг больше не нужен
    return (
        <div className={styles.starRating}>
            {[...Array(5)].map((_, index) => (
                <Star
                    key={index}
                    size={18}
                    className={styles.star} /* Используем один класс для всех звезд */
                    fill="currentColor" /* Заливаем иконку цветом */
                />
            ))}
        </div>
    );
};

const StoryCard = ({ story }) => {
    const avatarUrl = process.env.REACT_APP_API_URL + story.user_avatar_url;
    const petPhotoUrl = process.env.REACT_APP_API_URL + story.pet_photo_url;

    return (
        <div className={styles.storyCard}>
            <div className={styles.cardHeader}>
                <img src={avatarUrl} alt={story.user_name} className={styles.avatar} />
                <div className={styles.userInfo}>
                    <h4>{story.user_name}</h4>
                    <StarRating /> {/* Вызываем без props */}
                </div>
            </div>
            <p className={styles.storyText}>{story.story_text}</p>
            <div className={styles.petImageContainer}>
                <img src={petPhotoUrl} alt="Найденный питомец" />
            </div>
            <div className={styles.cardFooter}>
                <div className={styles.foundInfo}>
                    <Flame size={16} />
                    <span>{story.found_time_text}</span>
                </div>
                <span className={styles.date}>{story.found_date}</span>
            </div>
        </div>
    );
};

const SuccessStories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stories/happy`);
                if (!response.ok) throw new Error('Не удалось загрузить истории');
                const data = await response.json();
                setStories(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    return (
        <section className={styles.successStoriesSection}>
            <div className={styles.titleContainer}>
                <img src={illustration} alt="Cat" className={styles.illustration} />
                <h2 className={styles.mainTitle}>Счастливые истории</h2>
                <a href="/stories" className={styles.subtitle}>
                    Больше радостных моментов &gt;
                </a>
            </div>
            {loading && <p className={styles.stateMessage}>Загрузка историй...</p>}
            {error && <p className={styles.stateMessage}>Ошибка: {error}</p>}
            {!loading && !error && (
                <div className={styles.storiesGrid}>
                    {stories.map(story => (
                        <StoryCard key={story.id} story={story} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default SuccessStories;