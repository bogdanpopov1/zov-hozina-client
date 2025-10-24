import React, { useRef } from 'react';
import styles from './ImageUploader.module.css';
import { UploadCloud, X, Star } from 'lucide-react';

const ImageUploader = ({
    existingPhotos = [],
    newFiles = [],
    onNewFilesChange,
    onDeleteExisting,
    onSetPrimary,
    primaryPhotoId,
    maxFiles = 5
}) => {
    const fileInputRef = useRef(null);
    const totalPhotos = existingPhotos.length + newFiles.length;

    const handleFileChange = (event) => {
        const addedFiles = Array.from(event.target.files);
        if (addedFiles.length > 0) {
            const combined = [...newFiles, ...addedFiles].slice(0, maxFiles - existingPhotos.length);
            onNewFilesChange(combined);
        }
    };

    const handleRemoveNewFile = (indexToRemove) => {
        const filtered = newFiles.filter((_, index) => index !== indexToRemove);
        onNewFilesChange(filtered);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const addedFiles = Array.from(event.dataTransfer.files);
        if (addedFiles.length > 0) {
            const combined = [...newFiles, ...addedFiles].slice(0, maxFiles - existingPhotos.length);
            onNewFilesChange(combined);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div className={styles.uploaderContainer}>
            {totalPhotos < maxFiles && (
                <div
                    className={styles.dropzone}
                    onClick={() => fileInputRef.current.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/jpeg,image/png,image/gif"
                        style={{ display: 'none' }}
                    />
                    <UploadCloud size={48} className={styles.uploadIcon} />
                    <p>Нажмите, чтобы выбрать файлы или перетащите их сюда</p>
                    <small>PNG, JPG, GIF до 2MB. Осталось: {maxFiles - totalPhotos}</small>
                </div>
            )}

            {(existingPhotos.length > 0 || newFiles.length > 0) && (
                <div className={styles.previewGrid}>
                    {existingPhotos.map(photo => (
                        <div key={photo.photo_id} className={styles.previewItem}>
                            <img src={photo.url} alt="Existing" className={styles.previewImage} />
                            <div className={styles.buttonOverlay}>
                                <button type="button" onClick={() => onSetPrimary(photo.photo_id)} className={styles.primaryButton}>
                                    <Star size={16} fill={primaryPhotoId === photo.photo_id ? 'var(--amber-yellow)' : 'none'} />
                                </button>
                                <button type="button" onClick={() => onDeleteExisting(photo.photo_id)} className={styles.removeButton}>
                                    <X size={16} />
                                </button>
                            </div>
                            {primaryPhotoId === photo.photo_id && <div className={styles.primaryBadge}>Главное</div>}
                        </div>
                    ))}
                    {newFiles.map((file, index) => (
                        <div key={index} className={styles.previewItem}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className={styles.previewImage}
                                onLoad={e => URL.revokeObjectURL(e.target.src)}
                            />
                             <div className={styles.buttonOverlay}>
                                <button type="button" onClick={() => handleRemoveNewFile(index)} className={styles.removeButtonFull}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;