import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, CheckCheck, ChevronRight, Expand, Fingerprint, Info, Minimize2, RotateCcw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getError, useCandidatoMutation, useCandidatos, type Candidato } from '../api';

const logoPrimary = 'https://www.tse.jus.br/@@site-logo/logo.jpg';
const logoFallback = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Tribunal_Superior_Eleitoral.png/330px-Tribunal_Superior_Eleitoral.png';

function CandidateInitials({ candidate }: { candidate: Candidato }) {
  return <span className="kiosk-candidate-avatar" aria-hidden="true">{candidate.nome.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase()}</span>;
}

function Branding() {
  const [logo, setLogo] = useState<string | null>(logoPrimary);
  return (
    <div className="kiosk-identity">
      {logo ? <img src={logo} alt="Marca do Tribunal Superior Eleitoral, usada como referência visual" onError={() => setLogo(current => current === logoPrimary ? logoFallback : null)} /> : <span className="kiosk-identity-fallback">TSE</span>}
      <span className="kiosk-identity-rule" />
      <div><strong>ELEIÇÃOLAB</strong><small>SIMULADOR ACADÊMICO · NÃO OFICIAL</small></div>
    </div>
  );
}

export function FullScreenVoting() {
  const { data, isLoading, error, refetch } = useCandidatos();
  const [digits, setDigits] = useState('');
  const [blank, setBlank] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState('');
  const [showCandidates, setShowCandidates] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const active = useMemo(() => (data ?? []).filter(candidate => candidate.ativo), [data]);
  const length = useMemo(() => Math.min(8, Math.max(2, ...active.map(candidate => String(candidate.numero).length))), [active]);
  const candidate = useMemo(() => active.find(item => String(item.numero) === digits), [active, digits]);
  const partialMatch = useMemo(() => active.some(item => String(item.numero).startsWith(digits)), [active, digits]);
  const mutation = useCandidatoMutation((id: number) => api.vote(id));

  const correct = useCallback(() => {
    if (mutation.isPending) return;
    setDigits('');
    setBlank(false);
    setComplete(false);
    setMessage('');
  }, [mutation.isPending]);

  const append = useCallback((value: string) => {
    if (complete || mutation.isPending) return;
    setBlank(false);
    setMessage('');
    setDigits(previous => previous.length >= length ? previous : previous + value);
  }, [complete, mutation.isPending, length]);

  const whiteVote = useCallback(() => {
    if (complete || mutation.isPending) return;
    setDigits('');
    setBlank(true);
    setMessage('');
  }, [complete, mutation.isPending]);

  const confirm = useCallback(async () => {
    if (complete || mutation.isPending) return;
    if (blank) {
      setMessage('Voto em branco exibido apenas para demonstração. O banco registra somente votos em candidatos.');
      return;
    }
    if (!candidate) {
      setMessage('Digite o número completo de um candidato ativo antes de confirmar.');
      return;
    }
    setMessage('');
    try {
      await mutation.mutateAsync(candidate.id);
      setComplete(true);
      void refetch();
    } catch (reason) {
      setMessage(getError(reason));
    }
  }, [blank, candidate, complete, mutation, refetch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(event.key)) append(event.key);
      else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); correct(); }
      else if (event.key === 'Enter') { event.preventDefault(); void confirm(); }
      else if (event.key.toLowerCase() === 'b') whiteVote();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [append, correct, confirm, whiteVote]);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => document.removeEventListener('fullscreenchange', onFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setMessage('Seu navegador não permitiu alterar o modo de tela cheia.');
    }
  };

  return (
    <div className="kiosk-page">
      <header className="kiosk-header">
        <div className="kiosk-logo"><span className="kiosk-logo-icon"><Fingerprint size={23} /></span><span>eleição<strong>lab</strong></span></div>
        <span className="kiosk-top-label"><span /> AMBIENTE DE DEMONSTRAÇÃO</span>
        <div className="kiosk-header-actions">
          <button type="button" className="kiosk-top-action" onClick={() => void toggleFullscreen()}>{fullscreen ? <Minimize2 size={17} /> : <Expand size={17} />}<span>{fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</span></button>
          <Link className="kiosk-top-action kiosk-admin-link" to="/painel"><Users size={17}/><span>Dashboard</span><ChevronRight size={14}/></Link>
        </div>
      </header>

      <main className="kiosk-main">
        <div className="kiosk-heading">
          <span className="kiosk-eyebrow">ELEIÇÃOLAB / EXPERIÊNCIA DE VOTAÇÃO</span>
          <h1>Seu voto. Sua escolha. <em>Uma experiência digital.</em></h1>
          <p>Use o teclado da urna ou os números do seu computador para simular um voto em um candidato cadastrado.</p>
        </div>
        <div className="kiosk-device-wrap">
          <section className="kiosk-device" aria-label="Urna eletrônica de demonstração">
            <div className="kiosk-device-top">
              <Branding />
              <div className="kiosk-device-number"><span>TERMINAL DE TESTE</span><strong>001</strong></div>
            </div>

            <div className="kiosk-device-body">
              <div className="kiosk-screen-housing">
                <div className="kiosk-screen" aria-live="polite">
                  {complete ? (
                    <div className="kiosk-end">
                      <span className="kiosk-end-icon"><CheckCheck size={57}/></span>
                      <h2>FIM</h2>
                      <p>Voto de demonstração registrado com sucesso.</p>
                      <button className="kiosk-again" onClick={correct} type="button"><RotateCcw size={17}/> Iniciar nova votação</button>
                    </div>
                  ) : (
                    <>
                      <div className="kiosk-screen-flag"><span>JUSTIÇA ELEITORAL · REFERÊNCIA VISUAL</span><span>SIMULAÇÃO</span></div>
                      <div className="kiosk-screen-title"><span>SEU VOTO PARA</span><h2>CANDIDATO</h2></div>
                      <div className="kiosk-screen-divider" />
                      <div className="kiosk-number-label">{blank ? 'Voto em branco' : 'Número do candidato'}</div>
                      {blank ? (
                        <div className="kiosk-blank">VOTO EM BRANCO<small>Simulação sem registro de voto em branco no banco</small></div>
                      ) : (
                        <div className="kiosk-digit-row" aria-label={'Número digitado: ' + (digits || 'nenhum')}>
                          {Array.from({ length }, (_, i) => <span key={i} className={i === digits.length ? 'kiosk-digit-current' : ''}>{digits[i] ?? ''}</span>)}
                        </div>
                      )}
                      <div className="kiosk-screen-result">
                        {candidate && !blank ? (
                          <div className="kiosk-person">
                            <CandidateInitials candidate={candidate} />
                            <div><span>NOME</span><strong>{candidate.nome}</strong><span>PARTIDO</span><p>{candidate.sigla_partido} · {candidate.partido}</p><span>CARGO</span><p>{candidate.cargo}</p></div>
                          </div>
                        ) : !blank && digits.length > 0 && (!partialMatch || digits.length === length) ? (
                          <div className="kiosk-invalid"><Info size={19}/> Número não encontrado ou candidato inativo.</div>
                        ) : blank ? (
                          <p className="kiosk-screen-hint">Pressione CORRIGE para escolher um candidato.</p>
                        ) : (
                          <p className="kiosk-screen-hint">Digite o número do candidato para visualizar seus dados.</p>
                        )}
                      </div>
                      <div className="kiosk-screen-foot">CONFIRMA para registrar · CORRIGE para reiniciar</div>
                    </>
                  )}
                </div>
              </div>

              <div className="kiosk-keypad-section">
                <div className="kiosk-keypad-heading"><span>TECLADO NUMÉRICO</span><span className="kiosk-green-indicator" /></div>
                <div className="kiosk-keypad">
                  {['1','2','3','4','5','6','7','8','9','','0',''].map((digit, index) =>
                    digit ? <button className="kiosk-number-key" type="button" onClick={() => append(digit)} disabled={complete || mutation.isPending} key={index}>{digit}</button> : <span key={index} />
                  )}
                </div>
                <div className="kiosk-actions">
                  <button type="button" onClick={whiteVote} disabled={complete || mutation.isPending} className="kiosk-blank-key">BRANCO</button>
                  <button type="button" onClick={correct} disabled={mutation.isPending} className="kiosk-correct-key">CORRIGE</button>
                  <button type="button" onClick={() => void confirm()} disabled={complete || mutation.isPending || isLoading} className="kiosk-confirm-key"><Check size={17}/>{mutation.isPending ? 'AGUARDE' : 'CONFIRMA'}</button>
                </div>
                <div className="kiosk-keypad-help">TECLADO FÍSICO: 0–9 · ENTER · BACKSPACE</div>
              </div>
            </div>
            <div className="kiosk-device-footer"><span>ELEIÇÃOLAB</span><span className="kiosk-device-footer-center">SIMULAÇÃO ACADÊMICA — NÃO OFICIAL</span><span className="kiosk-footer-lights"><i/><i/><i/></span></div>
          </section>
        </div>

        {message && <div role="alert" className="kiosk-message"><Info size={17}/>{message}<button onClick={() => setMessage('')} type="button" aria-label="Fechar aviso">×</button></div>}
        {error && <div role="alert" className="kiosk-message kiosk-error">Não foi possível carregar os candidatos: {getError(error)} <button onClick={() => void refetch()} type="button">Tentar novamente</button></div>}
        <div className="kiosk-below">
          <button type="button" className="kiosk-candidates-toggle" onClick={() => setShowCandidates(current => !current)}><Users size={16}/>{showCandidates ? 'Ocultar números de teste' : 'Ver números dos candidatos de teste'}<ChevronRight size={15}/></button>
          <span>Referência visual à Justiça Eleitoral · Projeto sem vínculo com o TSE</span>
        </div>
        {showCandidates && <div className="kiosk-choices">
          {active.length ? active.map(item => <button key={item.id} type="button" onClick={() => {correct();setDigits(String(item.numero));setShowCandidates(false);}}><span>{item.numero}</span><strong>{item.nome}</strong><small>{item.sigla_partido}</small></button>) : <p>{isLoading ? 'Carregando...' : 'Nenhum candidato ativo cadastrado. Acesse o dashboard para cadastrar.'}</p>}
        </div>}
        <div className="kiosk-mobile-return"><Link to="/painel"><ArrowLeft size={16}/> Abrir dashboard</Link></div>
      </main>
    </div>
  );
}
