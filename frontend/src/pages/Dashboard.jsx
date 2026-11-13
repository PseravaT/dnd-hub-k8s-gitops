import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import dndService from '../api/dndService';
import authService from '../api/authService';
import CreateCharacterForm from '../components/CreateCharacterForm';
import CharacterDetailModal from '../components/CharacterDetailModal';
import RevealGroup from '../components/ui/Reveal';
import { animateDiceNodes } from '../lib/motion';

const CLASSES_MARCIAIS = new Set([
  'Bárbaro',
  'Guerreiro',
  'Ladino',
  'Monge',
  'Paladino',
  'Patrulheiro / Guardião',
]);

const DEMO_COMPANHIA = [
  {
    id: 'demo-thorgar',
    nome: 'Thorgar Escudo de Ferro',
    raca: 'Anão',
    classe: 'Guerreiro',
    subclasse: 'Mestre de Batalha',
    nivel: 5,
    hp: 52,
    classeArmadura: 18,
    forca: 18,
    destreza: 12,
    constituicao: 16,
    inteligencia: 10,
    sabedoria: 13,
    carisma: 9,
    pericias: ['Atletismo', 'Intimidação', 'Percepção'],
    magias: 'Manobras: Ataque de Precisão, Derrubar, Aparar.',
  },
  {
    id: 'demo-lyra',
    nome: 'Lyra Vento Lunar',
    raca: 'Elfo',
    classe: 'Mago',
    subclasse: 'Ordem dos Escribas',
    nivel: 5,
    hp: 30,
    classeArmadura: 15,
    forca: 8,
    destreza: 16,
    constituicao: 13,
    inteligencia: 18,
    sabedoria: 14,
    carisma: 11,
    pericias: ['Arcanismo', 'História', 'Investigação', 'Percepção'],
    magias: 'Bola de Fogo, Mísseis Mágicos, Escudo Arcano, Passo Nebuloso, Detectar Magia.',
  },
  {
    id: 'demo-vaelen',
    nome: 'Vaelen Passos de Cinza',
    raca: 'Tiefling',
    classe: 'Ladino',
    subclasse: 'Assassino',
    nivel: 4,
    hp: 31,
    classeArmadura: 16,
    forca: 10,
    destreza: 18,
    constituicao: 12,
    inteligencia: 14,
    sabedoria: 12,
    carisma: 15,
    pericias: ['Acrobacia', 'Furtividade', 'Prestidigitação', 'Enganação'],
    magias: 'Taumaturgia (racial), Repreensão Infernal, Kit de Venenos.',
  },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [personagens, setPersonagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');
  const [selectedPersonagem, setSelectedPersonagem] = useState(null);

  // Filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [archetypeFilter, setArchetypeFilter] = useState('all'); // 'all' | 'martial' | 'caster'
  const [sortBy, setSortBy] = useState('nivel'); // 'nivel' | 'hp' | 'ca' | 'nome'

  // Integração com os microsserviços do PRD
  const [jwtStatus, setJwtStatus] = useState(null);
  const [oracleRolls, setOracleRolls] = useState(null);
  const [rollingOracle, setRollingOracle] = useState(false);
  const [cardRolls, setCardRolls] = useState({});
  const oracleRefs = useRef([]);

  const carregarPersonagens = async () => {
    setLoading(true);
    setErrorBanner('');
    try {
      const lista = await dndService.listarPersonagens();
      setPersonagens(lista);
    } catch (err) {
      setErrorBanner(err.message || 'Não foi possível consultar as fichas no servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPersonagens();
  }, []);

  const handleCharacterCreated = (novoPersonagem) => {
    setPersonagens((prev) => [novoPersonagem, ...prev.filter((p) => p.id !== novoPersonagem.id)]);
    setActiveTab('list');
  };

  const handleCheckJwt = async () => {
    setJwtStatus({ state: 'loading', text: 'Validando passe JWT em :8080...' });
    try {
      const msg = await authService.testarAutenticacao();
      setJwtStatus({ state: 'ok', text: msg });
    } catch (err) {
      setJwtStatus({ state: 'error', text: err.message });
    }
  };

  const handleRollOracle = async () => {
    setRollingOracle(true);
    try {
      const rolls = await dndService.rolarAtributos();
      setOracleRolls(rolls);
      requestAnimationFrame(() => {
        animateDiceNodes(oracleRefs.current.filter(Boolean));
      });
    } finally {
      setRollingOracle(false);
    }
  };

  const handleQuickInitiative = (e, personagem) => {
    e.stopPropagation();
    const desMod = Math.floor(((Number(personagem.destreza) || 10) - 10) / 2);
    const d20 = Math.floor(Math.random() * 20) + 1;
    setCardRolls((prev) => ({
      ...prev,
      [personagem.id]: { d20, mod: desMod, total: d20 + desMod },
    }));
  };

  const handleLoadDemoParty = () => {
    setPersonagens(DEMO_COMPANHIA);
    setSearchTerm('');
    setArchetypeFilter('all');
  };

  const calcModifier = (score) => {
    const mod = Math.floor(((Number(score) || 10) - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Métricas da campanha calculadas
  const metrics = useMemo(() => {
    if (personagens.length === 0) {
      return { total: 0, avgLevel: '—', topHp: null, topCa: null };
    }
    const sumLevel = personagens.reduce((acc, p) => acc + (Number(p.nivel) || 1), 0);
    const topHp = personagens.reduce((max, p) =>
      (Number(p.hp) || 0) > (Number(max.hp) || 0) ? p : max
    );
    const topCa = personagens.reduce((max, p) =>
      (Number(p.classeArmadura) || 0) > (Number(max.classeArmadura) || 0) ? p : max
    );
    return {
      total: personagens.length,
      avgLevel: (sumLevel / personagens.length).toFixed(1),
      topHp,
      topCa,
    };
  }, [personagens]);

  // Lista filtrada e ordenada
  const filteredPersonagens = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return personagens
      .filter((p) => {
        const matchesSearch =
          !term ||
          p.nome?.toLowerCase().includes(term) ||
          p.raca?.toLowerCase().includes(term) ||
          p.classe?.toLowerCase().includes(term) ||
          p.subclasse?.toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (archetypeFilter === 'martial') return CLASSES_MARCIAIS.has(p.classe);
        if (archetypeFilter === 'caster') return !CLASSES_MARCIAIS.has(p.classe);
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'hp') return (Number(b.hp) || 0) - (Number(a.hp) || 0);
        if (sortBy === 'ca') return (Number(b.classeArmadura) || 0) - (Number(a.classeArmadura) || 0);
        if (sortBy === 'nome') return (a.nome || '').localeCompare(b.nome || '');
        return (Number(b.nivel) || 0) - (Number(a.nivel) || 0);
      });
  }, [personagens, searchTerm, archetypeFilter, sortBy]);

  return (
    <div className="container py-4">
      <RevealGroup triggerKey={activeTab}>
        {/* Cabeçalho Command Center da Taverna */}
        <div data-reveal className="card rpg-card p-3 p-md-4 mb-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-warning bg-opacity-25 text-gold border border-warning font-rpg">
                  <i className="bi bi-shield-shaded me-1" aria-hidden="true"></i> Command Center D&D 5e/5.5e
                </span>
                <span className="rpg-service-badge">
                  <span className="rounded-circle bg-success d-inline-block" style={{ width: '7px', height: '7px' }}></span>
                  dndmanager :8080
                </span>
                <span className="rpg-service-badge">
                  <span className="rounded-circle bg-info d-inline-block" style={{ width: '7px', height: '7px' }}></span>
                  APIdados :8081
                </span>
              </div>

              <h1 className="h3 font-rpg text-gold mb-1">
                Saudações, {user?.nome || user?.email?.split('@')[0] || 'Aventureiro'}!
              </h1>
              <p className="text-muted small mb-0 font-rpg">
                Gerencie sua companhia, teste perícias em tempo real e forje fichas conectadas aos microsserviços.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn ${activeTab === 'list' ? 'btn-dnd-gold' : 'btn-dnd-outline'}`}
                onClick={() => setActiveTab('list')}
              >
                <i className="bi bi-person-lines-fill me-1" aria-hidden="true"></i> Meus Personagens ({personagens.length})
              </button>

              <button
                type="button"
                className={`btn ${activeTab === 'create' ? 'btn-dnd-crimson' : 'btn-dnd-outline'}`}
                onClick={() => setActiveTab('create')}
              >
                <i className="bi bi-plus-circle-fill me-1" aria-hidden="true"></i> Forjar Herói
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo da Aba Ativa */}
        {activeTab === 'create' ? (
          <div data-reveal>
            <CreateCharacterForm
              onSuccess={handleCharacterCreated}
              onCancel={() => setActiveTab('list')}
            />
          </div>
        ) : (
          <>
            {/* Painel de Métricas da Campanha + Oráculo APIdados */}
            <div className="row g-3 mb-4">
              <div data-reveal className="col-6 col-lg-3">
                <div className="rpg-stat-pill">
                  <span className="text-muted font-rpg small d-block mb-1">
                    <i className="bi bi-people-fill text-gold me-1" aria-hidden="true"></i> HEROIS NA TAVERNA
                  </span>
                  <div className="h3 font-rpg text-gold fw-bold mb-0">{metrics.total}</div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Fichas sincronizadas
                  </small>
                </div>
              </div>

              <div data-reveal className="col-6 col-lg-3">
                <div className="rpg-stat-pill">
                  <span className="text-muted font-rpg small d-block mb-1">
                    <i className="bi bi-stars text-info me-1" aria-hidden="true"></i> NÍVEL MÉDIO
                  </span>
                  <div className="h3 font-rpg text-info fw-bold mb-0">{metrics.avgLevel}</div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Escala oficial 1–20
                  </small>
                </div>
              </div>

              <div data-reveal className="col-6 col-lg-3">
                <div className="rpg-stat-pill">
                  <span className="text-muted font-rpg small d-block mb-1">
                    <i className="bi bi-heart-pulse-fill text-danger me-1" aria-hidden="true"></i> MAIOR VITALIDADE
                  </span>
                  <div className="h4 font-rpg text-danger fw-bold mb-0">
                    {metrics.topHp ? `${metrics.topHp.hp} HP` : '—'}
                  </div>
                  <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>
                    {metrics.topHp ? metrics.topHp.nome : 'Sem fichas ainda'}
                  </small>
                </div>
              </div>

              <div data-reveal className="col-6 col-lg-3">
                <div className="rpg-stat-pill">
                  <span className="text-muted font-rpg small d-block mb-1">
                    <i className="bi bi-shield-fill-check text-gold me-1" aria-hidden="true"></i> MAIOR DEFESA (CA)
                  </span>
                  <div className="h4 font-rpg text-gold fw-bold mb-0">
                    {metrics.topCa ? `${metrics.topCa.classeArmadura} CA` : '—'}
                  </div>
                  <small className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>
                    {metrics.topCa ? metrics.topCa.nome : 'Sem fichas ainda'}
                  </small>
                </div>
              </div>
            </div>

            {/* Painel Interativo dos Microsserviços (PRD) */}
            <div data-reveal className="card rpg-card p-3 mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-dnd-outline px-3"
                    onClick={handleCheckJwt}
                  >
                    <i className="bi bi-key-fill me-1" aria-hidden="true"></i> Validar Sessão JWT (:8080)
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-dnd-gold px-3"
                    onClick={handleRollOracle}
                    disabled={rollingOracle}
                  >
                    {rollingOracle ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Rolando 4d6...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-dice-5-fill me-1" aria-hidden="true"></i> Oráculo 4d6 (APIdados :8081)
                      </>
                    )}
                  </button>

                  {jwtStatus && (
                    <span
                      className={`small font-rpg px-2 py-1 rounded ${
                        jwtStatus.state === 'ok'
                          ? 'rpg-alert-success'
                          : jwtStatus.state === 'error'
                          ? 'rpg-alert-danger'
                          : 'text-muted'
                      }`}
                    >
                      {jwtStatus.text}
                    </span>
                  )}
                </div>

                {oracleRolls && (
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-muted small font-rpg">4d6 drop lowest:</span>
                    {oracleRolls.map((val, idx) => (
                      <span
                        key={`${val}-${idx}`}
                        ref={(el) => {
                          oracleRefs.current[idx] = el;
                        }}
                        className="badge bg-dark border border-warning text-gold font-monospace fs-6 px-2 py-1"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Barra de Busca, Filtros & Ordenação */}
            {personagens.length > 0 && (
              <div data-reveal className="card rpg-card p-3 mb-4 rpg-form">
                <div className="row g-3 align-items-center">
                  <div className="col-12 col-lg-5">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search" aria-hidden="true"></i>
                      </span>
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Buscar herói, raça, classe ou subclasse..."
                        aria-label="Buscar personagem"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-7 col-lg-4 d-flex flex-wrap gap-2">
                    {[
                      { id: 'all', label: 'Todos', icon: 'bi-grid' },
                      { id: 'martial', label: 'Marciais', icon: 'bi-hammer' },
                      { id: 'caster', label: 'Conjuradores', icon: 'bi-stars' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        className={`rpg-filter-chip ${archetypeFilter === chip.id ? 'active' : ''}`}
                        onClick={() => setArchetypeFilter(chip.id)}
                      >
                        <i className={`bi ${chip.icon}`} aria-hidden="true"></i>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="col-12 col-md-5 col-lg-3">
                    <select
                      className="form-select"
                      aria-label="Ordenar personagens"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="nivel">Ordenar: Maior Nível</option>
                      <option value="hp">Ordenar: Maior HP</option>
                      <option value="ca">Ordenar: Maior Defesa (CA)</option>
                      <option value="nome">Ordenar: Nome (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {errorBanner && (
              <div className="alert rpg-alert-danger mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
                {errorBanner}
              </div>
            )}

            {/* Estado Loading (Skeletons) */}
            {loading ? (
              <div className="row g-4" aria-label="Carregando fichas">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="col-12 col-md-6 col-lg-4">
                    <div className="card rpg-card p-4" style={{ minHeight: '300px' }}>
                      <div className="rpg-skeleton mb-3" style={{ height: '24px', width: '40%' }}></div>
                      <div className="rpg-skeleton mb-4" style={{ height: '32px', width: '75%' }}></div>
                      <div className="row g-2 mb-4">
                        <div className="col-6">
                          <div className="rpg-skeleton" style={{ height: '64px' }}></div>
                        </div>
                        <div className="col-6">
                          <div className="rpg-skeleton" style={{ height: '64px' }}></div>
                        </div>
                      </div>
                      <div className="rpg-skeleton mb-3" style={{ height: '56px' }}></div>
                      <div className="rpg-skeleton mt-auto" style={{ height: '40px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : personagens.length === 0 ? (
              /* Estado Vazio */
              <div data-reveal className="card rpg-card text-center py-5 px-3">
                <div className="card-body">
                  <i className="bi bi-shield-slash text-gold fs-1 mb-3 d-block opacity-75" aria-hidden="true"></i>
                  <h2 className="h4 font-rpg text-gold mb-2">Sua Taverna Ainda Está Vazia</h2>
                  <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                    Nenhuma ficha foi forjada nesta conta ainda. Crie seu primeiro herói conectado ao banco PostgreSQL ou invoque uma companhia de exemplo para explorar os dados e testes D&D 5e.
                  </p>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <button
                      type="button"
                      className="btn btn-dnd-crimson btn-lg px-4"
                      onClick={() => setActiveTab('create')}
                    >
                      <i className="bi bi-magic me-2" aria-hidden="true"></i>Forjar Primeiro Personagem
                    </button>

                    <button
                      type="button"
                      className="btn btn-dnd-outline px-4"
                      onClick={handleLoadDemoParty}
                    >
                      <i className="bi bi-people me-2" aria-hidden="true"></i>Invocar Companhia de Exemplo
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredPersonagens.length === 0 ? (
              /* Filtro sem resultados */
              <div className="card rpg-card text-center py-5 px-3">
                <div className="card-body">
                  <i className="bi bi-search text-gold fs-2 mb-2 d-block" aria-hidden="true"></i>
                  <h3 className="h5 font-rpg text-gold mb-2">Nenhum herói encontrado com esse filtro</h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-dnd-outline px-4"
                    onClick={() => {
                      setSearchTerm('');
                      setArchetypeFilter('all');
                    }}
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            ) : (
              /* Grade Responsiva de Personagens */
              <div className="row g-4">
                {filteredPersonagens.map((p) => {
                  const profBonus = Math.floor(((Number(p.nivel) || 1) - 1) / 4) + 2;
                  const hpPct = Math.min(100, Math.max(18, Math.round(((Number(p.hp) || 10) / 100) * 100)));
                  const quickRoll = cardRolls[p.id];

                  return (
                    <div key={p.id} data-reveal className="col-12 col-md-6 col-lg-4">
                      <div className="card rpg-card rpg-card-interactive h-100 d-flex flex-column">
                        <div className="card-header rpg-card-header d-flex justify-content-between align-items-start gap-2">
                          <div className="min-w-0">
                            <div className="d-flex flex-wrap gap-1 mb-1">
                              <span className="badge bg-warning bg-opacity-10 text-gold border border-warning border-opacity-50 font-rpg">
                                Nível {p.nivel || 1}
                              </span>
                              <span className="badge bg-dark text-info font-monospace">
                                Prof +{profBonus}
                              </span>
                            </div>
                            <h3 className="h5 font-rpg text-gold mb-0 text-truncate">{p.nome}</h3>
                          </div>
                          <span className="badge bg-dark border border-secondary text-light small font-rpg flex-shrink-0">
                            {p.raca}
                          </span>
                        </div>

                        <div className="card-body p-3 d-flex flex-column justify-content-between flex-grow-1">
                          <div>
                            <div className="text-muted small mb-3 font-rpg">
                              <i className="bi bi-award me-1 text-gold" aria-hidden="true"></i>
                              <strong className="text-light">{p.classe}</strong>
                              {p.subclasse && p.subclasse !== 'Nenhuma' && (
                                <span className="text-secondary fw-semibold"> • {p.subclasse}</span>
                              )}
                            </div>

                            {/* Estatísticas Vitais com Barra de HP */}
                            <div className="row g-2 mb-3 text-center">
                              <div className="col-6">
                                <div className="bg-dark p-2 rounded border border-danger border-opacity-25 h-100">
                                  <span className="text-crimson font-rpg small d-block" style={{ fontSize: '0.72rem' }}>
                                    <i className="bi bi-heart-fill me-1" aria-hidden="true"></i> HP MÁX
                                  </span>
                                  <span className="h5 text-danger font-rpg fw-bold mb-0">{p.hp || 10}</span>
                                  <div className="rpg-hp-bar">
                                    <div className="rpg-hp-fill" style={{ width: `${hpPct}%` }}></div>
                                  </div>
                                </div>
                              </div>

                              <div className="col-6">
                                <div className="bg-dark p-2 rounded border border-info border-opacity-25 h-100 d-flex flex-column justify-content-center">
                                  <span className="text-arcane font-rpg small d-block" style={{ fontSize: '0.72rem' }}>
                                    <i className="bi bi-shield-fill me-1" aria-hidden="true"></i> ARMADURA (CA)
                                  </span>
                                  <span className="h5 text-info font-rpg fw-bold mb-0">{p.classeArmadura || 10}</span>
                                </div>
                              </div>
                            </div>

                            {/* Grade Resumida de Atributos */}
                            <div className="bg-dark p-2 rounded border border-warning border-opacity-25 mb-3">
                              <div className="row g-1 text-center" style={{ fontSize: '0.72rem' }}>
                                {[
                                  { label: 'FOR', val: p.forca },
                                  { label: 'DES', val: p.destreza },
                                  { label: 'CON', val: p.constituicao },
                                  { label: 'INT', val: p.inteligencia },
                                  { label: 'SAB', val: p.sabedoria },
                                  { label: 'CAR', val: p.carisma },
                                ].map((atr) => (
                                  <div key={atr.label} className="col-4 col-sm-2">
                                    <span className="text-muted d-block">{atr.label}</span>
                                    <span className="text-gold fw-bold">{atr.val ?? 10}</span>
                                    <span className="text-info d-block" style={{ fontSize: '0.66rem' }}>
                                      ({calcModifier(atr.val)})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Ações Rápidas do Card */}
                          <div className="d-flex flex-column gap-2 mt-1">
                            {quickRoll && (
                              <div className="text-center small font-monospace py-1 px-2 rounded bg-dark border border-warning border-opacity-50 text-gold">
                                Iniciativa: <strong>{quickRoll.total}</strong>{' '}
                                <span className="text-muted">
                                  (d20:{quickRoll.d20} {quickRoll.mod >= 0 ? `+${quickRoll.mod}` : quickRoll.mod})
                                </span>
                              </div>
                            )}

                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-dnd-outline px-3"
                                onClick={(e) => handleQuickInitiative(e, p)}
                                title="Rolar Iniciativa (1d20 + DES)"
                              >
                                <i className="bi bi-dice-20" aria-hidden="true"></i>
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-dnd-gold flex-grow-1"
                                onClick={() => setSelectedPersonagem(p)}
                              >
                                <i className="bi bi-eye me-1" aria-hidden="true"></i> Abrir Grimório
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </RevealGroup>

      {/* Modal de Detalhes da Ficha com Bandeja de Dados */}
      <CharacterDetailModal
        personagem={selectedPersonagem}
        onClose={() => setSelectedPersonagem(null)}
      />
    </div>
  );
};

export default Dashboard;
