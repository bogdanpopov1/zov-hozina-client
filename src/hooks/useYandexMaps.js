import { useState, useEffect } from 'react';

const YANDEX_MAPS_API_KEY = process.env.REACT_APP_YANDEX_MAPS_API_KEY;
const YMAPS_API_URL = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU`;

// Хук для управления загрузкой и состоянием API Яндекс.Карт
const useYandexMaps = () => {
    const [api, setApi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Проверяем, был ли API уже загружен
        if (window.ymaps) {
            window.ymaps.ready(() => {
                setApi(window.ymaps);
                setLoading(false);
            });
            return;
        }

        // Если нет, создаем и добавляем скрипт
        const script = document.createElement('script');
        script.src = YMAPS_API_URL;
        script.async = true;
        script.id = 'yandex-maps-api-script';

        script.onload = () => {
            window.ymaps.ready(() => {
                setApi(window.ymaps);
                setLoading(false);
            });
        };

        script.onerror = (err) => {
            setError(err);
            setLoading(false);
            console.error("Failed to load Yandex Maps API", err);
        };

        document.head.appendChild(script);

        // Очистка при размонтировании компонента
        return () => {
            const existingScript = document.getElementById('yandex-maps-api-script');
            if (existingScript) {
               // Не удаляем скрипт, чтобы избежать повторной загрузки при навигации
            }
        };
    }, []);

    return { api, loading, error };
};

export default useYandexMaps;