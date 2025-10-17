import React from 'react';
import styles from './MapPopup.module.css';
import placeholderImage from '../../assets/stories/cat-illustration.svg';
import { X } from 'lucide-react';

const MapPopup = ({ announcement, position, onClose }) => {
    if (!announcement || !position) {
        return null;
    }

    const imageUrl = announcement.photos && announcement.photos.length > 0
        ? announcement.photos[0].path
        : placeholderImage;

    return (
        <div className={styles.popup} style={{ left: position.x, top: position.y }}>
            <button className={styles.closeButton} onClick={onClose}>
                <X size={18} />
            </button>
            <div className={styles.content}>
                <img src={imageUrl} alt={announcement.pet_name} className={styles.petImage} />
                <div className={styles.info}>
                    <h4 className={styles.title}>
                        {announcement.pet_breed}, "{announcement.pet_name}"
                    </h4>
                    <p className={styles.description}>{announcement.description}</p>
                </div>
            </div>
        </div>
    );
};

export default MapPopup;