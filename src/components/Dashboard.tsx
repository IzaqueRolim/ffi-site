// src/components/Dashboard/Dashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import styles from './Dashboard.module.css'; // Módulo CSS (você precisará criar este arquivo)
import { fetchDashboardMetrics } from '../services/dashboardService'; // Ajuste o caminho se necessário
import type { DashboardMetrics } from '../types/Dashboard'; // Ajuste o caminho se necessário

// Componente Auxiliar para exibir um KPI
const KPICard: React.FC<{ title: string, value: string | number, subtitle?: string }> = ({ title, value, subtitle }) => (
  <div className={styles.kpiCard}>
    <p className={styles.kpiTitle}>{title}</p>
    <p className={styles.kpiValue}>{value}</p>
    {subtitle && <p className={styles.kpiSubtitle}>{subtitle}</p>}
  </div>
);

// Componente Auxiliar para exibir Itens de Ranking
const RankingItem: React.FC<{ rank: number, name: string, value: number, unit: string }> = ({ rank, name, value, unit }) => (
    <li className={styles.rankingItem}>
        <span className={styles.rankBadge}>{rank}</span>
        <span className={styles.itemName}>{name}</span>
        <span className={styles.itemValue}>{value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {unit}</span>
    </li>
);

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulação de filtros de data (opcional, mas útil)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Passa os filtros de data para o serviço
      const data = await fetchDashboardMetrics(startDate || undefined, endDate || undefined);
      setMetrics(data);
    } catch (err) {
      console.error("Erro ao carregar métricas do dashboard:", err);
      setError("Não foi possível carregar as métricas. Verifique o console para detalhes.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (loading) {
    return <div className={styles.dashboardContainer}><h2 className={styles.loading}>Carregando dados do Dashboard...</h2></div>;
  }

  if (error || !metrics) {
    return <div className={styles.dashboardContainer}><h2 className={styles.error}>Erro: {error || "Dados não disponíveis."}</h2></div>;
  }

  // --- Renderização ---

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h2 className={styles.title}>📊 Dashboard de Performance - Impressão 3D</h2>
        <div className={styles.filterControls}>
            <label>Período:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} title="Data Inicial" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} title="Data Final" />
            <button onClick={loadMetrics} className={styles.refreshButton}>Atualizar</button>
        </div>
      </header>
      
      {/* SEÇÃO 1: KPIs Financeiros */}
      <section className={styles.kpiGrid}>
        <KPICard 
          title="Receita Total" 
          value={formatCurrency(metrics.totalRevenue)} 
          subtitle={`+${metrics.revenueGrowthPercentage.toFixed(1)}% vs. Período Anterior`}
        />
        <KPICard 
          title="Custo de Insumos" 
          value={formatCurrency(metrics.totalPurchaseCost)} 
          subtitle="Matérias-primas consumidas"
        />
        <KPICard 
          title="Lucro Bruto" 
          value={formatCurrency(metrics.grossProfit)} 
          subtitle={`Margem: ${((metrics.grossProfit / metrics.totalRevenue) * 100).toFixed(1)}%`}
        />
        <KPICard 
          title="Total de Vendas" 
          value={`${metrics.totalSalesCount} pedidos`} 
          subtitle={`Ticket Médio: ${formatCurrency(metrics.averageSaleValue)}`}
        />
      </section>

      <div className={styles.contentGrid}>
        
        {/* SEÇÃO 2: Ranking de Vendas */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🏆 Top Vendas por Receita</h3>
          <ul className={styles.rankingList}>
            {metrics.topSellingProduct ? (
                <RankingItem 
                    rank={1} 
                    name={metrics.topSellingProduct.productName} 
                    value={metrics.topSellingProduct.revenue} 
                    unit="em Receita"
                />
            ) : <p className={styles.noData}>Nenhuma venda registrada.</p>}
          </ul>
          {metrics.topCategory && (
              <p className={styles.categoryNote}>
                Categoria Líder: **{metrics.topCategory.categoryName}** ({formatCurrency(metrics.topCategory.revenue)})
              </p>
          )}
        </div>

        {/* SEÇÃO 3: Ranking de Custos de Insumos */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🔥 Top 3 Materiais Mais Comprados (Custo)</h3>
          <ul className={styles.rankingList}>
            {metrics.materialCostDistribution.slice(0, 3).map((item, index) => (
                <RankingItem 
                    key={item.materialName}
                    rank={index + 1}
                    name={item.materialName}
                    value={item.percentage}
                    unit="%"
                />
            ))}
          </ul>
          {metrics.topPurchasedMaterial && (
             <p className={styles.materialNote}>
                Material Mais Comprado: **{metrics.topPurchasedMaterial.materialName}** ({metrics.topPurchasedMaterial.totalQuantity} unidades)
             </p>
          )}
        </div>

        {/* SEÇÃO 4: Insights Operacionais */}
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>💡 Insights Operacionais</h3>
            <div className={styles.insights}>
                <p>📅 **Dia de Maior Pico:** <span className={styles.insightValue}>{metrics.busiestDayOfWeek || 'N/D'}</span></p>
                {/* Aqui caberiam outros insights, como a distribuição de origem das vendas */}
            </div>
        </div>

        {/* SEÇÃO 5: Distribuição de Custos (Gráfico de Pizza/Donut) */}
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>% Distribuição de Custos de Insumos</h3>
            <div className={styles.distributionChartPlaceholder}>
                {/* Em uma aplicação real, você renderizaria um Gráfico de Pizza aqui (ex: Chart.js, Recharts) */}
                {metrics.materialCostDistribution.length > 0 ? (
                    <p>Gráfico de Pizza da Distribuição de Custos (Implementar com biblioteca de charts)</p>
                ) : <p className={styles.noData}>Nenhuma compra registrada para análise.</p>}
            </div>
        </div>


      </div>
    </div>
  );
};

export default Dashboard;