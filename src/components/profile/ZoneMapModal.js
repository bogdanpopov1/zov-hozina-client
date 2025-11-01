import React, { useEffect, useRef, useState } from 'react';
import styles from './ZoneMapModal.module.css';
import { X } from 'lucide-react';

const ZoneMapModal = ({ onClose, onSave }) => {
    const mapContainerRef = useRef(null); // Ref для DOM-элемента карты
    const mapInstanceRef = useRef(null); // Ref для хранения экземпляра карты Яндекса
    const placemarkRef = useRef(null);
    const circleRef = useRef(null);
    const ymapsApiRef = useRef(null);

    const [locationName, setLocationName] = useState('');
    const [radius, setRadius] = useState(1); // Default 5km
    const [center, setCenter] = useState([55.796127, 49.106414]); // Default Kazan
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const initMap = () => {
            // Строгая проверка: инициализируем, только если есть контейнер и нет уже созданной карты
            if (!mapContainerRef.current || mapInstanceRef.current) {
                return;
            }

            ymapsApiRef.current = window.ymaps;
            const map = new ymapsApiRef.current.Map(mapContainerRef.current, {
                center: center,
                zoom: 12,
                controls: ['zoomControl'],
                type: 'yandex#hybrid'
            });

            // Сохраняем экземпляр в ref, чтобы он "пережил" перемонтирование
            mapInstanceRef.current = map;

            const placemark = new ymapsApiRef.current.Placemark(center, {}, {
                preset: 'islands#violetDotIcon',
                draggable: true
            });
            placemarkRef.current = placemark;

            const circle = new ymapsApiRef.current.Circle([center, radius * 1000], {}, {
                fillColor: "#DB709377",
                strokeColor: "#990066",
                strokeOpacity: 0.8,
                strokeWidth: 2
            });
            circleRef.current = circle;

            placemark.events.add('dragend', () => {
                const newCoords = placemark.geometry.getCoordinates();
                setCenter(newCoords);
            });

            map.geoObjects.add(placemark);
            map.geoObjects.add(circle);
        };

        if (window.ymaps) {
            window.ymaps.ready(initMap);
        }

        // Функция очистки. Теперь она гарантированно будет иметь доступ к правильному экземпляру карты
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Пустой массив зависимостей по-прежнему правильный

    useEffect(() => {
        if (circleRef.current) {
            circleRef.current.geometry.setRadius(radius * 1000);
        }
    }, [radius]);

    useEffect(() => {
        if (circleRef.current && placemarkRef.current) {
            circleRef.current.geometry.setCoordinates(center);
            placemarkRef.current.geometry.setCoordinates(center);
        }
    }, [center]);

    const handleSave = async () => {
        if (!locationName.trim()) {
            setError('Пожалуйста, укажите название зоны.');
            return;
        }
        setError('');
        setIsSaving(true);
        try {
            await onSave({
                location_name: locationName,
                latitude: center[0],
                longitude: center[1],
                radius: radius,
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className={styles.closeButton}><X /></button>
                <h3>Добавить новую зону</h3>
                <p>Перетащите метку в центр нужной зоны и выберите радиус.</p>
                <div ref={mapContainerRef} className={styles.mapContainer}></div>
                
                <div className={styles.controls}>
                    <div className={styles.formGroup}>
                        <label>Название зоны</label>
                        <input
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder="Например, 'Дом' или 'Работа'"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Радиус: {radius} км</label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className={styles.slider}
                        />
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                
                <div className={styles.actions}>
                    <button onClick={onClose} className={styles.cancelButton}>Отмена</button>
                    <button onClick={handleSave} disabled={isSaving} className={styles.saveButton}>
                        {isSaving ? 'Сохранение...' : 'Сохранить зону'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ZoneMapModal;