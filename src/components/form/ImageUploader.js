import React, { useRef } from 'react';
import styles from './ImageUploader.module.css';
import { UploadCloud, X } from 'lucide-react';

const ImageUploader = ({ files, onFilesChange, maxFiles = 5 }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        if (newFiles.length > 0) {
            const combined = [...files, ...newFiles].slice(0, maxFiles);
            onFilesChange(combined);
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        const filtered = files.filter((_, index) => index !== indexToRemove);
        onFilesChange(filtered);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const newFiles = Array.from(event.dataTransfer.files);
        if (newFiles.length > 0) {
            const combined = [...files, ...newFiles].slice(0, maxFiles);
            onFilesChange(combined);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div className={styles.uploaderContainer}>
            <div
                className={styles.dropzone}
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/gif"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <UploadCloud size={48} className={styles.uploadIcon} />
                <p>
                    <b>Нажмите, чтобы выбрать файлы</b> или перетащите их сюда
                </p>
                <small>PNG, JPG, GIF до 2MB. Не более {maxFiles} файлов.</small>
            </div>
            {files.length > 0 && (
                <div className={styles.previewGrid}>
                    {files.map((file, index) => (
                        <div key={index} className={styles.previewItem}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`preview ${index}`}
                                className={styles.previewImage}
                                onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Очистка после загрузки
                            />
                            <button
                                type="button"
                                className={styles.removeButton}
                                onClick={() => handleRemoveFile(index)}
                            >
                                <X size={16} />
                            </button>
                            {index === 0 && <div className={styles.primaryBadge}>Главное</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;