import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/MapPage.module.css';

const YandexMap = ({ announcements, mapState, selectedId, onPlacemarkClick }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [ymapsApi, setYmapsApi] = useState(null);
    const navigate = useNavigate();

    // Эффект №1: Ожидание API
    useEffect(() => {
        const checkApi = () => {
            if (window.ymaps) {
                window.ymaps.ready(() => setYmapsApi(window.ymaps));
            } else {
                setTimeout(checkApi, 100);
            }
        };
        checkApi();
    }, []);

    // Эффект №2: Создание карты и контролов
    useEffect(() => {
        if (!ymapsApi || !mapContainerRef.current) {
            return;
        }

        if (!mapInstanceRef.current) {
            const map = new ymapsApi.Map(mapContainerRef.current, {
                center: mapState.center.slice().reverse(),
                zoom: mapState.zoom,
                controls: ['zoomControl'],
                // Начинаем со стандартного типа карты, CSS сделает ее темной
                type: 'yandex#map'
            });

            // --- КЛЮЧЕВАЯ ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
            const typeSelector = new ymapsApi.control.Button({
                data: { content: 'Спутник' },
                options: { selectOnClick: false, maxWidth: 150 }
            });

            typeSelector.events.add('click', () => {
                const mapContainer = mapContainerRef.current;
                if (map.getType() === 'yandex#map') {
                    map.setType('yandex#hybrid');
                    typeSelector.data.set('content', 'Схема');
                    // Убираем CSS-класс, чтобы спутник выглядел нормально
                    mapContainer.classList.remove('dark-mode');
                } else {
                    map.setType('yandex#map');
                    typeSelector.data.set('content', 'Спутник');
                    // Добавляем CSS-класс, чтобы применить темную тему
                    mapContainer.classList.add('dark-mode');
                }
            });
            map.controls.add(typeSelector, { float: 'right' });

            mapInstanceRef.current = map;

            // Сразу после создания применяем темную тему
            mapContainerRef.current.classList.add('dark-mode');
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    }, [ymapsApi]);

    // Эффект №3: Обновление центра карты
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(mapState.center.slice().reverse(), mapState.zoom);
        }
    }, [mapState]);

    // Эффект №4: Обновление маркеров
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.geoObjects.removeAll();
        map.balloon.close();

        announcements.forEach(ad => {
            if (ad.latitude && ad.longitude) {
                const isSelected = selectedId === ad.announcement_id;
                
                const placemark = new ymapsApi.Placemark(
                    [ad.latitude, ad.longitude],
                    {},
                    { preset: isSelected ? 'islands#yellowCircleIcon' : 'islands#blueCircleIcon' }
                );

                placemark.events.add('click', () => onPlacemarkClick(ad));
                
                if (isSelected) {
                    map.balloon.open(placemark.geometry.getCoordinates(), {
                        contentHeader: `${ad.pet_breed}, "${ad.pet_name}"`,
                        contentBody: `<p>${ad.description || ''}</p>`,
                        contentFooter: `<a href="/announcements/${ad.announcement_id}" id="balloon-link-${ad.announcement_id}" style="color: #1a73e8;">Подробнее...</a>`
                    });
                }
                
                map.geoObjects.add(placemark);
            }
        });
        
        const balloonOpenHandler = () => {
            const link = document.getElementById(`balloon-link-${selectedId}`);
            if (link) {
                link.onclick = (e) => {
                    e.preventDefault();
                    navigate(`/announcements/${selectedId}`);
                };
            }
        }

        map.events.add('balloonopen', balloonOpenHandler);

        return () => {
             map.events.remove('balloonopen', balloonOpenHandler);
        }

    }, [announcements, selectedId, onPlacemarkClick, navigate, ymapsApi]);

    if (!ymapsApi) {
        return <div className={styles.loadingContainer}><div className={styles.loading}>Загрузка API Яндекс.Карт...</div></div>;
    }

    // Убираем класс из JSX, будем управлять им через JS
    return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default YandexMap;