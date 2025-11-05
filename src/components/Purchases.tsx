import React, { useEffect, useState, useMemo } from "react";
import { addPurchase, deletePurchase, getPurchases } from "../services/purchaseService";
import type { Purchase } from "../types/Purchase";
import styles from "./Purchases.module.css";

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // NOVOS ESTADOS PARA FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Estado para o modal (adicionar nova compra)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    date: new Date().toISOString().substring(0, 10), // Define a data de hoje como padrão
    item: "",
    price: "",
    quantity: "",
    store: "",
    payment: "",
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  async function loadPurchases() {
    const data = await getPurchases();
    setPurchases(data);
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchase.item || !newPurchase.price || !newPurchase.quantity) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    const purchaseToSave: Purchase = {
        docId:"",
        id: Date.now(), // ID temporário
        date: newPurchase.date,
        item: newPurchase.item,
        price: Number(newPurchase.price),
        quantity: Number(newPurchase.quantity),
        store: newPurchase.store,
        payment: newPurchase.payment,
    };
    
    await addPurchase(purchaseToSave);
    await loadPurchases(); 
    
    // Resetar o formulário
    setNewPurchase({
        date: new Date().toISOString().substring(0, 10),
        item: "",
        price: "",
        quantity: "",
        store: "",
        payment: "",
    });
    setIsModalOpen(false);
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
    // Resetar o estado do formulário ao cancelar
    setNewPurchase({
        date: new Date().toISOString().substring(0, 10),
        item: "",
        price: "",
        quantity: "",
        store: "",
        payment: "",
    });
  };

  // Lógica de filtragem com useMemo para otimização
  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => {
      // 1. Filtro por Termo (Item ou Loja)
      const termMatch =
        purchase.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.store?.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filtro por Período (Data)
      const purchaseDate = new Date(purchase.date);
      let dateMatch = true;
      
      if (startDate) {
        const start = new Date(startDate);
        if (purchaseDate < start) {
          dateMatch = false;
        }
      }

      if (dateMatch && endDate) {
        const end = new Date(endDate);
        // Ajusta a data final para incluir todo o dia
        end.setDate(end.getDate() + 1); 
        
        if (purchaseDate >= end) {
          dateMatch = false;
        }
      }

      return termMatch && dateMatch;
    });
  }, [purchases, searchTerm, startDate, endDate]);


   const handleDeletePurchase = async (docId: string, productName: string) => {
      // 1. Confirmação do Usuário
      const isConfirmed = window.confirm(
        `Tem certeza de que deseja excluir a compra do produto "${productName}"?`
      );

      console.log(docId)
  
      if (!isConfirmed) {
        return; // Cancela a exclusão
      }
  
      try {
        // 2. Chama a função do serviço para deletar no Firestore
        await deletePurchase(docId);
        
        // 3. Recarrega a lista de vendas para atualizar a interface
        await loadPurchases();
        
        // Opcional: Fecha a linha expandida após a exclusão
        setExpandedRow(null); 
        
        alert(`Venda de "${productName}" excluída com sucesso!`);
      } catch (error) {
        console.error("Erro ao excluir venda:", error);
        alert("Houve um erro ao tentar excluir a venda.");
      }
    };
  


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🛒 Registro de Compras</h2>

      <div className={styles.headerActions}>
        <div className={styles.filterGroup}>
          {/* Input de Pesquisa por Nome/Loja */}
          <input
            type="text"
            placeholder="Pesquisar Item ou Loja..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filtro por Data Inicial */}
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Data Inicial"
          />

          {/* Filtro por Data Final */}
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="Data Final"
          />
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
          + Nova Compra
        </button>
      </div>

      {/* Exibir mensagem se não houver resultados */}
      {filteredPurchases.length === 0 ? (
        <p className={styles.noResults}>Nenhuma compra encontrada com os filtros aplicados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Item</th>
              <th>Loja</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((purchase) => (
              <React.Fragment key={purchase.id}>
                <tr
                  onClick={() =>
                    setExpandedRow(
                      expandedRow === purchase.id ? null : purchase.id
                    )
                  }
                  className={expandedRow === purchase.id ? styles.rowActive : styles.row}
                >
                  <td data-label="Data">{new Date(purchase?.date).toLocaleDateString("pt-BR")}</td>
                  <td data-label="Item">{purchase?.item}</td>
                  <td data-label="Loja">{purchase?.store}</td>
                  <td data-label="Total" className={styles.priceColumn}>
                    R$ {(purchase.price * purchase.quantity).toFixed(2)}
                  </td>
                </tr>

                {expandedRow === purchase.id && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={4}>
                      <div className={styles.expandedContentGroup}>
                        <div className={styles.expandedContent}>
                          <p>
                            <strong>Preço Unitário:</strong> R$ {purchase.price?.toFixed(2)}
                          </p>
                          <p>
                            <strong>Quantidade:</strong> {purchase.quantity}
                          </p>
                          <p>
                            <strong>Forma de Pagamento:</strong> {purchase.payment}
                          </p>
                        </div>
                        <div className={styles.expandedActions}>
                           <button className={styles.actionButtonEdit}>Editar</button>
                           <button className={styles.actionButtonDelete} onClick={()=>handleDeletePurchase(purchase.docId,purchase.item)}>Excluir</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      
      {/* MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Registrar Nova Compra</h3>
            <form onSubmit={handleAdd} className={styles.form}>
              
              <label>
                Data:
                <input
                  type="date"
                  value={newPurchase.date}
                  onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                  required
                />
              </label>
              <label>
                Item:
                <input
                  type="text"
                  value={newPurchase.item}
                  onChange={(e) => setNewPurchase({ ...newPurchase, item: e.target.value })}
                  required
                />
              </label>
              <label>
                Loja:
                <input
                  type="text"
                  value={newPurchase.store}
                  onChange={(e) => setNewPurchase({ ...newPurchase, store: e.target.value })}
                />
              </label>
              
              <div className={styles.formGroupInline}>
                <label>
                    Preço Unitário:
                    <input
                      type="number"
                      step="0.01"
                      value={newPurchase.price}
                      onChange={(e) => setNewPurchase({ ...newPurchase, price: e.target.value })}
                      required
                    />
                </label>
                <label>
                    Quantidade:
                    <input
                      type="number"
                      value={newPurchase.quantity}
                      onChange={(e) => setNewPurchase({ ...newPurchase, quantity: e.target.value })}
                      required
                    />
                </label>
              </div>
              
              <label>
                Pagamento:
                <input
                  type="text"
                  value={newPurchase.payment}
                  onChange={(e) => setNewPurchase({ ...newPurchase, payment: e.target.value })}
                />
              </label>

              <div className={styles.modalButtons}>
                <button type="submit">Salvar Compra</button>
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

export default Purchases;