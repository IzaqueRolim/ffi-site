// src/services/dashboardService.ts
import { getPurchases } from "./purchaseService"; // Assumindo que os serviços de Sale e Purchase estão em purchaseService.ts (o que é incomum, mas seguindo sua estrutura)
import type { DashboardMetrics } from "../types/Dashboard";
import type { Sale } from "../types/Sales";
import type { Purchase } from "../types/Purchase";
import { getSale } from "./salesService";
import { getFormattedDate } from "../utils/dateFormated";

// --- Funções Auxiliares para Processamento de Dados ---

const DAYS_OF_WEEK = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

/**
 * Calcula o custo associado a uma venda.
 * Nota: Em um sistema real, você usaria a 'category' ou 'product' para procurar o custo unitário do material.
 * Aqui, faremos uma simplificação: usaremos o preço de venda como uma estimativa simplificada do valor da venda,
 * e para o custo de material, usaremos o custo médio ou um valor fixo por categoria, se disponível.
 * Para este exercício, vamos ignorar a complexidade do custo por item e focar nas métricas primárias.
 */
function calculateProfitAndCost(sales: Sale[], purchases: Purchase[]): { totalRevenue: number, totalPurchaseCost: number, grossProfit: number } {
    
    // 1. Receita Total (Revenue)
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.price*sale.quantity), 0);

    // 2. Custo Total de Insumos (Purchase Cost)
    // Aqui, agregamos o custo de todos os insumos comprados (mesmo que não se relacionem diretamente com as vendas do período)
    const totalPurchaseCost = purchases.reduce((sum, purchase) => sum + (purchase.price), 0);
    
    // 3. Lucro Bruto (Simplificado: Receita - Custo de Insumos no Período)
    const grossProfit = totalRevenue - totalPurchaseCost;

    return { totalRevenue, totalPurchaseCost, grossProfit };
}

function getTopSellingProduct(sales: Sale[]): DashboardMetrics['topSellingProduct'] {
    if (sales.length === 0) return null;

    const productMap: { [key: string]: { revenue: number, quantity: number } } = {};

    sales.forEach(sale => {
        if (!productMap[sale.product]) {
            productMap[sale.product] = { revenue: 0, quantity: 0 };
        }
        productMap[sale.product].revenue += sale.price;
        // Assumindo que cada 'Sale' representa 1 unidade, ajuste se for diferente
        productMap[sale.product].quantity += 1; 
    });

    let topProduct: { productName: string, revenue: number, quantity: number } | null = null;

    for (const name in productMap) {
        if (!topProduct || productMap[name].revenue > topProduct.revenue) {
            topProduct = {
                productName: name,
                revenue: productMap[name].revenue,
                quantity: productMap[name].quantity
            };
        }
    }
    return topProduct;
}

function getTopCategory(sales: Sale[]): DashboardMetrics['topCategory'] {
    if (sales.length === 0) return null;

    const categoryMap: { [key: string]: number } = {};

    sales.forEach(sale => {
        const category = sale.category || 'Outros';
        categoryMap[category] = (categoryMap[category] || 0) + sale.price;
    });

    let topCategory: { categoryName: string, revenue: number } | null = null;

    for (const name in categoryMap) {
        if (!topCategory || categoryMap[name] > topCategory.revenue) {
            topCategory = {
                categoryName: name,
                revenue: categoryMap[name]
            };
        }
    }
    return topCategory;
}

function getTopPurchasedMaterial(purchases: Purchase[]): DashboardMetrics['topPurchasedMaterial'] {
    if (purchases.length === 0) return null;

    const materialMap: { [key: string]: { totalCost: number, totalQuantity: number } } = {};

    purchases.forEach(purchase => {
        const cost = purchase.price;
        if (!materialMap[purchase.item]) {
            materialMap[purchase.item] = { totalCost: 0, totalQuantity: 0 };
        }
        materialMap[purchase.item].totalCost += cost;
        materialMap[purchase.item].totalQuantity += purchase.quantity;
    });

    let topMaterial: { materialName: string, totalCost: number, totalQuantity: number } | null = null;

    for (const name in materialMap) {
        if (!topMaterial || materialMap[name].totalCost > topMaterial.totalCost) {
            topMaterial = {
                materialName: name,
                totalCost: materialMap[name].totalCost,
                totalQuantity: materialMap[name].totalQuantity
            };
        }
    }
    return topMaterial;
}

function getMaterialCostDistribution(purchases: Purchase[]): DashboardMetrics['materialCostDistribution'] {
    if (purchases.length === 0) return [];
    
    const totalCost = purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    if (totalCost === 0) return [];

    const materialCostMap: { [key: string]: number } = {};
    
    purchases.forEach(purchase => {
        const cost = purchase.price * purchase.quantity;
        materialCostMap[purchase.item] = (materialCostMap[purchase.item] || 0) + cost;
    });

    const distribution: DashboardMetrics['materialCostDistribution'] = Object.keys(materialCostMap).map(name => ({
        materialName: name,
        percentage: (materialCostMap[name] / totalCost) * 100
    }));

    // Opcional: Agrupar os menores em 'Outros' se a lista for muito grande
    return distribution.sort((a, b) => b.percentage - a.percentage);
}


