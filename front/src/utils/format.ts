import { Campanha } from '@/@types/campanha';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaSemCentavos = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
});
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
    'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** R$ 4.600,00 */
export function formatarMoeda(valor: number): string {
    return moeda.format(valor ?? 0).replace(/ /g, ' ');
}

/** R$ 4.600 (sem centavos quando o valor é inteiro) */
export function formatarMoedaCurta(valor: number): string {
    const v = valor ?? 0;
    const fmt = Number.isInteger(v) ? moedaSemCentavos : moeda;
    return fmt.format(v).replace(/ /g, ' ');
}

/** 4.600,00 (sem o R$) */
export function formatarNumero(valor: number): string {
    return (valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Aceita "50", "50,5", "1.234,56" ou "1234.56" */
export function parseValor(texto: string): number {
    if (!texto) return 0;
    let limpo = texto.replace(/[^\d.,]/g, '');
    if (limpo.includes(',')) {
        limpo = limpo.replace(/\./g, '').replace(',', '.');
    }
    const n = parseFloat(limpo);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/** Máscara de moeda digitada da direita para a esquerda: "385000" -> "3.850,00" */
export function mascaraMoeda(texto: string): string {
    const digitos = texto.replace(/\D/g, '').slice(0, 12);
    const centavos = parseInt(digitos || '0', 10);
    return formatarNumero(centavos / 100);
}

export function percentual(arrecadado: number, meta: number): number {
    if (!meta || meta <= 0) return 0;
    return Math.floor((arrecadado / meta) * 100);
}

function inicioDoDia(data: Date): number {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

/** Converte "yyyy-MM-dd" em Date local (sem problema de fuso). */
export function isoParaData(iso: string): Date {
    const [a, m, d] = iso.substring(0, 10).split('-').map(Number);
    return new Date(a, (m ?? 1) - 1, d ?? 1);
}

/** Dias até a data limite (0 = hoje, negativo = já passou). */
export function diasRestantes(dataLimite: string): number {
    const alvo = inicioDoDia(isoParaData(dataLimite));
    const hoje = inicioDoDia(new Date());
    return Math.round((alvo - hoje) / 86_400_000);
}

export function textoPrazo(dataLimite: string): string {
    const dias = diasRestantes(dataLimite);
    if (dias < 0) return 'Prazo encerrado';
    if (dias === 0) return 'Último dia';
    if (dias === 1) return 'Falta 1 dia';
    return `Faltam ${dias} dias`;
}

/** 18 de maio de 2025 */
export function formatarDataLonga(iso: string): string {
    const d = iso.length <= 10 ? isoParaData(iso) : new Date(iso);
    return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** 14:05:32 */
export function formatarHora(iso: string): string {
    const d = new Date(iso);
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
}

/** há 12 minutos */
export function tempoRelativo(iso: string): string {
    const seg = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (seg < 60) return 'agora mesmo';
    const min = Math.floor(seg / 60);
    if (min < 60) return `há ${min} ${min === 1 ? 'minuto' : 'minutos'}`;
    const h = Math.floor(min / 60);
    if (h < 24) return `há ${h} ${h === 1 ? 'hora' : 'horas'}`;
    const dias = Math.floor(h / 24);
    return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

/** "25/12/2026" -> "2026-12-25" (ou null se inválida) */
export function dataBrParaIso(br: string): string | null {
    const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [, d, mes, a] = m;
    const data = new Date(Number(a), Number(mes) - 1, Number(d));
    if (data.getDate() !== Number(d) || data.getMonth() !== Number(mes) - 1) return null;
    return `${a}-${mes}-${d}`;
}

/** "2026-12-25" -> "25/12/2026" */
export function isoParaDataBr(iso: string): string {
    const [a, m, d] = iso.substring(0, 10).split('-');
    return `${d}/${m}/${a}`;
}

/** Máscara dd/mm/aaaa enquanto o usuário digita */
export function mascaraData(texto: string): string {
    const n = texto.replace(/\D/g, '').slice(0, 8);
    if (n.length <= 2) return n;
    if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
    return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

export function valorRestante(c: Campanha): number {
    return Math.max(0, Math.round((c.meta - c.valorArrecadado) * 100) / 100);
}

/** A campanha aceita doações? */
export function podeDoar(c: Campanha): boolean {
    return c.status === 'ABERTA' && diasRestantes(c.dataLimite) >= 0 && valorRestante(c) > 0;
}

export function codigoCampanha(id: string): string {
    return `#${id.replace(/-/g, '').substring(0, 6).toUpperCase()}`;
}
