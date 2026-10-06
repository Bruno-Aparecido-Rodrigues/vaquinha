import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL_DOACAO = __ENV.BASE_URL_DOACAO || 'http://localhost:8083';
const BASE_URL_CAMPANHA = __ENV.BASE_URL_CAMPANHA || 'http://localhost:8082';
const CAMPANHA_ID = __ENV.CAMPANHA_ID;
const VALOR = Number(__ENV.VALOR || 10);
const QTD_REQUISICOES = Number(__ENV.QTD_REQUISICOES || 30);

const POLL_TENTATIVAS = Number(__ENV.POLL_TENTATIVAS || 20);
const POLL_INTERVALO = Number(__ENV.POLL_INTERVALO || 0.5);

const concluidas = new Counter('doacoes_concluidas');
const recusadas = new Counter('doacoes_recusadas');
const conflitoEsgotado = new Counter('doacoes_conflito_esgotado');
const erroInesperado = new Counter('erro_inesperado');

export const options = {
    scenarios: {
        doacao_simultanea: {
            executor: 'shared-iterations',
            vus: QTD_REQUISICOES,
            iterations: QTD_REQUISICOES,
            maxDuration: '60s',
        },
    },
};

// Direto nos serviços (como no exemplo do professor): os headers X-User-* fazem o papel do Gateway.
const PARAMS_CAMPANHA = { headers: { 'X-User-Id': 'k6', 'X-User-Nome': 'k6' } };

function buscarCampanha() {
    const res = http.get(`${BASE_URL_CAMPANHA}/campanha/${CAMPANHA_ID}`, PARAMS_CAMPANHA);
    if (res.status !== 200) {
        throw new Error(`Não foi possível buscar a vaquinha ${CAMPANHA_ID} (status ${res.status}).`);
    }
    return JSON.parse(res.body);
}

function somaDoacoes() {
    const res = http.get(`${BASE_URL_DOACAO}/doacao/campanha/${CAMPANHA_ID}`);
    if (res.status !== 200) return null;
    return JSON.parse(res.body).reduce((soma, d) => soma + Number(d.valor), 0);
}

const reais = (v) => `R$ ${Number(v).toFixed(2)}`;

// Roda UMA vez, antes de todos: lê a meta e quanto já foi arrecadado.
export function setup() {
    if (!CAMPANHA_ID) {
        throw new Error('Informe a vaquinha: k6 run -e CAMPANHA_ID=<id> testes/teste-carga.js');
    }

    const campanha = buscarCampanha();
    const meta = Number(campanha.meta);
    const inicial = Number(campanha.valorArrecadado);
    const restante = Math.max(meta - inicial, 0);
    const esperadas = Math.min(QTD_REQUISICOES, Math.floor((restante + 1e-9) / VALOR));

    console.log('====================================');
    console.log(`Vaquinha:            ${campanha.titulo}`);
    console.log(`Meta:                ${reais(meta)}`);
    console.log(`Já arrecadado:       ${reais(inicial)}`);
    console.log(`Doações disparadas:  ${QTD_REQUISICOES} de ${reais(VALOR)} ao mesmo tempo`);
    console.log(`Esperado:            ${esperadas} concluídas e ${QTD_REQUISICOES - esperadas} recusadas`);
    console.log('====================================');

    return { meta, inicial, esperadas };
}

// Cada VU faz UMA doação; todas saem praticamente juntas.
export default function () {
    const payload = JSON.stringify({ campanhaId: CAMPANHA_ID, valor: VALOR });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': `k6-user-${__VU}`,
            'X-User-Nome': `k6-user-${__VU}`,
        },
        // 409 e 422 são respostas de negócio (recusa), não falhas do servidor
        responseCallback: http.expectedStatuses(201, 409, 422),
    };

    const res = http.post(`${BASE_URL_DOACAO}/doacao`, payload, params);

    check(res, {
        'doação respondida (201, 409 ou 422)': (r) => r.status === 201 || r.status === 409 || r.status === 422,
    });

    let corpo = {};
    try {
        corpo = JSON.parse(res.body);
    } catch (e) {
    }

    if (res.status === 201) {
        concluidas.add(1);
    } else if ((res.status === 409 || res.status === 422) && corpo.motivo) {
        recusadas.add(1); // META_ATINGIDA, VALOR_EXCEDE_META...
    } else if (res.status === 409) {
        conflitoEsgotado.add(1); // perdeu a disputa 5 vezes seguidas
    } else {
        erroInesperado.add(1);
    }
}

// Roda UMA vez, depois de todos: confere o resultado.
export function teardown(data) {
    const totalDoacao = somaDoacoes();

    // Fluxo assíncrono: a Campanha soma as doações quando consome "doacao.realizada".
    // Consulta algumas vezes até ela alcançar o total da Doação.
    let totalCampanha = null;
    for (let i = 0; i < POLL_TENTATIVAS; i++) {
        totalCampanha = Number(buscarCampanha().valorArrecadado);
        if (totalDoacao !== null && Math.abs(totalCampanha - totalDoacao) < 0.001) break;
        sleep(POLL_INTERVALO);
    }

    const esperado = data.inicial + data.esperadas * VALOR;

    console.log('====================================');
    console.log(`Meta:                          ${reais(data.meta)}`);
    console.log(`Total esperado:                ${reais(esperado)}`);
    console.log(`Total gravado pela Doação:     ${totalDoacao === null ? '?' : reais(totalDoacao)}`);
    console.log(`Total recebido pela Campanha:  ${reais(totalCampanha)}`);
    console.log('====================================');
    console.log('Confira nas métricas finais do k6:');
    console.log(`  doacoes_concluidas        → deve ser ${data.esperadas}`);
    console.log(`  doacoes_recusadas         → deve ser ${QTD_REQUISICOES - data.esperadas}`);
    console.log('  doacoes_conflito_esgotado → deve ser 0 (se não for, aumente MAX_TENTATIVAS no DoacaoService)');
    console.log('  erro_inesperado           → deve ser 0');
    console.log('E no painel do admin (Atualizar): várias doações com mais de 1 tentativa.');
    console.log('====================================');

    if (totalCampanha > data.meta + 0.001 || (totalDoacao !== null && totalDoacao > data.meta + 0.001)) {
        console.error('FALHA: a meta foi ULTRAPASSADA — a concorrência não está protegida.');
    } else if (totalDoacao !== null && Math.abs(totalDoacao - totalCampanha) >= 0.001) {
        console.error('ATENÇÃO: a Campanha ainda não recebeu todas as doações. Aumente POLL_TENTATIVAS ou confira a fila campanha.doacao-realizada.');
    } else if (totalDoacao !== null && Math.abs(totalDoacao - esperado) >= 0.001) {
        console.error(`ATENÇÃO: total (${reais(totalDoacao)}) diferente do esperado (${reais(esperado)}). Veja doacoes_conflito_esgotado.`);
    } else {
        console.log('Total final bateu com o esperado, a meta não foi ultrapassada e a Campanha está sincronizada.');
    }
}
