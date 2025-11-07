export function getFormattedDate(dateObject: Date) {
  // O PROBLEMA COMUM é que new Date("AAAA-MM-DD") é interpretado como UTC meia-noite.
  // Se o fuso horário local estiver atrás do UTC (como no Brasil), o dia "volta" um dia.
  // A solução correta é usar os métodos UTC (getUTC...) para extrair o dia, mês e ano,
  // garantindo que eles correspondam à data da string "AAAA-MM-DD" original.

  // 1. Obtém o dia (1-31) usando o método UTC
  const day = dateObject.getUTCDate();
  
  // 2. Obtém o mês (0-11) usando o método UTC. É preciso adicionar 1.
  const month = dateObject.getUTCMonth() + 1;
  
  // 3. Obtém o ano (AAAA) usando o método UTC
  const year = dateObject.getUTCFullYear();

  // Adiciona zero à esquerda se o dia for menor que 10
  const formattedDay = String(day).padStart(2, '0');
  
  // Adiciona zero à esquerda se o mês for menor que 10
  const formattedMonth = String(month).padStart(2, '0');

  // Retorna a string final no formato DD/MM/AAAA
  return `${formattedDay}/${formattedMonth}/${year}`;
}
export function getFormattedUSADate(dateObject: Date) {
  const year = dateObject.getUTCFullYear();
  const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObject.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // <-- formato aceito por <input type="date">
}