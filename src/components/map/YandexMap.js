import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/MapPage.module.css';

const YandexMap = ({ announcements, mapState, selectedId, onPlacemarkClick, onBalloonClose }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [ymapsApi, setYmapsApi] = useState(null);
    const navigate = useNavigate();

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

    useEffect(() => {
        if (!ymapsApi || !mapContainerRef.current) { return; }
        if (!mapInstanceRef.current) {
            const map = new ymapsApi.Map(mapContainerRef.current, {
                center: mapState.center.slice().reverse(),
                zoom: mapState.zoom,
                controls: ['zoomControl'],
                type: 'yandex#map'
            });

            const typeSelector = new ymapsApi.control.Button({
                data: { content: 'Спутник' },
                options: { selectOnClick: false, maxWidth: 150 }
            });
            typeSelector.events.add('click', () => {
                const mapContainer = mapContainerRef.current;
                if (map.getType() === 'yandex#map') {
                    map.setType('yandex#hybrid');
                    typeSelector.data.set('content', 'Схема');
                    mapContainer.classList.remove('dark-mode');
                } else {
                    map.setType('yandex#map');
                    typeSelector.data.set('content', 'Спутник');
                    mapContainer.classList.add('dark-mode');
                }
            });
            // ИЗМЕНЕНО: Используем position для корректного размещения в левом нижнем углу
            map.controls.add(typeSelector, { position: { top: '65px', left: '10px' } });
            mapInstanceRef.current = map;
            mapContainerRef.current.classList.add('dark-mode');
        }

        const map = mapInstanceRef.current;
        const handleBalloonClose = () => { if (onBalloonClose) { onBalloonClose(); } };
        map.events.add('balloonclose', handleBalloonClose);

        return () => {
            if (map) { map.events.remove('balloonclose', handleBalloonClose); }
            if (mapInstanceRef.current) { mapInstanceRef.current.destroy(); mapInstanceRef.current = null; }
        };
    }, [ymapsApi, onBalloonClose]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(mapState.center.slice().reverse(), mapState.zoom);
        }
    }, [mapState]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.geoObjects.removeAll();
        map.balloon.close();

        announcements.forEach(ad => {
            if (ad.latitude && ad.longitude) {
                const isSelected = selectedId === ad.announcement_id;
                const placemark = new ymapsApi.Placemark([ad.latitude, ad.longitude], {}, {
                    preset: isSelected ? 'islands#yellowIcon' : 'islands#blueIcon'
                });
                placemark.events.add('click', () => onPlacemarkClick(ad));
                if (isSelected) {
                    const prefix = ad.gender === 'female' ? 'Пропала' : 'Пропал';
                    map.balloon.open(placemark.geometry.getCoordinates(), {
                        contentHeader: `${prefix} ${ad.pet_breed}, "${ad.pet_name}"`,
                        contentBody: `<p>${ad.description || ''}</p><a href="/announcements/${selectedId}" id="balloon-link-${selectedId}">Подробнее...</a>`,
                        contentFooter: `Информация обновлена ${new Date(ad.updated_at).toLocaleDateString()}`
                    });
                }
                map.geoObjects.add(placemark);
            }
        });

        const balloonOpenHandler = (e) => {
            const link = document.getElementById(`balloon-link-${selectedId}`);
            if (link) {
                link.onclick = (e) => {
                    e.preventDefault();
                    navigate(`/announcements/${selectedId}`);
                };
            }
        };

        map.events.add('balloonopen', balloonOpenHandler);
        return () => {
            if(map) map.events.remove('balloonopen', balloonOpenHandler);
        };
    }, [announcements, selectedId, onPlacemarkClick, navigate, ymapsApi]);

    if (!ymapsApi) { return <div>Загрузка API Яндекс.Карт...</div>; }
    return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default YandexMap;