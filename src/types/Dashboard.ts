import type { Purchase } from "./Purchase";
import type { Sale } from "./Sales";

export interface DashboardMetrics {

  /** Receita Total Bruta das vendas no período selecionado. */
  totalRevenue: number;

  /** Custo Total dos Insumos (Materiais) comprados no período. */
  totalPurchaseCost: number;

  /** Lucro Bruto (Receita Total - Custo dos Insumos relacionados a essas vendas).
   * NOTA: Este seria um cálculo complexo, pois exigiria o custo do material por item vendido.
   * Aqui, representamos a diferença simples entre receita e custo de aquisição.
   */
  grossProfit: number;

  /** Número total de transações de venda no período. */
  totalSalesCount: number;

  /** Média de valor por transação de venda. */
  averageSaleValue: number;

  /** O produto mais vendido (em receita ou quantidade). */
  topSellingProduct: {
    productName: string;
    revenue: number;
    quantity: number;
  } | null;
  
  /** A categoria de produto que gerou mais receita. */
  topCategory: {
    categoryName: string;
    revenue: number;
  } | null;


  /** O material de insumo mais comprado (em custo ou quantidade). */
  topPurchasedMaterial: {
    materialName: string; // Corresponde a 'item' em Purchase
    totalCost: number;
    totalQuantity: number;
  } | null;

  /** Distribuição percentual dos materiais comprados por custo. */
  materialCostDistribution: {
    materialName: string;
    percentage: number; 
  }[];

  /** Variação percentual na receita em relação ao período anterior (ex: Mês vs Mês anterior). */
  revenueGrowthPercentage: number;

  /** O dia da semana com maior volume de vendas. */
  busiestDayOfWeek: string | null; 
}
export interface FilteredSale extends Sale {

}

export interface FilteredPurchase extends Purchase {
}