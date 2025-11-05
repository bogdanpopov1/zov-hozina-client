import React from 'react';
import styles from './ContactOwnerModal.module.css';
import { X, Mail, Phone, Send } from 'lucide-react';

const ContactOwnerModal = ({ isOpen, onClose, owner }) => {
    if (!isOpen || !owner) {
        return null;
    }

    const hasContacts = owner.phone || owner.email || owner.telegram_username;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
                <h2>Связаться с владельцем</h2>
                <div className={styles.ownerInfo}>
                    <img src={owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name)}&background=3B82F6&color=fff`} alt={owner.name} className={styles.avatar} />
                    <span className={styles.ownerName}>{owner.name}</span>
                </div>
                {hasContacts ? (
                    <div className={styles.contactList}>
                        {owner.email && (
                            <div className={styles.contactItem}>
                                <Mail size={20} className={styles.icon} />
                                <a href={`mailto:${owner.email}`}>{owner.email}</a>
                            </div>
                        )}
                        {owner.phone && (
                            <div className={styles.contactItem}>
                                <Phone size={20} className={styles.icon} />
                                <a href={`tel:${owner.phone}`}>{owner.phone}</a>
                            </div>
                        )}
                        {owner.telegram_username && (
                            <div className={styles.contactItem}>
                                <Send size={20} className={styles.icon} />
                                <a href={`https://t.me/${owner.telegram_username}`} target="_blank" rel="noopener noreferrer">
                                    @{owner.telegram_username}
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className={styles.noContacts}>Владелец не указал контактную информацию в своем профиле.</p>
                )}
            </div>
        </div>
    );
};

export default ContactOwnerModal;