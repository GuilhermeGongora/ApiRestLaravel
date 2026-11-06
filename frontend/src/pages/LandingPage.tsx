import { ArrowRight, ArrowUpRight, BarChart3, Code2, Database, Fingerprint, Layers3, ShieldCheck, Sparkles, Vote } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

const UrnaScene = lazy(() => import('../components/UrnaScene').then(module => ({ default: module.UrnaScene })));

const features = [
  { icon: Layers3, index: '01', title: 'Gestão de candidatos', description: 'Cadastre, consulte, edite e exclua registros em uma interface organizada e integrada.' },
  { icon: Vote, index: '02', title: 'Simulador de votação', description: 'Experimente uma urna digital conectada aos candidatos ativos da API.' },
  { icon: BarChart3, index: '03', title: 'Dados em tempo real', description: 'Acompanhe indicadores e resultados atualizados após cada operação.' },
  { icon: Database, index: '04', title: 'Integração Laravel', description: 'Uma arquitetura separada entre interface React, API REST e persistência.' },
];

export function LandingPage() {
  return (
    <div className="landing-root">
      <header className="landing-header">
        <Link to="/" className="landing-logo" aria-label="EleiçãoLab — início">
          <span className="landing-logo-mark"><Fingerprint size={23} /></span>
          <span>eleição<strong>lab</strong><small>PLATAFORMA DE SIMULAÇÃO</small></span>
        </Link>
        <nav aria-label="Navegação principal">
          <a href="#plataforma">Plataforma</a>
          <a href="#arquitetura">Arquitetura</a>
          <Link className="landing-nav-cta" to="/painel">Entrar no painel <ArrowUpRight size={16} /></Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-ambient landing-ambient-a" />
          <div className="landing-ambient landing-ambient-b" />
          <div className="landing-hero-inner">
            <div className="landing-copy">
              <div className="landing-kicker"><span className="landing-spark" /> TECNOLOGIA & EXPERIÊNCIA ELEITORAL</div>
              <h1 id="landing-title">Uma nova forma de <em>explorar a votação.</em></h1>
              <p>Do cadastro ao voto, tudo em uma experiência digital intuitiva. Conheça o EleiçãoLab: um ambiente acadêmico para aprender, gerenciar e simular.</p>
              <div className="landing-buttons">
                <Link to="/painel" className="landing-button-main">Explorar plataforma <ArrowRight size={20} /></Link>
                <Link to="/urna" className="landing-button-outline"><Vote size={19} /> Testar urna</Link>
              </div>
              <div className="landing-proof">
                <span><ShieldCheck size={17} /> Projeto acadêmico</span>
                <i />
                <span><Code2 size={17} /> React + Laravel</span>
                <i />
                <span><Sparkles size={17} /> Experiência 3D</span>
              </div>
            </div>

            <div className="landing-art" aria-label="Modelo tridimensional estilizado de uma urna eletrônica">
              <div className="landing-art-halo" />
              <div className="landing-art-frame">
                <Suspense fallback={<div className="scene-loading">Preparando experiência 3D...</div>}>
                  <UrnaScene />
                </Suspense>
              </div>
              <div className="landing-art-top"><span className="landing-art-dot" /> VISUALIZAÇÃO INTERATIVA <span>3D / 01</span></div>
              <div className="landing-art-caption">MODELO DIGITAL <strong>URNA ELETRÔNICA</strong></div>
            </div>
          </div>
          <div className="landing-scroll"><span>DESCUBRA A PLATAFORMA</span><span className="landing-scroll-line" /></div>
        </section>

        <section className="landing-features" id="plataforma">
          <div className="landing-section-head">
            <div><div className="landing-label">A PLATAFORMA</div><h2>Funcionalidade encontra <em>boa experiência.</em></h2></div>
            <p>Quatro recursos conectados para transformar uma API REST em uma aplicação completa, responsiva e demonstrável.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, index, title, description }) => (
              <article key={title} className="landing-feature">
                <div className="landing-feature-top"><span className="landing-feature-icon"><Icon size={23}/></span><span>{index}</span></div>
                <h3>{title}</h3><p>{description}</p>
                <div className="landing-feature-rule" />
              </article>
            ))}
          </div>
        </section>

        <section className="landing-architecture" id="arquitetura">
          <div className="landing-architecture-copy">
            <span className="landing-label">DESENVOLVIMENTO FULL STACK</span>
            <h2>Design que impressiona. <em>Arquitetura que funciona.</em></h2>
            <p>O frontend React consome endpoints Laravel por meio de Axios. React Query mantém os dados sincronizados, enquanto Zod e React Hook Form dão segurança aos formulários.</p>
            <Link to="/painel" className="landing-architecture-link">Acessar o painel administrativo <ArrowRight size={18}/></Link>
          </div>
          <div className="landing-stack">
            <div className="landing-stack-step"><span>01</span><strong>REACT + VITE</strong><small>Experiência visual</small></div>
            <div className="landing-stack-link" />
            <div className="landing-stack-step"><span>02</span><strong>API REST LARAVEL</strong><small>Regras de negócio</small></div>
            <div className="landing-stack-link" />
            <div className="landing-stack-step"><span>03</span><strong>SQLITE</strong><small>Persistência de dados</small></div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span><Fingerprint size={20}/> ELEIÇÃOLAB</span>
        <small>© 2026 · Ambiente demonstrativo, sem vínculo com a Justiça Eleitoral.</small>
        <Link to="/painel">Abrir aplicação <ArrowUpRight size={16}/></Link>
      </footer>
    </div>
  );
}
