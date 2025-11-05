export function getFormattedDate() {
    // 1. Obtém o dia (1-31)
    const dateObject = new Date();
    const day = dateObject.getDate();
    
    // 2. Obtém o mês (0-11). É preciso adicionar 1.
    const month = dateObject.getMonth() + 1;
    
    // 3. Obtém o ano (AAAA)
    const year = dateObject.getFullYear();

    // Adiciona zero à esquerda se o dia for menor que 10
    const formattedDay = String(day).padStart(2, '0');
    
    // Adiciona zero à esquerda se o mês for menor que 10
    const formattedMonth = String(month).padStart(2, '0');

    // Retorna a string final no formato DD/MM/AAAA
    return `${formattedDay}/${formattedMonth}/${year}`;
}