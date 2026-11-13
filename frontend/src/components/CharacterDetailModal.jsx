import React, { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, animateDiceNodes, animateCounter, MOTION } from '../lib/motion';

const SKILLS_BY_ATTR = {
  forca: ['Atletismo'],
  destreza: ['Acrobacia', 'Furtividade', 'Prestidigitação'],
  constituicao: [],
  inteligencia: ['Arcanismo', 'História', 'Investigação', 'Natureza', 'Religião'],
  sabedoria: ['Lidar com Animais', 'Intuição', 'Medicina', 'Percepção', 'Sobrevivência'],
  carisma: ['Atuação', 'Enganação', 'Intimidação', 'Persuasão'],
};

export const CharacterDetailModal = ({ personagem, onClose }) => {
  const modalCardRef = useRef(null);
  const diceBadgeRef = useRef(null);
  const totalValueRef = useRef(null);
  const [lastRoll, setLastRoll] = useState(null);

  useEffect(() => {
    setLastRoll(null);
  }, [personagem?.id]);

  useEffect(() => {
    if (!personagem) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [personagem, onClose]);

  useGSAP(
    () => {
      if (!personagem || !modalCardRef.current) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          modalCardRef.current,
          { scale: 0.96, y: 12, autoAlpha: 0 },
          { scale: 1, y: 0, autoAlpha: 1, duration: 0.3, ease: MOTION.easeOut, clearProps: 'transform' }
        );
      });
      return () => mm.revert();
    },
    { scope: modalCardRef, dependencies: [personagem?.id] }
  );

  if (!personagem) return null;

  const profBonus = Math.floor(((Number(personagem.nivel) || 1) - 1) / 4) + 2;

  const getAttrRawMod = (score) => Math.floor(((Number(score) || 10) - 10) / 2);

  const formatMod = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const getSkillBonusNum = (attrScore, skillName) => {
    const rawMod = getAttrRawMod(attrScore);
    const isProf = Array.isArray(personagem.pericias) && personagem.pericias.includes(skillName);
    return isProf ? rawMod + profBonus : rawMod;
  };

  const triggerRoll = (label, bonus) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + bonus;
    setLastRoll({
      label,
      d20,
      bonus,
      total,
      isCritSuccess: d20 === 20,
      isCritFail: d20 === 1,
      timestamp: Date.now(),
    });

    requestAnimationFrame(() => {
      if (diceBadgeRef.current) animateDiceNodes([diceBadgeRef.current]);
      if (totalValueRef.current) animateCounter(totalValueRef.current, total);
    });
  };

  const ATTR_LIST = [
    { key: 'forca', label: 'FORÇA', short: 'FOR', val: personagem.forca, icon: 'bi-lightning-charge' },
    { key: 'destreza', label: 'DESTREZA', short: 'DES', val: personagem.destreza, icon: 'bi-wind' },
    { key: 'constituicao', label: 'CONSTITUIÇÃO', short: 'CON', val: personagem.constituicao, icon: 'bi-heart-pulse' },
    { key: 'inteligencia', label: 'INTELIGÊNCIA', short: 'INT', val: personagem.inteligencia, icon: 'bi-lightbulb' },
    { key: 'sabedoria', label: 'SABEDORIA', short: 'SAB', val: personagem.sabedoria, icon: 'bi-eye' },
    { key: 'carisma', label: 'CARISMA', short: 'CAR', val: personagem.carisma, icon: 'bi-chat-heart' },
  ];

  const trayClass = lastRoll?.isCritSuccess
    ? 'crit-success'
    : lastRoll?.isCritFail
    ? 'crit-fail'
    : '';

  return (
    <div
      className="modal fade show d-block"
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-modal-title"
      tabIndex="-1"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(6px)' }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div
          ref={modalCardRef}
          className="modal-content rpg-card border border-warning border-opacity-50"
        >
          <div className="modal-header rpg-card-header d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex flex-wrap gap-2 mb-1">
                <span className="badge bg-warning bg-opacity-25 text-gold border border-warning font-rpg">
                  Nível {personagem.nivel}
                </span>
                <span className="badge bg-dark border border-secondary text-light font-rpg">
                  Bônus Proficiência: +{profBonus}
                </span>
              </div>
              <h3 id="character-modal-title" className="modal-title h4 font-rpg text-gold mb-0">
                {personagem.nome}
              </h3>
              <small className="text-muted font-rpg">
                {personagem.raca} • {personagem.classe}{' '}
                {personagem.subclasse && personagem.subclasse !== 'Nenhuma'
                  ? `(${personagem.subclasse})`
                  : ''}
              </small>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              style={{ minHeight: '40px' }}
              onClick={onClose}
              aria-label="Fechar ficha"
            >
              <i className="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </div>

          <div className="modal-body p-3 p-md-4">
            {/* Bandeja Interativa de Rolagem (Baldur's Gate 3 / D&D Beyond Inspired) */}
            <div className={`rpg-dice-roller-tray mb-4 ${trayClass}`}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="font-rpg text-gold small fw-bold mb-1">
                    <i className="bi bi-dice-20-fill me-1" aria-hidden="true"></i>
                    BANDEJA DE TESTES (1d20 + MODIFICADOR)
                  </div>
                  <p className="text-muted small mb-0">
                    {lastRoll ? (
                      <>
                        Teste de <strong className="text-gold">{lastRoll.label}</strong>:{' '}
                        <span className="font-monospace">
                          d20({lastRoll.d20}) {lastRoll.bonus >= 0 ? `+ ${lastRoll.bonus}` : `- ${Math.abs(lastRoll.bonus)}`}
                        </span>
                        {lastRoll.isCritSuccess && (
                          <span className="badge bg-warning text-dark ms-2 font-rpg">
                            ACERTO CRÍTICO (20 NATURAL)!
                          </span>
                        )}
                        {lastRoll.isCritFail && (
                          <span className="badge bg-danger text-white ms-2 font-rpg">
                            FALHA CRÍTICA (1 NATURAL)!
                          </span>
                        )}
                      </>
                    ) : (
                      'Clique em qualquer atributo ou perícia abaixo para rolar 1d20 automaticamente.'
                    )}
                  </p>
                </div>

                <div className="d-flex align-items-center gap-3">
                  {lastRoll && (
                    <div
                      ref={diceBadgeRef}
                      className="bg-dark border border-warning border-opacity-75 rounded px-3 py-2 text-center"
                      style={{ minWidth: '92px' }}
                    >
                      <span className="text-muted d-block font-rpg" style={{ fontSize: '0.65rem' }}>
                        TOTAL
                      </span>
                      <span
                        ref={totalValueRef}
                        className={`h3 mb-0 font-rpg fw-bold ${
                          lastRoll.isCritSuccess
                            ? 'text-warning'
                            : lastRoll.isCritFail
                            ? 'text-danger'
                            : 'text-gold'
                        }`}
                      >
                        {lastRoll.total}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-dnd-gold px-3"
                    onClick={() => triggerRoll('Iniciativa', getAttrRawMod(personagem.destreza))}
                  >
                    <i className="bi bi-lightning-fill me-1" aria-hidden="true"></i>
                    Rolar Iniciativa ({formatMod(getAttrRawMod(personagem.destreza))})
                  </button>
                </div>
              </div>
            </div>

            {/* Indicadores Vitais */}
            <div className="row g-3 mb-4 text-center">
              <div className="col-12 col-sm-4">
                <div className="bg-dark p-3 rounded border border-danger border-opacity-50 h-100">
                  <div className="text-crimson font-rpg small">
                    <i className="bi bi-heart-fill me-1" aria-hidden="true"></i> PONTOS DE VIDA
                  </div>
                  <div className="h3 text-danger mb-0 font-rpg fw-bold">{personagem.hp} HP</div>
                </div>
              </div>

              <div className="col-12 col-sm-4">
                <div className="bg-dark p-3 rounded border border-info border-opacity-50 h-100">
                  <div className="text-arcane font-rpg small">
                    <i className="bi bi-shield-fill me-1" aria-hidden="true"></i> CLASSE DE ARMADURA
                  </div>
                  <div className="h3 text-info mb-0 font-rpg fw-bold">{personagem.classeArmadura} CA</div>
                </div>
              </div>

              <div className="col-12 col-sm-4">
                <div className="bg-dark p-3 rounded border border-warning border-opacity-50 h-100">
                  <div className="text-gold font-rpg small">
                    <i className="bi bi-trophy-fill me-1" aria-hidden="true"></i> NÍVEL ATUAL
                  </div>
                  <div className="h3 text-gold mb-0 font-rpg fw-bold">NV {personagem.nivel}</div>
                </div>
              </div>
            </div>

            {/* Atributos & Perícias Clicáveis */}
            <h5 className="font-rpg text-gold mb-3 border-bottom border-warning border-opacity-25 pb-2">
              <i className="bi bi-collection-fill me-2" aria-hidden="true"></i>Atributos & Perícias (Clique para Rolar)
            </h5>

            <div className="row g-3 mb-4">
              {ATTR_LIST.map((atr) => {
                const skills = SKILLS_BY_ATTR[atr.key] || [];
                const rawMod = getAttrRawMod(atr.val);

                return (
                  <div key={atr.key} className="col-12 col-md-6 col-lg-4">
                    <div className="card bg-dark border border-warning border-opacity-40 p-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-warning border-opacity-25">
                        <span className="font-rpg text-gold fw-bold small">
                          <i className={`bi ${atr.icon} me-1`} aria-hidden="true"></i> {atr.label}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-dnd-outline py-0 px-2 font-monospace"
                          style={{ minHeight: '30px', fontSize: '0.78rem' }}
                          onClick={() => triggerRoll(atr.label, rawMod)}
                          title={`Rolar teste de ${atr.label}`}
                        >
                          <i className="bi bi-dice-6 me-1" aria-hidden="true"></i>
                          {formatMod(rawMod)}
                        </button>
                      </div>

                      <div className="d-flex justify-content-between align-items-center bg-black bg-opacity-40 p-2 rounded mb-2">
                        <span className="text-muted small font-rpg">Pontuação:</span>
                        <span className="h4 text-light font-rpg fw-bold mb-0">{atr.val ?? 10}</span>
                      </div>

                      {skills.length > 0 ? (
                        <div className="pt-1">
                          <span className="text-muted font-rpg d-block mb-1" style={{ fontSize: '0.68rem' }}>
                            PERÍCIAS (CLIQUE PARA TESTAR):
                          </span>
                          <div className="d-flex flex-column gap-1">
                            {skills.map((skillName) => {
                              const isProf =
                                Array.isArray(personagem.pericias) &&
                                personagem.pericias.includes(skillName);
                              const bonusNum = getSkillBonusNum(atr.val, skillName);

                              return (
                                <button
                                  type="button"
                                  key={skillName}
                                  onClick={() => triggerRoll(skillName, bonusNum)}
                                  className={`rpg-skill-btn ${
                                    isProf ? 'bg-warning bg-opacity-10 border-warning border-opacity-25' : ''
                                  }`}
                                  style={{ fontSize: '0.8rem' }}
                                >
                                  <span className={isProf ? 'text-gold fw-bold' : 'text-light'}>
                                    <i
                                      className={`bi ${
                                        isProf ? 'bi-check-circle-fill text-warning' : 'bi-circle text-secondary'
                                      } me-2`}
                                      aria-hidden="true"
                                    ></i>
                                    {skillName}
                                  </span>
                                  <span
                                    className={`badge font-monospace ${
                                      isProf ? 'bg-warning text-dark' : 'bg-secondary bg-opacity-25 text-light'
                                    }`}
                                  >
                                    {formatMod(bonusNum)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-muted font-rpg fst-italic" style={{ fontSize: '0.72rem' }}>
                            (Sem perícias diretas)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {personagem.magias && (
              <div>
                <h5 className="font-rpg text-gold mb-2 border-bottom border-warning border-opacity-25 pb-2">
                  <i className="bi bi-journal-bookmark me-2" aria-hidden="true"></i>Magias & Notas do Aventureiro
                </h5>
                <div className="bg-dark p-3 rounded border border-secondary border-opacity-25 small text-light">
                  {personagem.magias}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer bg-transparent border-top border-secondary border-opacity-25">
            <button type="button" className="btn btn-dnd-outline px-4" onClick={onClose}>
              Fechar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailModal;
