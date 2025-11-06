import React, { useState, useEffect, useMemo } from "react";
import styles from "./SalesTable.module.css";
import { addSale, deleteSale, getSale } from "../services/salesService";
import type { Sale } from "../types/Sales";

const SalesTable: React.FC = () => {
  // Estados para a nova venda (mantidos)
  const [newSale, setNewSale] = useState({
    id: 0,
    date: new Date().toISOString().substring(0, 10) ,
    product: "",
    price: "",
    client: "",
    category: "",
    origin: "",
    materialCost:"",
    quantity:""
  });
  const [sales, setSales] = useState<Sale[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NOVOS ESTADOS PARA FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    const data = await getSale();
    setSales(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.product || !newSale.price || !newSale.client || !newSale.date) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    
    // Converte o preço para número antes de salvar
    const saleToSave = { ...newSale, price: Number(newSale.price),quantity:Number(newSale.quantity),materialCost:Number(newSale.materialCost) };
    
    await addSale(saleToSave);
    await loadSales();
    
    // Reseta o formulário
    setNewSale({
      id: 0,
      date: new Date().toISOString().substring(0, 10),
      product: "",
      price: "",
      client: "",
      category: "",
      origin: "",
      materialCost:"",
      quantity:""
    });
    setIsModalOpen(false);
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
    // Resetar o estado do formulário ao cancelar
    setNewSale({
      id: 0,
      date: new Date().toISOString().substring(0, 10),
      product: "",
      price: "",
      client: "",
      category: "",
      origin: "",
      quantity:"",
      materialCost:"",
    });
  };

  const handleDeleteSale = async (docId: string, productName: string) => {
    // 1. Confirmação do Usuário
    const isConfirmed = window.confirm(
      `Tem certeza de que deseja excluir a venda do produto "${productName}"?`
    );

    if (!isConfirmed) {
      return; // Cancela a exclusão
    }

    try {
      // 2. Chama a função do serviço para deletar no Firestore
      await deleteSale(docId);
      
      // 3. Recarrega a lista de vendas para atualizar a interface
      await loadSales();
      
      // Opcional: Fecha a linha expandida após a exclusão
      setExpandedRow(null); 
      
      alert(`Venda de "${productName}" excluída com sucesso!`);
    } catch (error) {
      console.error("Erro ao excluir venda:", error);
      alert("Houve um erro ao tentar excluir a venda.");
    }
  };

  // Lógica de filtragem com useMemo para otimização
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // 1. Filtro por Termo (Produto ou Cliente)
      const termMatch =
        sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.client.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filtro por Período (Data)
      const saleDate = new Date(sale.date);
      let dateMatch = true;

      if (startDate) {
        const start = new Date(startDate);
        // A venda deve ser NA DATA OU DEPOIS da data de início
        if (saleDate < start) {
          dateMatch = false;
        }
      }

      if (dateMatch && endDate) {
        const end = new Date(endDate);
        // Ajusta a data final para incluir todo o dia (até 23:59:59)
        end.setDate(end.getDate() + 1); 
        
        // A venda deve ser ANTES da data de fim ajustada (ou seja, até o dia de fim)
        if (saleDate >= end) {
          dateMatch = false;
        }
      }

      return termMatch && dateMatch;
    });
  }, [sales, searchTerm, startDate, endDate]);


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📈 Tabela de Vendas</h2>

      <div className={styles.headerActions}>
        <div className={styles.filterGroup}>
          {/* Input de Pesquisa por Nome/Cliente */}
          <input
            type="text"
            placeholder="Pesquisar Produto ou Cliente..."
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

        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          + Nova Venda
        </button>
      </div>
      
      {/* Exibir mensagem se não houver resultados */}
      {filteredSales.length === 0 ? (
        <p className={styles.noResults}>Nenhuma venda encontrada com os filtros aplicados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <React.Fragment key={sale.id}>
                <tr
                  onClick={() =>
                    setExpandedRow(expandedRow === sale.id ? null : sale.id)
                  }
                  className={expandedRow === sale.id ? styles.rowActive : ''}
                >
                  <td data-label="Data">{new Date(sale.date).toLocaleDateString("pt-BR")}</td>
                  <td data-label="Produto">{sale.product}</td>
                  <td data-label="Preço" className={styles.priceColumn}>R$ {sale.price.toFixed(2)}</td>
                  <td data-label="Cliente">{sale.client}</td>
                </tr>

                {expandedRow === sale.id && (
                  <tr className={styles.expandedRow}>
                    <td colSpan={4}>
                      <div className={styles.expandedContent}>
                        <p>
                          <strong>Categoria:</strong> <span>{sale.category || 'N/A'}</span>
                        </p>
                        <p>
                          <strong>Origem:</strong> <span>{sale.origin || 'N/A'}</span>
                        </p>
                      </div>
                      <div className={styles.expandedContentRight}>
                         <button className={styles.actionButtonEdit}>Editar</button>
                         <button className={styles.actionButtonDelete} onClick={()=>handleDeleteSale(sale.docId, sale.product)}>Excluir</button>
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
            <h3>Nova Venda</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              
              {/* Campos do Formulário (mantidos e estilizados) */}
              <label>
                Data:
                <input
                  type="date"
                  value={newSale.date}
                  onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                  required
                />
              </label>
              <label>
                Produto:
                <input
                  type="text"
                  value={newSale.product}
                  onChange={(e) => setNewSale({ ...newSale, product: e.target.value })}
                  required
                />
              </label>
              <label>
                Preço:
                <input
                  type="number"
                  step="0.01"
                  value={newSale.price}
                  onChange={(e) => setNewSale({ ...newSale, price: e.target.value })}
                  required
                />
              </label>
                <label>
                Quantidade:
                <input
                  type="number"
                  step="0.01"
                  value={newSale.quantity}
                  onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                  required
                />
              </label>
              <label>
                Cliente:
                <input
                  type="text"
                  value={newSale.client}
                  onChange={(e) => setNewSale({ ...newSale, client: e.target.value })}
                  required
                />
              </label>
              <label>
                Categoria:
                <input
                  type="text"
                  value={newSale.category}
                  onChange={(e) => setNewSale({ ...newSale, category: e.target.value })}
                />
              </label>
                <label>
                Custo Material:
                <input
                  type="number"
                  step="0.01"
                  value={newSale.materialCost}
                  onChange={(e) => setNewSale({ ...newSale, materialCost: e.target.value })}
                />
              </label>
              <label>
                Origem:
                <input
                  type="text"
                  value={newSale.origin}
                  onChange={(e) => setNewSale({ ...newSale, origin: e.target.value })}
                />
              </label>

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

export default SalesTable;