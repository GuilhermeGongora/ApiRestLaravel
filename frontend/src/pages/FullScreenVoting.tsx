import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Expand, Fingerprint, Info, Minimize2, RotateCcw, Volume2, VolumeX, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getError, useCandidatos, type Candidato, type EscolhaVoto } from '../api';

const logoPrimary = 'https://www.tse.jus.br/@@site-logo/logo.jpg';

const stages = [
  { key: 'deputado_federal', title: 'DEPUTADO FEDERAL', digits: 4, hint: 'Câmara dos Deputados' },
  { key: 'deputado_estadual', title: 'DEPUTADO ESTADUAL', digits: 5, hint: 'Assembleia Legislativa / Câmara Legislativa' },
  { key: 'senador', title: 'SENADOR — 1ª VAGA', digits: 3, hint: 'Primeira escolha para o Senado' },
  { key: 'senador', title: 'SENADOR — 2ª VAGA', digits: 3, hint: 'Segunda escolha para o Senado' },
  { key: 'governador', title: 'GOVERNADOR', digits: 2, hint: 'Governo estadual' },
  { key: 'presidente', title: 'PRESIDENTE', digits: 2, hint: 'Presidência da República' },
] as const;

function normalizedOffice(cargo: string): string {
  const value = cargo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (value.includes('deputad') && value.includes('federal')) return 'deputado_federal';
  if (value.includes('deputad') && (value.includes('estadual') || value.includes('distrital'))) return 'deputado_estadual';
  if (value.includes('senador')) return 'senador';
  if (value.includes('governador')) return 'governador';
  if (value.includes('presidente')) return 'presidente';
  return '';
}

let voteAudioContext: AudioContext | null = null;

function playToneSequence(final: boolean) {
  try {
    const context = voteAudioContext ?? new AudioContext();
    voteAudioContext = context;
    if (context.state === 'suspended') void context.resume();
    const start = context.currentTime + 0.015;
    const tones = final
      ? [[660, 0, 0.09], [880, 0.12, 0.09], [990, 0.24, 0.1], [1320, 0.39, 0.4]]
      : [[880, 0, 0.11]];

    for (const [frequency, offset, duration] of tones) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const from = start + offset;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, from);
      gain.gain.setValueAtTime(0.0001, from);
      gain.gain.exponentialRampToValueAtTime(0.19, from + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, from + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(from);
      oscillator.stop(from + duration + 0.03);
    }

  } catch {
    return;
  }
}

function CandidatePortrait({ candidate }: { candidate: Candidato }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [candidate.foto_url]);
  const initials = candidate.nome.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return (
    <div className="kiosk-candidate-avatar kiosk-candidate-photo">
      {candidate.foto_url && !failed
        ? <img src={candidate.foto_url} alt={'Foto de ' + candidate.nome} onError={() => setFailed(true)} />
        : <span aria-label="Foto não cadastrada">{initials}</span>}
    </div>
  );
}

function Branding() {
  const [logoError, setLogoError] = useState(false);
  return (
    <div className="kiosk-identity">
      {!logoError ? <img src={logoPrimary} alt="Marca do Tribunal Superior Eleitoral usada como referência visual" onError={() => setLogoError(true)} /> : <strong>TSE</strong>}
      <span className="kiosk-identity-rule" />
      <div><strong>ELEIÇÃOLAB</strong><small>SIMULAÇÃO ACADÊMICA · NÃO OFICIAL</small></div>
    </div>
  );
}

