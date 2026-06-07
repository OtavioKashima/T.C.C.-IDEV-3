// =============================================================
// services/priorityService.js
// =============================================================

const PALAVRAS_URGENCIA_DENUNCIA = [
  'sangue', 'sangrando', 'ferido', 'ferida', 'machucado', 'machucada',
  'inconsciente', 'desacordado', 'desacordada', 'agonizando', 'agonizante',
  'morrendo', 'morrer', 'morte', 'morto', 'morta', 'quase morrendo',
  'fratura', 'fraturado', 'fraturada', 'osso quebrado', 'atropelado', 'atropelada',
  'envenenado', 'envenenada', 'veneno', 'intoxicado', 'intoxicada',
  'queimado', 'queimada', 'queimadura', 'tiro', 'baleado', 'baleada',
  'facada', 'espancado', 'espancada', 'surra',
  'maus tratos', 'maus-tratos', 'maustratos',
  'abuso', 'abusado', 'abusada',
  'tortura', 'torturado', 'torturada',
  'chute', 'chutado', 'chutada',
  'agredido', 'agredida', 'agressão', 'agressao',
  'espancamento', 'violência', 'violencia',
  'negligencia', 'negligência', 'negligenciado', 'negligenciada',
  'fome', 'desnutrido', 'desnutrida', 'esquelético', 'esqueletico',
  'esquelética', 'esqueletica', 'sem alimentação', 'sem alimentacao',
  'sem água', 'sem agua', 'sem comida', 'dias sem',
  'preso', 'presa', 'armadilha', 'laço', 'laco', 'arame', 'corrente apertada',
  'acorrentado', 'acorrentada', 'preso em corrente',
  'abandonado na rua', 'abandonada na rua',
  'lixo', 'buraco', 'bueiro', 'dentro de carro', 'trancado', 'trancada',
  'incêndio', 'incendio', 'fogo', 'afogando',
  'urgente', 'urgência', 'urgencia', 'socorro', 'ajuda agora',
  'imediato', 'imediata', 'por favor ajuda', 'precisa de ajuda',
  'critico', 'crítico', 'grave', 'sério', 'serio',
];

const PALAVRAS_URGENCIA_COMUNICADO = [
  // animal desaparecido
  'desaparecido', 'desaparecida', 'desapareceu',
  'perdido', 'perdida', 'sumiu', 'fugiu',
  'procura-se', 'procurando animal',

  // risco de vida
  'risco de vida', 'risco de morte',
  'socorro', 'ajuda urgente',
  'resgate urgente', 'resgate imediato',
  'adoção urgente', 'adocao urgente',

  // superlotação
  'superlotado', 'superlotação', 'superlotacao',
  'lotação máxima', 'lotacao maxima',
  'sem espaço', 'sem espaco', 'sem vaga',

  // saúde crítica
  'cirurgia urgente', 'cirurgia emergência', 'cirurgia emergencia',
  'vaquinha urgente', 'ajuda financeira urgente',
  'internado em estado grave', 'estado crítico', 'estado critico',

  // ── ADICIONADO: mesmas palavras de urgência das denúncias ──
  'urgente', 'urgência', 'urgencia',
  'maus tratos', 'maus-tratos', 'maustratos',
  'abuso', 'abusado', 'abusada',
  'tortura', 'torturado', 'torturada',
  'agredido', 'agredida', 'agressão', 'agressao',
  'espancamento', 'violência', 'violencia',
  'negligencia', 'negligência',
  'fome', 'desnutrido', 'desnutrida',
  'envenenado', 'envenenada', 'veneno',
  'atropelado', 'atropelada',
  'morrendo', 'morrer', 'morte',
  'ferido', 'ferida', 'machucado', 'machucada',
  'sangue', 'sangrando',
  'critico', 'crítico', 'grave',
  'abandonado', 'abandonada',
  'acorrentado', 'acorrentada',
  'incêndio', 'incendio', 'fogo',
];

const LIMITE_DOACAO_RELEVANTE  = 500;
const IDADE_ANIMAL_PRIORITARIO = 7;

// =============================================================
// 1. DENÚNCIAS
// =============================================================
function calcularPrioridadeDenuncia({ titulo = '', descricao = '' }) {
  const texto = `${titulo} ${descricao}`.toLowerCase();
  const motivos = [];
  let score = 0;

  for (const palavra of PALAVRAS_URGENCIA_DENUNCIA) {
    if (texto.includes(palavra)) {
      score++;
      motivos.push(palavra);
    }
  }

  let prioridade;
  if      (score >= 3) prioridade = 'urgente';
  else if (score >= 1) prioridade = 'alta';
  else                 prioridade = 'normal';

  return { prioridade, score, motivos };
}

// =============================================================
// 2. COMUNICADOS
// =============================================================
function calcularPrioridadeComunicado({ titulo = '', descricao = '' }) {
  const texto = `${titulo} ${descricao}`.toLowerCase();
  const motivos = [];
  let score = 0;

  for (const palavra of PALAVRAS_URGENCIA_COMUNICADO) {
    if (texto.includes(palavra)) {
      score++;
      motivos.push(palavra);
    }
  }

  let prioridade;
  if      (score >= 3) prioridade = 'urgente';
  else if (score >= 1) prioridade = 'alta';
  else                 prioridade = 'normal';

  return { prioridade, score, motivos };
}

// =============================================================
// 3. ADOÇÃO
// =============================================================
function calcularPrioridadeAdocao({ idade }) {
  const idadeNum = parseInt(idade);

  if (!isNaN(idadeNum) && idadeNum >= IDADE_ANIMAL_PRIORITARIO) {
    return {
      prioridade: 'prioritario',
      motivo: `Animal idoso (${idadeNum} anos) — prioridade na adoção`,
    };
  }

  return { prioridade: 'normal', motivo: null };
}

// =============================================================
// 4. DOAÇÃO
// =============================================================
function verificarDoacaoRelevante({ valor }) {
  const valorNum = parseFloat(String(valor).replace(',', '.'));

  if (isNaN(valorNum)) {
    return { relevante: false, valor: null, limite: LIMITE_DOACAO_RELEVANTE };
  }

  return {
    relevante: valorNum >= LIMITE_DOACAO_RELEVANTE,
    valor: valorNum,
    limite: LIMITE_DOACAO_RELEVANTE,
  };
}

module.exports = {
  calcularPrioridadeDenuncia,
  calcularPrioridadeComunicado,
  calcularPrioridadeAdocao,
  verificarDoacaoRelevante,
  LIMITE_DOACAO_RELEVANTE,
  IDADE_ANIMAL_PRIORITARIO,
};