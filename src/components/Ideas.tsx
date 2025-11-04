import React, { useEffect, useState, useMemo } from "react";
import styles from "./Ideas.module.css";
import { addIdea, getIdea } from "../services/ideaService";

import type { Idea } from "../types/Idea";

const Ideas: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [newIdea, setNewIdea] = useState({
    id: "",
    title: "",
    description: "",
    images: [] as string[],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState(""); // Novo estado para o texto do filtro

  // Estado para controlar a imagem atual do carrossel em cada card
  // Map<ideaId, currentImageIndex>
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    const data = await getIdea();
    setIdeas(data);
    // Inicializa o índice da primeira imagem para cada ideia
    const initialIndexes = new Map<string, number>();
    data.forEach(idea => {
      initialIndexes.set(idea.id ?? "", 0);
    });
    setCurrentImageIndexes(initialIndexes);
  }

  const handleAddImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (currentImageUrl.trim() !== "") {
      setNewIdea((prevIdea) => ({
        ...prevIdea,
        images: [...prevIdea.images, currentImageUrl.trim()],
      }));
      setCurrentImageUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIdea.title || !newIdea.description) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    let finalImages = newIdea.images;
    if (currentImageUrl.trim() !== "") {
      finalImages = [...newIdea.images, currentImageUrl.trim()];
    }

    const ideaToSubmit = { ...newIdea, images: finalImages };

    await addIdea(ideaToSubmit);
    await loadIdeas(); // Recarrega as ideias para incluir a nova e reinicializar carrosséis

    setNewIdea({
      id: "",
      title: "",
      description: "",
      images: [],
    });
    setCurrentImageUrl("");
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setNewIdea({ id: "", title: "", description: "", images: [] });
    setCurrentImageUrl("");
  };

  // Lógica de filtragem
  const filteredIdeas = useMemo(() => {
    if (!filterText) {
      return ideas;
    }
    return ideas.filter(idea =>
      idea.title.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [ideas, filterText]);

  // Funções para navegação do carrossel
  const goToNextImage = (ideaId: string, totalImages: number) => {
    setCurrentImageIndexes(prev => {
      const newMap = new Map(prev);
      const currentIndex = newMap.get(ideaId) ?? 0;
      newMap.set(ideaId, (currentIndex + 1) % totalImages);
      return newMap;
    });
  };

  const goToPrevImage = (ideaId: string, totalImages: number) => {
    setCurrentImageIndexes(prev => {
      const newMap = new Map(prev);
      const currentIndex = newMap.get(ideaId) ?? 0;
      newMap.set(ideaId, (currentIndex - 1 + totalImages) % totalImages);
      return newMap;
    });
  };

  return (
    <div className={styles.container}>
      {/* Botão para abrir o modal */}

      <h2 className={styles.title}>💡 Ideias</h2>

      <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
        + Nova Ideia
      </button>
      {/* Campo de Filtro */}
      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filtrar ideias por nome..."
          className={styles.filterInput}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* Grid de Cards */}
      <div className={styles.cards}>
        {filteredIdeas.length === 0 && (
          <p className={styles.noResults}>Nenhuma ideia encontrada com o nome "{filterText}".</p>
        )}
        {filteredIdeas.map((idea) => {
          const currentImageIndex = currentImageIndexes.get(idea.id ?? "") ?? 0;;
          const hasMultipleImages = idea.images && idea.images.length > 1;

          return (
            <div key={idea.id} className={styles.card}>
              <div className={styles.imageCarousel}>
                {idea.images && idea.images.length > 0 ? (
                  <>
                    <img
                      src={idea.images[currentImageIndex]}
                      alt={`${idea.title}-${currentImageIndex}`}
                      className={styles.carouselImage}
                    />
                    {hasMultipleImages && (
                      <>
                        <button
                          className={`${styles.carouselButton} ${styles.prevButton}`}
                          onClick={() => goToPrevImage(idea.id??"", idea.images.length)}
                        >
                          &#10094;
                        </button>
                        <button
                          className={`${styles.carouselButton} ${styles.nextButton}`}
                          onClick={() => goToNextImage(idea.id??"", idea.images.length)}
                        >
                          &#10095;
                        </button>
                      </>
                    )}
                    {hasMultipleImages && (
                        <div className={styles.imageCounter}>
                            {currentImageIndex + 1} / {idea.images.length}
                        </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noImage}>🖼️ Sem Imagem</div>
                )}
              </div>
              <div className={styles.info}>
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
                <button className={styles.button}>Acessar</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Nova Ideia</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label>
                Título:
                <input
                  type="text"
                  value={newIdea.title}
                  onChange={(e) =>
                    setNewIdea({ ...newIdea, title: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Descrição:
                <textarea
                  value={newIdea.description}
                  onChange={(e) =>
                    setNewIdea({ ...newIdea, description: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                URL da Imagem:
                <div className={styles.imageInputGroup}>
                  <input
                    type="text"
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    placeholder="Cole a URL da imagem aqui (clique no + para adicionar)"
                  />
                  <button
                    onClick={handleAddImage}
                    className={styles.addButtonSmall}
                    type="button"
                    disabled={currentImageUrl.trim() === ""}
                  >
                    +
                  </button>
                </div>
              </label>

              {newIdea.images.length > 0 && (
                <div className={styles.imagePreview}>
                  <p>Imagens adicionadas ({newIdea.images.length}):</p>
                  <ul>
                    {newIdea.images.map((url, index) => (
                      <li key={index} className={styles.imageListItem}>
                        <img src={url} alt={`Preview ${index}`} />
                        <button
                          type="button"
                          onClick={() => setNewIdea(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))}
                          className={styles.removeImageButton}
                        >
                          X
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.modalButtons}>
                <button type="submit">Salvar</button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ideas;