export function FullScreenVoting() {
  const { data, isLoading, error, refetch } = useCandidatos();
  const [step, setStep] = useState(0);
  const [digits, setDigits] = useState('');
  const [blank, setBlank] = useState(false);
  const [choices, setChoices] = useState<EscolhaVoto[]>([]);
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [showCandidates, setShowCandidates] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [sound, setSound] = useState(true);
  const sessionId = useRef(crypto.randomUUID());
  const inFlight = useRef(false);
  const timer = useRef<number | null>(null);

  const stage = stages[step];
  const candidates = useMemo(
    () => (data ?? []).filter(candidate => candidate.ativo && normalizedOffice(candidate.cargo) === stage.key),
    [data, stage.key]
  );
  const candidate = candidates.find(item => String(item.numero) === digits);
  const legendCandidate = (stage.key === 'deputado_federal' || stage.key === 'deputado_estadual') && digits.length >= 2
    ? candidates.find(item => String(item.numero).startsWith(digits.slice(0, 2)))
    : undefined;
  const duplicateSenator = step === 3 && candidate && choices[2]?.numero === digits && !choices[2]?.branco;
  const canUseLegend = Boolean(legendCandidate && (digits.length === 2 || digits.length === stage.digits) && !candidate);
  const nullVote = !blank && (digits.length === stage.digits && !candidate && !canUseLegend || Boolean(duplicateSenator));
  const canConfirm = blank || Boolean(candidate && digits.length === stage.digits) || canUseLegend || nullVote;
  const voteType = blank ? 'branco' : duplicateSenator || nullVote ? 'nulo' : candidate ? 'candidato' : canUseLegend ? 'legenda' : 'pendente';

  const correct = useCallback(() => {
    if (inFlight.current) return;
    setDigits('');
    setBlank(false);
    setMessage('');
  }, []);

  const append = useCallback((value: string) => {
    if (complete || inFlight.current) return;
    setBlank(false);
    setMessage('');
    setDigits(previous => previous.length < stages[step].digits ? previous + value : previous);
  }, [complete, step]);

  const whiteVote = useCallback(() => {
    if (complete || inFlight.current) return;
    if (digits) {
      setMessage('Para votar em branco, pressione CORRIGE antes.');
      return;
    }
    setBlank(true);
    setMessage('');
  }, [complete, digits]);

  const restart = useCallback(() => {
    if (inFlight.current) return;
    setStep(0);
    setDigits('');
    setBlank(false);
    setChoices([]);
    setComplete(false);
    setPending(false);
    setMessage('');
    sessionId.current = crypto.randomUUID();
  }, []);

  const confirm = useCallback(async () => {
    if (complete || inFlight.current) return;
    if (!canConfirm) {
      setMessage('Complete o número do candidato, escolha a legenda ou pressione BRANCO.');
      return;
    }

    inFlight.current = true;
    setPending(true);
    setMessage('');
    const choice = { numero: blank ? '' : digits, branco: blank };

    if (step < stages.length - 1) {
      if (sound) playToneSequence(false);
      timer.current = window.setTimeout(() => {
        setChoices(previous => [...previous, choice]);
        setStep(previous => previous + 1);
        setDigits('');
        setBlank(false);
        setPending(false);
        inFlight.current = false;
      }, 330);
      return;
    }

    try {
      await api.submitBallot(sessionId.current, [...choices, choice]);
      if (sound) playToneSequence(true);
      setComplete(true);
      void refetch();
    } catch (reason) {
      setMessage(getError(reason));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, [blank, canConfirm, choices, complete, digits, refetch, sound, step]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(event.key)) append(event.key);
      else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); correct(); }
      else if (event.key === 'Enter') { event.preventDefault(); void confirm(); }
      else if (event.key.toLowerCase() === 'b') whiteVote();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [append, correct, confirm, whiteVote]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setMessage('O navegador não permitiu entrar em tela cheia.');
    }
  };

  return (
    <div className="kiosk-page">
      <header className="kiosk-header">
        <div className="kiosk-logo"><span className="kiosk-logo-icon"><Fingerprint size={23}/></span><span>eleição<strong>lab</strong></span></div>
        <span className="kiosk-top-label"><span/> ELEIÇÕES 2026 · 1º TURNO · TREINAMENTO</span>
        <div className="kiosk-header-actions">
          <button className="kiosk-top-action" type="button" onClick={() => setSound(value => !value)} aria-label={sound ? 'Desativar som' : 'Ativar som'}>{sound ? <Volume2 size={17}/> : <VolumeX size={17}/>}<span>Som {sound ? 'ligado' : 'desligado'}</span></button>
          <button className="kiosk-top-action" type="button" onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize2 size={17}/> : <Expand size={17}/>}<span>Tela cheia</span></button>
          <Link className="kiosk-top-action kiosk-admin-link" to="/painel"><Users size={17}/><span>Dashboard</span><ChevronRight size={14}/></Link>
        </div>
      </header>
      <main className="kiosk-main">
        <div className="kiosk-heading">
          <span className="kiosk-eyebrow">SIMULADOR DE VOTAÇÃO · SEQUÊNCIA DE CARGOS</span>
          <h1>{complete ? 'Votação de demonstração concluída' : <>Etapa {step + 1} de 6 · <em>{stage.title}</em></>}</h1>
          <p>{complete ? 'Você concluiu as seis escolhas da simulação.' : stage.hint + ' · confira os dados antes de confirmar.'}</p>
          <div className="kiosk-progress" aria-label={'Etapa ' + (step + 1) + ' de 6'}>
            {stages.map((stageItem, index) => <span key={index} className={index < step || complete ? 'is-done' : index === step ? 'is-current' : ''} title={stageItem.title}/>)}
          </div>
        </div>
        <div className="kiosk-device-wrap">
          <section className="kiosk-device" aria-label="Urna eletrônica de simulação">
            <div className="kiosk-device-top"><Branding/><div className="kiosk-device-number"><span>TERMINAL DE TESTE</span><strong>001</strong></div></div>
            <div className="kiosk-device-body">
              <div className="kiosk-screen-housing">
                <div className="kiosk-screen" aria-live="polite">
                  {complete ? <div className="kiosk-end"><span className="kiosk-end-icon"><Check size={54}/></span><h2>FIM</h2><p>Seis votos de demonstração registrados. Esta não é uma eleição oficial.</p><button className="kiosk-again" type="button" onClick={restart}><RotateCcw size={17}/> Nova simulação</button></div>
                  : <>
                    <div className="kiosk-screen-flag"><span>ELEIÇÃOLAB · SIMULAÇÃO ACADÊMICA</span><span>ETAPA {step + 1}/6</span></div>
                    <div className="kiosk-screen-title"><span>SEU VOTO PARA</span><h2>{stage.title}</h2></div>
                    <div className="kiosk-screen-divider"/>
                    <div className="kiosk-number-label">{blank ? 'Você selecionou:' : 'Número:'}</div>
                    {blank ? <div className="kiosk-blank">VOTO EM BRANCO<small>Pressione CONFIRMA para continuar</small></div> : <div className="kiosk-digit-row" aria-label={'Número digitado: ' + (digits || 'nenhum')}>{Array.from({length:stage.digits},(_,index)=><span key={index} className={index===digits.length?'kiosk-digit-current':''}>{digits[index]??''}</span>)}</div>}
                    <div className="kiosk-screen-result">
                      {!blank && candidate && !duplicateSenator
                        ? <div className="kiosk-person"><CandidatePortrait candidate={candidate}/><div><span>NOME</span><strong>{candidate.nome}</strong><span>PARTIDO</span><p>{candidate.sigla_partido} · {candidate.partido}</p><span>CARGO</span><p>{candidate.cargo}</p></div></div>
                        : voteType==='legenda'
                          ? <div className="kiosk-choice-notice kiosk-choice-legend"><strong>VOTO DE LEGENDA</strong><span>Partido: {legendCandidate?.sigla_partido} · {legendCandidate?.partido}</span><small>Seu voto será destinado à legenda partidária.</small></div>
                          : voteType==='nulo'
                            ? <div className="kiosk-choice-notice kiosk-choice-null"><strong>VOTO NULO</strong><span>{duplicateSenator ? 'A segunda escolha para senador repetiu a primeira.' : 'Número sem candidatura válida neste cargo.'}</span><small>Pressione CORRIGE para alterar ou CONFIRMA para continuar.</small></div>
                            : blank
                              ? <p className="kiosk-screen-hint">Voto em branco selecionado. Confira antes de confirmar.</p>
                              : <p className="kiosk-screen-hint">{isLoading ? 'Carregando candidatos...' : 'Digite o número do candidato. Para deputados, também é possível votar na legenda.'}</p>}
                    </div>
                    <div className="kiosk-screen-foot">CONFIRMA para seguir · CORRIGE para refazer esta escolha</div>
                  </>}
                </div>
              </div>
              <div className="kiosk-keypad-section">
                <div className="kiosk-keypad-heading"><span>TECLADO NUMÉRICO</span><span className="kiosk-green-indicator"/></div>
                <div className="kiosk-keypad">{['1','2','3','4','5','6','7','8','9','','0',''].map((value,index)=>value?<button className="kiosk-number-key" key={index} type="button" disabled={complete||pending||isLoading} onClick={()=>append(value)}>{value}</button>:<span key={index}/>)}</div>
                <div className="kiosk-actions">
                  <button className="kiosk-blank-key" type="button" disabled={complete||pending||isLoading} onClick={whiteVote}>BRANCO</button>
                  <button className="kiosk-correct-key" type="button" disabled={complete||pending} onClick={correct}>CORRIGE</button>
                  <button className="kiosk-confirm-key" type="button" disabled={complete||pending||isLoading} onClick={()=>void confirm()}><Check size={17}/>{pending?'AGUARDE':'CONFIRMA'}</button>
                </div>
                <div className="kiosk-keypad-help">TECLADO: 0–9 · ENTER · BACKSPACE · B</div>
              </div>
            </div>
            <div className="kiosk-device-footer"><span>ELEIÇÃOLAB</span><span className="kiosk-device-footer-center">SIMULAÇÃO ACADÊMICA — NÃO OFICIAL</span><span className="kiosk-footer-lights"><i/><i/><i/></span></div>
          </section>
        </div>
        {message && <div className="kiosk-message" role="alert"><Info size={17}/>{message}<button type="button" onClick={()=>setMessage('')} aria-label="Fechar aviso">×</button></div>}
        {error && <div className="kiosk-message kiosk-error" role="alert">Não foi possível carregar os candidatos: {getError(error)} <button type="button" onClick={()=>void refetch()}>Tentar novamente</button></div>}
        <div className="kiosk-below"><button type="button" className="kiosk-candidates-toggle" onClick={()=>setShowCandidates(current=>!current)}><Users size={16}/>{showCandidates?'Ocultar candidatos de teste':'Ver candidatos de teste para este cargo'}<ChevronRight size={15}/></button><span>Áudio eletrônico demonstrativo · Sem vínculo com o TSE</span></div>
        {showCandidates && <div className="kiosk-choices">{candidates.length?candidates.map(item=><button key={item.id} type="button" disabled={pending||complete} onClick={()=>{setDigits(String(item.numero));setBlank(false);setMessage('');setShowCandidates(false);}}><span>{item.numero}</span><strong>{item.nome}</strong><small>{item.sigla_partido}</small></button>):<p>Nenhum candidato ativo para este cargo. É possível simular um voto em branco ou nulo; cadastre candidatos no dashboard.</p>}</div>}
        <div className="kiosk-mobile-return"><Link to="/painel"><ArrowLeft size={16}/> Abrir dashboard</Link></div>
      </main>
    </div>
  );
}
