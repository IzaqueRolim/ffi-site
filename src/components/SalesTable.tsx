import React, { useState, useEffect, useMemo } from "react";
import styles from "./SalesTable.module.css";
import { addSale, getSale } from "../services/salesService";
import type { Sale } from "../types/Sales";

const SalesTable: React.FC = () => {
  // Estados para a nova venda (mantidos)
  const [newSale, setNewSale] = useState({
    id: 0,
    date: "",
    product: "",
    price: "",
    client: "",
    category: "",
    origin: "",
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
    const saleToSave = { ...newSale, price: Number(newSale.price) };
    
    await addSale(saleToSave);
    await loadSales();
    
    // Reseta o formulário
    setNewSale({
      id: 0,
      date: "",
      product: "",
      price: "",
      client: "",
      category: "",
      origin: "",
    });
    setIsModalOpen(false);
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
    // Resetar o estado do formulário ao cancelar
    setNewSale({
      id: 0,
      date: "",
      product: "",
      price: "",
      client: "",
      category: "",
      origin: "",
    });
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
                         <button className={styles.actionButtonDelete}>Excluir</button>
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