function getBusiestDayOfWeek(sales: Sale[]): DashboardMetrics['busiestDayOfWeek'] {
    if (sales.length === 0) return null;

    const dayCount = new Array(7).fill(0); // Índice 0 = Domingo

    sales.forEach(sale => {
        // Cria um objeto Date, garantindo que ele use a data fornecida (ignora o fuso horário para o dia do mês)
        const saleDate = new Date(sale.date + 'T00:00:00'); 
        const dayIndex = saleDate.getDay();
        dayCount[dayIndex]++;
    });

    let maxCount = -1;
    let busiestIndex = -1;

    dayCount.forEach((count, index) => {
        if (count > maxCount) {
            maxCount = count;
            busiestIndex = index;
        }
    });

    return busiestIndex !== -1 ? DAYS_OF_WEEK[busiestIndex] : null;
}

// --- FUNÇÃO PRINCIPAL DO SERVIÇO ---

/**
 * Serviço para buscar e agregar todas as métricas do Dashboard.
 * @param startDate Data de início do período (formato 'YYYY-MM-DD').
 * @param endDate Data de fim do período (formato 'YYYY-MM-DD').
 */
export async function fetchDashboardMetrics(startDate?: string, endDate?: string): Promise<DashboardMetrics> {
    
    // 1. Busca os dados brutos (poderia ser otimizado com queries baseadas em data no Firestore)
    const allSales = await getSale();
    const allPurchases = await getPurchases();

    // 2. Aplica Filtragem de Data (Simulação, pois os serviços de get não aceitam data)
    const filterDate = (dateStr: string, start?: string, end?: string) => {
        if (!start && !end) return true;
        
        const saleDate = new Date(dateStr + 'T00:00:00');
        let dateMatch = true;

        if (start) {
            const startBoundary = new Date(start + 'T00:00:00');
            if (saleDate < startBoundary) dateMatch = false;
        }

        if (dateMatch && end) {
            const endBoundary = new Date(end + 'T23:59:59');
            if (saleDate > endBoundary) dateMatch = false;
        }
        return dateMatch;
    };
    
    const filteredSales = allSales.filter(sale => filterDate(getFormattedDate(sale.date), startDate, endDate));
    const filteredPurchases = allPurchases.filter(purchase => filterDate(getFormattedDate(purchase.date), startDate, endDate));


    // 3. Cálculos Financeiros e de Agregação
    const { totalRevenue, totalPurchaseCost, grossProfit } = calculateProfitAndCost(filteredSales, filteredPurchases);

    const totalSalesCount = filteredSales.length;
    const averageSaleValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
    
    const topSellingProduct = getTopSellingProduct(filteredSales);
    const topCategory = getTopCategory(filteredSales);

    const topPurchasedMaterial = getTopPurchasedMaterial(filteredPurchases);
    
    const materialCostDistribution = getMaterialCostDistribution(filteredPurchases);
    
    const busiestDayOfWeek = getBusiestDayOfWeek(filteredSales);
    
    // 4. Cálculo de Crescimento (MUITO SIMPLIFICADO, pois requer dados do período anterior)
    // Em um cenário real, você faria uma segunda chamada para o período anterior.
    const revenueGrowthPercentage = 0; // Placeholder

    // 5. Retorna a Estrutura Final
    const metrics: DashboardMetrics = {
        totalRevenue,
        totalPurchaseCost,
        grossProfit,
        totalSalesCount,
        averageSaleValue: parseFloat(averageSaleValue.toFixed(2)),
        topSellingProduct,
        topCategory,
        topPurchasedMaterial,
        materialCostDistribution,
        revenueGrowthPercentage,
        busiestDayOfWeek,
    };

    return metrics;
}


export async function getDashboardChartData(): Promise<any> {
  const sales = await getSale();

  const categoryMap: Record<string, number> = {};
  sales.forEach((sale) => {
    const value = sale.price * sale.quantity;
    categoryMap[sale.category] = (categoryMap[sale.category] || 0) + value;
  });

  const categoryChart: any[] = Object.entries(categoryMap).map(
    ([category, total]) => ({
      category,
      total: parseFloat(total.toFixed(2))
    })
  );

  const monthlyMap: Record<string, number> = {};
  sales.forEach((sale) => {
    const date = new Date(sale.date);
    const monthYear = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
    const value = sale.price * sale.quantity;
    monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + value;
  });

  const monthlyChart: any[] = Object.entries(monthlyMap)
    .map(([month, total]) => ({
      month,
      total: parseFloat(total.toFixed(2)),
    }))
    .sort((a, b) => {
      const [ma, ya] = a.month.split("/").map(Number);
      const [mb, yb] = b.month.split("/").map(Number);
      return ya - yb || ma - mb;
    });

  return { categoryChart, monthlyChart };
}
