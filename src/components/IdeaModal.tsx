import React, { useState } from "react";
import styles from "./Ideas.module.css"; // Reutilizando os estilos para o modal e carrossel
import type { Idea } from "../types/Idea";

interface IdeaModalProps {
  idea: Idea;
  onClose: () => void;
}

const IdeaModal: React.FC<IdeaModalProps> = ({ idea, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const totalImages = idea.images?.length ?? 0;
  const hasMultipleImages = totalImages > 1;

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + totalImages) % totalImages
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.ideaModalContent} onClick={(e) => e.stopPropagation()}>
        {/* Botão de Fechar */}
        <button className={styles.closeModalButton} onClick={onClose}>
          &times;
        </button>

        {/* Carrossel de Imagens */}
        <div className={styles.imageCarouselExpanded}>
          {totalImages > 0 ? (
            <>
              <img
                src={idea.images?.[currentImageIndex]}
                alt={idea.title}
                className={styles.expandedCarouselImage}
              />
              {hasMultipleImages && (
                <>
                  <button
                    className={`${styles.carouselButtonExpanded} ${styles.prevButtonExpanded}`}
                    onClick={goToPrevImage}
                  >
                    &#10094;
                  </button>
                  <button
                    className={`${styles.carouselButtonExpanded} ${styles.nextButtonExpanded}`}
                    onClick={goToNextImage}
                  >
                    &#10095;
                  </button>
                </>
              )}
              {totalImages > 0 && (
                <div className={styles.imageCounterExpanded}>
                  {currentImageIndex + 1} / {totalImages}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noImageExpanded}>🖼️ Sem Imagem</div>
          )}
        </div>

        {/* Informações da Ideia */}
        <div className={styles.ideaModalInfo}>
          <h2>{idea.title}</h2>
          <p className={styles.modalDescription}>{idea.description}</p>
        </div>
      </div>
    </div>
  );
};

export default IdeaModal;