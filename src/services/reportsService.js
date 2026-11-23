import { listSalesSince } from './salesService';
import { daysAgo, dayKey, formatDayMonth } from '../utils/format';

export const PERIODS = {
  dia: { label: 'Hoje', days: 0 },
  semana: { label: '7 dias', days: 6 },
  mes: { label: '30 dias', days: 29 },
};

export async function buildReport(periodKey) {
  const { days } = PERIODS[periodKey];
  const since = daysAgo(days);
  const sales = await listSalesSince(since);

  const faturamento = sales.reduce((s, v) => s + Number(v.total), 0);
  const qtdVendas = sales.length;
  const ticketMedio = qtdVendas ? faturamento / qtdVendas : 0;

  // Produtos mais vendidos
  const porProduto = {};
  sales.forEach((v) =>
    v.itens_venda.forEach((i) => {
      const cur = porProduto[i.nome_produto] || { nome: i.nome_produto, quantidade: 0, valor: 0 };
      cur.quantidade += i.quantidade;
      cur.valor += i.quantidade * Number(i.preco_unitario);
      porProduto[i.nome_produto] = cur;
    })
  );
  const maisVendidos = Object.values(porProduto)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  // Faturamento por dia (inclui dias sem venda)
  const mapa = {};
  for (let i = days; i >= 0; i--) {
    const d = daysAgo(i);
    mapa[dayKey(d.toISOString())] = { label: formatDayMonth(d.toISOString()), total: 0 };
  }
  sales.forEach((v) => {
    const k = dayKey(v.created_at);
    if (mapa[k]) mapa[k].total += Number(v.total);
  });
  const porDia = Object.values(mapa);

  return { faturamento, qtdVendas, ticketMedio, maisVendidos, porDia };
}
