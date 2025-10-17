import React, { useEffect, useRef } from 'react';

const COLOR_DEFAULT = '#0095FF';
const COLOR_URGENT = '#FF0000';
const COLOR_SELECTED = '#FFD700';

const YandexMap = ({
    announcements,
    mapState,
    selectedId,
    onPlacemarkClick,
    ymaps // Получаем готовый API через props
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // Эффект для инициализации карты
    useEffect(() => {
        if (!ymaps || !mapRef.current || mapInstanceRef.current) {
            return;
        }

        mapInstanceRef.current = new ymaps.Map(mapRef.current, {
            center: mapState.center,
            zoom: mapState.zoom,
            controls: mapState.controls,
        });

        // Применяем темную тему через CSS фильтры
        mapRef.current.style.backgroundColor = '#1a1a1a';
        
        // Ждем загрузки карты и применяем фильтры
        setTimeout(() => {
            if (mapRef.current) {
                // Применяем инверсию ко всей карте
                mapRef.current.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.1)';
                
                // Создаем стили для балунов без инверсии
                const style = document.createElement('style');
                style.id = 'yandex-map-dark-theme';
                style.textContent = `
                    /* Отменяем инверсию для балунов */
                    .dark-map-container [class*="ymaps-"][class*="-balloon"] {
                        filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important;
                        background-color: #2d2d2d !important;
                        border: 1px solid #444 !important;
                        color: #fff !important;
                    }
                    .dark-map-container [class*="ymaps-"][class*="-balloon__content"] {
                        filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important;
                        background-color: #2d2d2d !important;
                        color: #fff !important;
                    }
                    .dark-map-container [class*="ymaps-"][class*="-balloon__tail"] {
                        filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important;
                        background-color: #2d2d2d !important;
                        border-color: #444 !important;
                    }
                    .dark-map-container [class*="ymaps-"][class*="-balloon__close"] {
                        filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important;
                        color: #fff !important;
                    }
                    .dark-map-container [class*="ymaps-"][class*="-balloon__close"]:hover {
                        color: #ccc !important;
                    }
                    /* Отменяем инверсию для контролов */
                    .dark-map-container [class*="ymaps-"][class*="-controls__control"] {
                        filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important;
                        background-color: rgba(45, 45, 45, 0.9) !important;
                        border: 1px solid #444 !important;
                    }
                    .dark-map-container [class*="ymaps-"][class*="-controls__control_toolbar"] {
                        filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important;
                        background-color: rgba(45, 45, 45, 0.9) !important;
                    }
                    .dark-map-container [class*="ymaps-"][class*="-controls__control_toolbar"] [class*="-button"] {
                        filter: invert(1) hue-rotate(180deg) brightness(1.25) contrast(0.9) !important;
                        color: #fff !important;
                    }
                `;
                
                // Удаляем старые стили если есть
                const existingStyle = document.getElementById('yandex-map-dark-theme');
                if (existingStyle) {
                    existingStyle.remove();
                }
                
                document.head.appendChild(style);
                mapRef.current.classList.add('dark-map-container');
            }
        }, 1000); // Даем время карте загрузиться


        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    }, [ymaps]); // Запускаем только при появлении ymaps

    // Эффект для обновления центра, меток и т.д.
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !ymaps) {
            return;
        }

        // Плавное перемещение центра карты
        map.setCenter(mapState.center, mapState.zoom, {
            duration: 300,
            checkZoomRange: true
        });

        // Очищаем старые метки
        map.geoObjects.removeAll();

        // Добавляем новые метки
        announcements.forEach(ad => {
            if (ad.latitude && ad.longitude) {
                const isSelected = selectedId === ad.announcement_id;
                let iconColor = COLOR_DEFAULT;
                if (isSelected) {
                    iconColor = COLOR_SELECTED;
                } else if (ad.is_featured) {
                    iconColor = COLOR_URGENT;
                }

                // Создаем HTML-контент для балуна в темной теме
                const balloonContent = `
                    <div style="padding: 12px; max-width: 300px; font-family: Arial, sans-serif; background-color: #2d2d2d; color: #fff;">
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <img src="${ad.photos && ad.photos.length > 0 ? ad.photos[0].path : '/placeholder-cat.svg'}" 
                                 alt="${ad.pet_name}" 
                                 style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; flex-shrink: 0;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #fff;">
                                    ${ad.pet_breed}, "${ad.pet_name}"
                                </h4>
                                <p style="margin: 0 0 8px 0; font-size: 14px; color: #ccc; line-height: 1.4;">
                                    ${ad.description || 'Описание отсутствует'}
                                </p>
                                <div style="font-size: 12px; color: #aaa;">
                                    <div style="margin-bottom: 4px;">📍 ${ad.location_address || 'Адрес не указан'}</div>
                                    <div>📅 ${new Date(ad.created_at).toLocaleDateString('ru-RU')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                const placemark = new ymaps.Placemark(
                    [parseFloat(ad.latitude), parseFloat(ad.longitude)],
                    {
                        balloonContent: balloonContent,
                        balloonContentHeader: `Объявление #${ad.announcement_id}`,
                        balloonContentBody: balloonContent,
                        balloonContentFooter: 'Нажмите для подробной информации'
                    },
                    {
                        preset: 'islands#dotIcon',
                        iconColor: iconColor,
                        hideIconOnBalloonOpen: false
                    }
                );

                // Обработчик клика - открываем балун и центрируем карту
                placemark.events.add('click', () => {
                    try {
                        onPlacemarkClick(ad);
                        // Центрируем карту на точке и увеличиваем зум
                        if (map && ad.latitude && ad.longitude) {
                            map.setCenter([parseFloat(ad.latitude), parseFloat(ad.longitude)], 15, {
                                duration: 300,
                                checkZoomRange: true
                            });
                        }
                    } catch (error) {
                        console.error('Error handling placemark click:', error);
                    }
                });

                // Переменные для управления балуном
                let balloonTimeout = null;
                let isBalloonOpen = false;
                let isMouseOverPlacemark = false;
                let isMouseOverBalloon = false;

                // Обработчик наведения мыши на метку
                placemark.events.add('mouseenter', () => {
                    try {
                        isMouseOverPlacemark = true;
                        if (balloonTimeout) {
                            clearTimeout(balloonTimeout);
                            balloonTimeout = null;
                        }
                        
                        balloonTimeout = setTimeout(() => {
                            if (!isBalloonOpen && isMouseOverPlacemark && placemark && placemark.balloon) {
                                placemark.balloon.open();
                                isBalloonOpen = true;
                            }
                        }, 200); // Задержка 200мс
                    } catch (error) {
                        console.error('Error handling mouseenter:', error);
                    }
                });

                // Обработчик увода мыши с метки
                placemark.events.add('mouseleave', () => {
                    try {
                        isMouseOverPlacemark = false;
                        if (balloonTimeout) {
                            clearTimeout(balloonTimeout);
                            balloonTimeout = null;
                        }
                        
                        balloonTimeout = setTimeout(() => {
                            if (isBalloonOpen && !isMouseOverPlacemark && !isMouseOverBalloon && placemark && placemark.balloon) {
                                placemark.balloon.close();
                                isBalloonOpen = false;
                            }
                        }, 300); // Задержка 300мс
                    } catch (error) {
                        console.error('Error handling mouseleave:', error);
                    }
                });

                // Обработчики событий балуна
                try {
                    placemark.balloon.events.add('open', () => {
                        try {
                            isBalloonOpen = true;
                        } catch (error) {
                            console.error('Error in balloon open event:', error);
                        }
                    });

                    placemark.balloon.events.add('close', () => {
                        try {
                            isBalloonOpen = false;
                            isMouseOverBalloon = false;
                            if (balloonTimeout) {
                                clearTimeout(balloonTimeout);
                                balloonTimeout = null;
                            }
                        } catch (error) {
                            console.error('Error in balloon close event:', error);
                        }
                    });

                    // Обработчики наведения мыши на балун
                    placemark.balloon.events.add('mouseenter', () => {
                        try {
                            isMouseOverBalloon = true;
                            if (balloonTimeout) {
                                clearTimeout(balloonTimeout);
                                balloonTimeout = null;
                            }
                        } catch (error) {
                            console.error('Error in balloon mouseenter event:', error);
                        }
                    });

                    placemark.balloon.events.add('mouseleave', () => {
                        try {
                            isMouseOverBalloon = false;
                            if (balloonTimeout) {
                                clearTimeout(balloonTimeout);
                                balloonTimeout = null;
                            }
                            
                            balloonTimeout = setTimeout(() => {
                                if (isBalloonOpen && !isMouseOverPlacemark && !isMouseOverBalloon && placemark && placemark.balloon) {
                                    placemark.balloon.close();
                                    isBalloonOpen = false;
                                }
                            }, 300);
                        } catch (error) {
                            console.error('Error in balloon mouseleave event:', error);
                        }
                    });
                } catch (error) {
                    console.error('Error setting up balloon events:', error);
                }

                map.geoObjects.add(placemark);
            }
        });

    }, [announcements, mapState, selectedId, onPlacemarkClick, ymaps]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default YandexMap;