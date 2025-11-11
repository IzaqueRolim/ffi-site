import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, type PieLabelRenderProps, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, Calendar } from 'lucide-react';
import { fetchDashboardMetrics, getDashboardChartData } from '../services/dashboardService';
import type { DashboardMetrics } from '../types/Dashboard';


const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  maxWidth: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '2rem'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b'
  },
  filterContainer: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  input: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    padding: '0.5rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: '#8b5cf6',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  grid: {
    display: 'grid',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  grid4: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
  },
  grid2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
  },
  grid3: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  },
  card: {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    transition: 'box-shadow 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  iconBox: {
    padding: '0.75rem',
    borderRadius: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '0.25rem'
  },
  value: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  smallText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '0.5rem'
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  gradientCard: {
    borderRadius: '1rem',
    padding: '1.5rem',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
  },
  error: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '2rem'
  }
};

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros de data - padrão: últimos 30 dias
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardMetrics(startDate, endDate);
      setMetrics(data);
    } catch (err) {
      setError('Erro ao carregar as métricas. Tente novamente.');
      console.error('Erro ao buscar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleFilter = () => {
    loadMetrics();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const [categoryChart, setCategoryChart] = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getDashboardChartData();
      setCategoryChart(data.categoryChart);
      setMonthlyChart(data.monthlyChart);
    })();
  }, []);


  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={{ fontSize: '1.5rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e2e8f0',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Carregando métricas...
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <div style={{ fontSize: '1.5rem', color: '#dc2626', marginBottom: '0.5rem' }}>{error}</div>
        <button 
          onClick={loadMetrics}
          style={{ ...styles.button, marginTop: '1rem' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#7c3aed'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#8b5cf6'}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <div style={styles.header}>
          <div style={{display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem'
                }}>
            <div>
              <h1 style={styles.title}>Dashboard Analítico</h1>
              <p style={styles.subtitle}>Visão geral do desempenho do negócio</p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Data Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                  Data Fim
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              <button
                onClick={handleFilter}
                style={styles.button}
                onMouseEnter={(e) => e.currentTarget.style.background = '#7c3aed'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#8b5cf6'}
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>

        

        <div style={{ ...styles.grid, ...styles.grid4 }}>
          {/* Receita Total */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: '#dcfce7' }}>
                <DollarSign size={24} color="#16a34a" />
              </div>
              {metrics.revenueGrowthPercentage !== 0 && (
                <span style={{
                  ...styles.badge,
                  color: metrics.revenueGrowthPercentage > 0 ? '#16a34a' : '#dc2626'
                }}>
                  {metrics.revenueGrowthPercentage > 0 ? <TrendingUp size={16} style={{ marginRight: '0.25rem' }} /> : <TrendingDown size={16} style={{ marginRight: '0.25rem' }} />}
                  {formatPercentage(metrics.revenueGrowthPercentage)}
                </span>
              )}
            </div>
            <h3 style={styles.label}>Receita Total</h3>
            <p style={styles.value}>{formatCurrency(metrics.totalRevenue)}</p>
          </div>

           {/* Total de Custos */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: '#f3e8ff' }}>
                <CreditCard size={24} color="#d90606ff" />
              </div>
            </div>
            <h3 style={styles.label}>Total de Custos</h3>
            <p style={styles.value}>{formatCurrency(metrics.totalPurchaseCost)}</p>
            <p style={styles.smallText}>transações</p>
          </div>

          {/* Lucro Bruto */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: '#dbeafe' }}>
                <TrendingUp size={24} color="#2563eb" />
              </div>
            </div>
            <h3 style={styles.label}>Lucro Bruto</h3>
            <p style={styles.value}>{formatCurrency(metrics.grossProfit)}</p>
            <p style={styles.smallText}>
              Margem: {metrics.totalRevenue > 0 ? ((metrics.grossProfit / metrics.totalRevenue) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>

          {/* Total de Vendas */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: '#f3e8ff' }}>
                <ShoppingCart size={24} color="#9333ea" />
              </div>
            </div>
            <h3 style={styles.label}>Total de Vendas</h3>
            <p style={styles.value}>{metrics.totalSalesCount}</p>
            <p style={styles.smallText}>transações</p>
          </div>
         

        </div>
        <div style={{display:'flex'}}>
            <div>
              <h2>📊 Vendas por Categoria</h2>
              <BarChart width={600} height={300} data={categoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </div>
            <div>
              <h2>📈 Faturamento Mensal</h2>
              <LineChart width={600} height={300} data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" />
              </LineChart>
            </div>
        </div>
        <div style={{ ...styles.grid, ...styles.grid3 }}>
          {metrics.topSellingProduct ? (
            <div style={{
              ...styles.gradientCard,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', opacity: 0.9 }}>
                🏆 Produto Mais Vendido
              </h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {metrics.topSellingProduct.productName}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Receita</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {formatCurrency(metrics.topSellingProduct.revenue)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Quantidade</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {metrics.topSellingProduct.quantity} un
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.card}>
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>Sem dados de produtos</p>
            </div>
          )}

          {/* Categoria Principal */}
          {metrics.topCategory ? (
            <div style={{
              ...styles.gradientCard,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', opacity: 0.9 }}>
                📊 Categoria Principal
              </h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {metrics.topCategory.categoryName}
              </p>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Receita Total</p>
                <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  {formatCurrency(metrics.topCategory.revenue)}
                </p>
              </div>
            </div>
          ) : (
            <div style={styles.card}>
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>Sem dados de categorias</p>
            </div>
          )}

          {/* Dia Mais Movimentado */}
          {metrics.busiestDayOfWeek ? (
            <div style={{
              ...styles.gradientCard,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', opacity: 0.9 }}>
                📅 Dia Mais Movimentado
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Calendar size={48} style={{ opacity: 0.8 }} />
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.busiestDayOfWeek}</p>
              </div>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '1rem' }}>Maior volume de vendas</p>
            </div>
          ) : (
            <div style={styles.card}>
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>Sem dados de vendas</p>
            </div>
          )}
        </div>

    
      </div>
    </div>
  );
};

export default Dashboard;