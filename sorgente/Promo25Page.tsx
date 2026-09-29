/* ============================================================
   MIKY · LANDING PROMO25 (medaglia NFC, incontro Confcommercio)
   v4 · 28/09/2026: prezzo protagonista, titolo più piccolo, video
   e render animati, schermo interattivo «senza Miky / con Miky»,
   inclinazione 3D al tocco, tre domande.

   Pagina raggiungibile solo dal tag NFC: miky.ai/promo25
   Offerta: 367,50 € invece di 490 €, da giovedì 1 a giovedì 8 ottobre 2026.
   Dopo le 23:59 dell'8 ottobre (ora italiana) la pagina rimanda alla home.

   Tutto quello che si cambia sta in CONFIG e nelle liste di testi.
   Serve solo React. Lo stile sta in promo25.css (classi "p25-").
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import "./promo25.css";

/* ---------------- CONFIG ---------------- */

export const CONFIG = {
  stripeLink: "https://buy.stripe.com/INSERISCI_IL_LINK",
  inizio: "2026-10-01T00:00:00+02:00",
  fine: "2026-10-08T23:59:59+02:00",
  prezzoPromo: "367,50 €",
  prezzoPieno: "490 €",
  risparmio: "122,50 €",
  sconto: "−25%",
  consegna: "tra luglio e settembre 2027",
  link: {
    home: "/",
    cosaFa: "/it/cosa-fa",
    sicurezza: "/it/sicurezza",
    prezzo: "/it/prezzo",
    termini: "/it/termini",
    privacy: "/it/privacy",
  },
  asset: "/promo25",
};

type Fase = "prima" | "attiva" | "finita";

export type Promo25PageProps = {
  track?: (evento: string, dati?: Record<string, string>) => void;
  onLead?: (dati: { contatto: string; tipo: "email" | "telefono"; novita: boolean }) => Promise<void>;
};

/* ---------------- TESTI ---------------- */

const NOTIFICHE_HERO = [
  { app: "Posta", testo: "Lo Studio Bianchi chiede un preventivo. È pronto con i prezzi di sempre: lo mando?" },
  { app: "Telefono", testo: "Ha chiamato il corriere: consegna domani fra le 9 e le 12. Confermato." },
  { app: "Calendario", testo: "Il fornitore ha spostato la consegna a giovedì. Ho avvisato i due clienti." },
];

/* Lo schermo «senza Miky / con Miky» */
const CAOS = [
  { app: "Posta", ora: "8:02", testo: "Studio Bianchi: ci mandate il preventivo?" },
  { app: "Calendario", ora: "8:15", testo: "Domani hai due riunioni alla stessa ora." },
  { app: "Telefono", ora: "8:31", testo: "Chiamata persa: il corriere." },
  { app: "Posta", ora: "8:47", testo: "Sollecito fattura, terzo promemoria." },
  { app: "Calendario", ora: "9:05", testo: "Il fornitore ha spostato la consegna." },
];
const ORDINE = "Tutto sbrigato. Resta il preventivo per lo Studio Bianchi: è pronto con i prezzi di sempre, lo mando?";

const COSE = [
  {
    video: "mattino",
    etichetta: "Posta",
    titolo: "Le mail di lavoro, sbrigate.",
    testo: "Preventivi, conferme e solleciti. Risponde a quelle di routine e ti lascia solo quelle che hanno bisogno di te.",
  },
  {
    video: "giostra",
    etichetta: "Telefono",
    titolo: "I clienti trovano sempre qualcuno.",
    testo: "Risponde mentre sei al lavoro e richiama per te. Dice sempre che è un assistente automatico.",
  },
  {
    video: "notte",
    etichetta: "Calendario",
    titolo: "L'agenda si tiene da sola.",
    testo: "Fissa e sposta gli appuntamenti con clienti e fornitori, li conferma e ti avvisa prima.",
  },
];

const INCLUSO = [
  "Miky, la base, l'alimentatore e il cavo",
  "I primi dodici mesi di canone",
  "Miky App per iOS e Android",
  "Garanzia di due anni",
  "Spedizione in Italia",
  "Fattura intestata alla tua attività",
];

const GARANZIE: { icona: IconaNome; t: string; d: string }[] = [
  { icona: "rimborso", t: "Cambi idea prima della spedizione?", d: "Ti rimborsiamo tutto quello che hai pagato. Basta una mail, e non ti chiediamo perché." },
  { icona: "calendario", t: "La consegna slitta?", d: "Te lo scriviamo prima, con la data nuova e il motivo. Da quel momento puoi chiedere il rimborso." },
  { icona: "pacco", t: "Ti è arrivato e non ti convince?", d: "Hai quattordici giorni per rimandarlo indietro, come per ogni acquisto online." },
  { icona: "lucchetto", t: "Il pagamento", d: "Passa da Stripe, con Apple Pay, Google Pay o carta. I dati della carta non arrivano mai a noi." },
];

const DOMANDE = [
  {
    q: "Pago tutto subito?",
    a: "Sì. Oggi paghi 367,50 € e hai finito: non c'è un acconto né un saldo da versare dopo. In cambio blocchi il prezzo PROMO25, e fino a quando Miky non parte dal magazzino puoi chiedere indietro tutto.",
  },
  {
    q: "E se Miky non arriva mai?",
    a: "Ti restituiamo tutti i 367,50 € che hai pagato. Fino al giorno in cui Miky parte dal magazzino il rimborso è intero, e lo chiedi quando vuoi.",
  },
  {
    q: "Cosa pago dopo i dodici mesi?",
    a: "Dal secondo anno c'è un canone mensile, che copre il calcolo, gli agenti, la custodia delle chiavi e gli aggiornamenti. Ti diciamo la cifra prima della consegna, così la sai prima di cominciare a pagarla.",
  },
];

/* ---------------- ICONE ---------------- */

type IconaNome = "rimborso" | "calendario" | "pacco" | "lucchetto" | "spunta" | "play" | "freccia" | "posta" | "telefono";

function Icona({ nome }: { nome: IconaNome }) {
  const p: Record<IconaNome, ReactNode> = {
    rimborso: (<><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" /><path d="M12 7.5v9M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.8 0 2.7 5 1.4 5 4.1 0 1.1-1.1 1.9-2.5 1.9-1.2 0-2.2-.5-2.7-1.4" /></>),
    calendario: (<><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="M9 14.5l2 2 4-4" /></>),
    pacco: (<><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></>),
    lucchetto: (<><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><path d="M12 14.5v2.5" /></>),
    spunta: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    play: <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" stroke="none" />,
    freccia: <path d="M5 12h14M13 6l6 6-6 6" />,
    posta: (<><rect x="3" y="5.5" width="18" height="13" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></>),
    telefono: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />,
  };
  return (
    <svg className="p25-icona" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[nome]}
    </svg>
  );
}

const iconaApp = (app: string): IconaNome => (app === "Posta" ? "posta" : app === "Telefono" ? "telefono" : "calendario");

/* ---------------- UTILITÀ ---------------- */

const T_INIZIO = Date.parse(CONFIG.inizio);
const T_FINE = Date.parse(CONFIG.fine);
const A = (f: string) => `${CONFIG.asset}/${f}`;
const dueCifre = (n: number) => String(n).padStart(2, "0");
const calma = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function faseAdesso(ora: number, anteprima: boolean): Fase {
  if (anteprima) return "attiva";
  if (ora < T_INIZIO) return "prima";
  if (ora > T_FINE) return "finita";
  return "attiva";
}

function scomponi(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { g: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function linkPagamento(posizione: string) {
  const sep = CONFIG.stripeLink.includes("?") ? "&" : "?";
  return `${CONFIG.stripeLink}${sep}client_reference_id=promo25-${posizione}&utm_source=nfc&utm_medium=medaglia&utm_campaign=promo25`;
}

/* Le sezioni salgono piano quando arrivano sullo schermo. */
function useComparsa() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".p25-entra"));
    if (!("IntersectionObserver" in window) || calma()) {
      els.forEach((el) => el.classList.add("p25-entra--vista"));
      return;
    }
    const o = new IntersectionObserver(
      (voci) => voci.forEach((v) => { if (v.isIntersecting) { v.target.classList.add("p25-entra--vista"); o.unobserve(v.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);
}

/* Video in loop: parte solo quando si vede, si ferma quando esce. */
function Anello({ nome, className, alt }: { nome: string; className?: string; alt?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || calma()) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
    }, { threshold: 0.2 });
    o.observe(v);
    return () => o.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      src={A(`v/${nome}.mp4`)}
      poster={A(`v/${nome}.jpg`)}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    />
  );
}

/* Il prezzo scende da 490 a 367,50 la prima volta che si vede. */
function PrezzoCheScende() {
  const [v, setV] = useState(calma() ? 367.5 : 490);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (calma()) { setV(367.5); return; }
    let raf = 0;
    const parti = () => {
      const t0 = performance.now();
      const dur = 1400;
      const passo = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 4);
        setV(490 - (490 - 367.5) * e);
        if (k < 1) raf = requestAnimationFrame(passo);
      };
      raf = requestAnimationFrame(passo);
    };
    const id = window.setTimeout(parti, 650);
    /* rete di sicurezza: se il browser salta dei fotogrammi, la cifra finale è sempre giusta */
    const fine = window.setTimeout(() => setV(367.5), 2600);
    return () => { clearTimeout(id); clearTimeout(fine); cancelAnimationFrame(raf); };
  }, []);
  const [intero, dec] = v.toFixed(2).split(".");
  return (
    <span className="p25-cifra" ref={ref} aria-label={CONFIG.prezzoPromo}>
      <span aria-hidden="true">{intero}<span className="p25-cifra__dec">,{dec}</span><span className="p25-cifra__eur">€</span></span>
    </span>
  );
}

/* Il riquadro che si inclina seguendo il dito o il mouse. */
function Inclina({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const muovi = useCallback((e: RPointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || calma()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
    el.classList.add("p25-inclina--attiva");
  }, []);
  const lascia = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.classList.remove("p25-inclina--attiva");
  }, []);
  return (
    <div className={`p25-inclina ${className ?? ""}`} ref={ref} onPointerMove={muovi} onPointerLeave={lascia} onPointerUp={lascia} onPointerCancel={lascia}>
      <div className="p25-inclina__dentro">{children}</div>
    </div>
  );
}

/* ---------------- COMPONENTE ---------------- */

export default function Promo25Page({ track, onLead }: Promo25PageProps) {
  const [anteprima, setAnteprima] = useState(false);
  const [ora, setOra] = useState(() => Date.now());
  const fase = faseAdesso(ora, anteprima);
  const attiva = fase === "attiva";

  const [notifica, setNotifica] = useState(0);
  const [video, setVideo] = useState(false);
  const [slide, setSlide] = useState(0);
  const [conMiky, setConMiky] = useState(false);
  const [toccato, setToccato] = useState(false);
  const galleria = useRef<HTMLDivElement>(null);
  const schermo = useRef<HTMLDivElement>(null);

  useComparsa();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setAnteprima(q.get("anteprima") === "1");
    const vecchio = document.title;
    document.title = "Miky · PROMO25, fino all'8 ottobre";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    track?.("promo25_vista");
    return () => { document.title = vecchio; meta.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ultimo = T_FINE - ora < 24 * 3600 * 1000;
    const id = window.setInterval(() => setOra(Date.now()), ultimo ? 1000 : 30000);
    return () => window.clearInterval(id);
  }, [ora]);

  useEffect(() => {
    if (fase === "finita") window.location.replace(CONFIG.link.home);
  }, [fase]);

  useEffect(() => {
    if (calma()) return;
    const id = window.setInterval(() => setNotifica((n) => (n + 1) % NOTIFICHE_HERO.length), 4500);
    return () => window.clearInterval(id);
  }, []);

  /* Lo schermo «senza/con Miky» si mette in ordine da solo la prima volta
     che lo vedi, poi lo comandi tu. */
  useEffect(() => {
    const el = schermo.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        window.setTimeout(() => setConMiky((c) => (toccato ? c : true)), 1600);
        o.disconnect();
      }
    }, { threshold: 0.6 });
    o.observe(el);
    return () => o.disconnect();
  }, [toccato]);

  useEffect(() => {
    const g = galleria.current;
    if (!g) return;
    const su = () => {
      const w = (g.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
      setSlide(Math.min(COSE.length - 1, Math.round(g.scrollLeft / (w + 16))));
    };
    g.addEventListener("scroll", su, { passive: true });
    return () => g.removeEventListener("scroll", su);
  }, []);

  const vaiA = (i: number) => {
    const g = galleria.current;
    const c = g?.children[i] as HTMLElement | undefined;
    if (g && c) g.scrollTo({ left: c.offsetLeft - g.offsetLeft - parseFloat(getComputedStyle(g).paddingLeft), behavior: "smooth" });
  };

  const clicPaga = (posizione: string) => () => track?.("promo25_paga", { posizione });

  const Bottone = ({ posizione, piccolo }: { posizione: string; piccolo?: boolean }) =>
    attiva ? (
      <a className={`p25-cta${piccolo ? " p25-cta--piccolo" : ""}`} href={linkPagamento(posizione)} onClick={clicPaga(posizione)} rel="noopener">
        {piccolo ? "Preordina" : `Preordina a ${CONFIG.prezzoPromo}`}
        {!piccolo && <Icona nome="freccia" />}
      </a>
    ) : (
      <span className={`p25-cta p25-cta--spento${piccolo ? " p25-cta--piccolo" : ""}`} aria-disabled="true">
        {piccolo ? "Dal 1/10" : "Si apre giovedì 1 ottobre"}
      </span>
    );

  if (fase === "finita") {
    return (
      <div className="p25 p25-uscita">
        <p>PROMO25 è finita. Ti portiamo sul sito di Miky…</p>
        <a href={CONFIG.link.home}>Vai a miky.ai</a>
      </div>
    );
  }

  /* Il conto alla rovescia: data fissa, uguale per tutti. */
  const resto = scomponi(T_FINE - ora);
  const Tempo = () =>
    fase === "prima" ? (
      <p className="p25-tempo__nota">Parte giovedì 1 ottobre e vale fino a giovedì 8 alle 23:59.</p>
    ) : (
      <div className="p25-tempo" role="timer" aria-label={`PROMO25 finisce giovedì 8 ottobre alle 23:59`}>
        <span className="p25-tempo__et">Finisce fra</span>
        {[
          [resto.g, "giorni"],
          [resto.h, "ore"],
          [resto.m, "min"],
          ...(resto.g === 0 ? [[resto.s, "sec"] as [number, string]] : []),
        ].map(([n, l]) => (
          <span className="p25-tempo__cella" key={l as string}>
            <b className="p25-mono">{dueCifre(n as number)}</b>
            <i>{l}</i>
          </span>
        ))}
      </div>
    );

  return (
    <div className="p25">
      <div className="p25-grana" aria-hidden="true" />

      {/* ---------- barra in alto ---------- */}
      <nav className="p25-nav" aria-label="PROMO25">
        <div className="p25-nav__dentro">
          <a href={CONFIG.link.home} className="p25-nav__logo" aria-label="Miky, vai al sito">
            <img src={A("miky-wordmark-bianco.svg")} alt="Miky" width={70} height={14} />
          </a>
          <span className="p25-nav__promo">
            <b>{CONFIG.prezzoPromo}</b>
            <s>{CONFIG.prezzoPieno}</s>
          </span>
          <Bottone posizione="nav" piccolo />
        </div>
      </nav>

      {/* ---------- apertura: il prezzo è il titolo ---------- */}
      <header className="p25-hero">
        <div className="p25-hero__sfondo" aria-hidden="true" />
        <div className="p25-griglia p25-hero__griglia">
          <div className="p25-hero__testo">
            <p className="p25-occhiello">Riservato a chi era all'incontro</p>
            <h1 className="p25-h1">Miky, il tuo agente AI personale.<br /><span>Fa le cose al posto tuo.</span></h1>

            <div className="p25-offerta">
              <div className="p25-offerta__testa">
                <span className="p25-badge">PROMO25</span>
                <span className="p25-risparmio">Risparmi {CONFIG.risparmio}</span>
              </div>
              <div className="p25-offerta__cifre">
                <PrezzoCheScende />
                <span className="p25-offerta__prima">
                  <s className="p25-vecchio">{CONFIG.prezzoPieno}</s>
                  <span className="p25-sconto">{CONFIG.sconto}</span>
                </span>
              </div>
              <p className="p25-offerta__dentro">
                Paghi oggi l'intero importo, IVA inclusa e con fattura. Dodici mesi di canone e spedizione compresi.
              </p>
              <Bottone posizione="alto" />
              <Tempo />
            </div>
          </div>

          <Inclina className="p25-hero__visivo">
            <Anello nome="mille-cose" className="p25-hero__video" alt="Miky sulla scrivania con le app che usi ogni giorno" />
            <span className="p25-riflesso" aria-hidden="true" />
            <div className="p25-notifica" key={notifica}>
              <span className="p25-notifica__icona"><Icona nome={iconaApp(NOTIFICHE_HERO[notifica].app)} /></span>
              <div>
                <span className="p25-notifica__app">Miky · {NOTIFICHE_HERO[notifica].app} <em>adesso</em></span>
                <span className="p25-notifica__testo">{NOTIFICHE_HERO[notifica].testo}</span>
              </div>
            </div>
          </Inclina>
        </div>
        <p className="p25-legale">
          Prezzo più basso degli ultimi 30 giorni: {CONFIG.prezzoPieno}. Pagamento oggi, consegna prevista {CONFIG.consegna}.
        </p>
      </header>

      {/* ---------- lo schermo interattivo ---------- */}
      <section className="p25-sezione p25-scuro p25-sezione--schermo">
        <div className="p25-griglia">
          <div className="p25-testa p25-entra">
            <p className="p25-occhiello">Tocca e guarda</p>
            <h2 className="p25-h2">La tua mattina, prima e dopo Miky.</h2>
          </div>
          <div className="p25-schermo p25-entra" ref={schermo} data-con={conMiky ? "1" : "0"}>
            <div className="p25-interruttore" role="tablist" aria-label="Senza o con Miky">
              <button role="tab" aria-selected={!conMiky} onClick={() => { setToccato(true); setConMiky(false); track?.("promo25_schermo", { stato: "senza" }); }}>Senza Miky</button>
              <button role="tab" aria-selected={conMiky} onClick={() => { setToccato(true); setConMiky(true); track?.("promo25_schermo", { stato: "con" }); }}>Con Miky</button>
              <span className="p25-interruttore__cursore" aria-hidden="true" />
            </div>
            <div className="p25-pila" aria-live="polite">
              {CAOS.map((n, i) => (
                <div className="p25-pila__voce" key={i} style={{ ["--i" as string]: i }}>
                  <span className="p25-pila__icona"><Icona nome={iconaApp(n.app)} /></span>
                  <span className="p25-pila__testo"><b>{n.app}</b><span>{n.testo}</span></span>
                  <em>{n.ora}</em>
                </div>
              ))}
              <div className="p25-pila__ordine">
                <img src={A("miky-symbol-bianco.svg")} alt="" width={28} height={24} />
                <span className="p25-pila__testo"><b>Miky</b><span>{ORDINE}</span></span>
                <em>9:06</em>
              </div>
            </div>
            <p className="p25-schermo__conto">
              <span className="p25-mono">{conMiky ? "1" : "5"}</span> {conMiky ? "cosa ha bisogno di te" : "notifiche prima delle nove"}
            </p>
          </div>
        </div>
      </section>

      {/* ---------- cosa fa oggi: schede video ---------- */}
      <section className="p25-sezione p25-carta">
        <div className="p25-griglia">
          <div className="p25-testa p25-entra">
            <p className="p25-occhiello p25-occhiello--rosso">Cosa fa già oggi</p>
            <h2 className="p25-h2">Le cose che rimandi, le sbriga lui.</h2>
          </div>
        </div>
        <div className="p25-galleria p25-entra" ref={galleria} role="list">
          {COSE.map((c) => (
            <article className="p25-scheda" role="listitem" key={c.titolo}>
              <Anello nome={c.video} className="p25-scheda__video" />
              <div className="p25-scheda__testo">
                <span className="p25-scheda__etichetta">{c.etichetta}</span>
                <h3>{c.titolo}</h3>
                <p>{c.testo}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="p25-griglia">
          <div className="p25-punti" role="tablist" aria-label="Schede">
            {COSE.map((c, i) => (
              <button key={c.titolo} role="tab" aria-selected={slide === i} aria-label={c.etichetta} className={slide === i ? "p25-punti__on" : ""} onClick={() => vaiA(i)} />
            ))}
          </div>
          <p className="p25-didascalia p25-entra">
            Il resto arriva con gli aggiornamenti. Sul sito trovi <a href={CONFIG.link.cosaFa}>tutto quello che farà</a>, e in che ordine.
          </p>
        </div>
      </section>

      {/* ---------- video come funziona ---------- */}
      <section className="p25-sezione p25-carta p25-sezione--attaccata">
        <div className="p25-griglia">
          <div className="p25-testa p25-entra">
            <p className="p25-occhiello p25-occhiello--rosso">In un minuto e cinquanta</p>
            <h2 className="p25-h2">Come funziona, dall'accensione alle chiavi.</h2>
          </div>
          <div className="p25-video p25-entra">
            {video ? (
              <video src={A("come-funziona.mp4")} poster={A("come-funziona.webp")} controls playsInline autoPlay onPlay={() => track?.("promo25_video")} />
            ) : (
              <button className="p25-video__copertina" onClick={() => setVideo(true)} aria-label="Guarda il video Come funziona">
                <img src={A("come-funziona.webp")} alt="" loading="lazy" />
                <span className="p25-video__play"><Icona nome="play" /></span>
                <span className="p25-video__durata">1:50</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ---------- cosa ricevi ---------- */}
      <section className="p25-sezione p25-scuro">
        <div className="p25-griglia">
          <div className="p25-testa p25-entra">
            <p className="p25-occhiello">Cosa ricevi</p>
            <h2 className="p25-h2">{CONFIG.prezzoPromo}, tutto compreso.</h2>
          </div>
          <div className="p25-scatola p25-entra">
            <div className="p25-scatola__foto">
              <Anello nome="dentro" className="p25-scatola__video" alt="Miky che gira su se stesso" />
            </div>
            <ul className="p25-lista">
              {INCLUSO.map((x) => (
                <li key={x}>
                  <span className="p25-lista__segno"><Icona nome="spunta" /></span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <p className="p25-didascalia p25-didascalia--scura p25-entra">
            Dal secondo anno c'è un canone mensile, e ti diciamo la cifra prima della consegna. Miky Drone non è compreso.
          </p>
        </div>
      </section>

      {/* ---------- garanzie ---------- */}
      <section className="p25-sezione p25-carta">
        <div className="p25-griglia">
          <div className="p25-testa p25-entra">
            <p className="p25-occhiello p25-occhiello--rosso">Paghi oggi, senza rischiare</p>
            <h2 className="p25-h2">Paghi tutto oggi, e fino alla spedizione puoi riaverlo.</h2>
          </div>
          <div className="p25-bento">
            {GARANZIE.map((g) => (
              <div className="p25-tessera p25-entra" key={g.t}>
                <span className="p25-tessera__icona"><Icona nome={g.icona} /></span>
                <h3>{g.t}</h3>
                <p>{g.d}</p>
              </div>
            ))}
          </div>

          <div className="p25-domande p25-entra">
            {DOMANDE.map((d) => (
              <details key={d.q} onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && track?.("promo25_domanda", { q: d.q })}>
                <summary>{d.q}<i aria-hidden="true" /></summary>
                <p>{d.a}</p>
              </details>
            ))}
          </div>
          <p className="p25-didascalia p25-entra">Miky lo progetta e lo produce P49 Società Benefit, a Padova.</p>
        </div>
      </section>

      {/* ---------- chiusura: Miky che si avvicina ---------- */}
      <section className="p25-chiusura">
        <Anello nome="chiavi" className="p25-chiusura__video" alt="Miky che si avvicina, con gli occhi accesi" />
        <div className="p25-chiusura__velo" aria-hidden="true" />
        <div className="p25-griglia p25-chiusura__dentro p25-entra">
          <h2 className="p25-h2">PROMO25 finisce giovedì 8 ottobre.</h2>
          <p className="p25-chiusura__prezzo">
            <b>{CONFIG.prezzoPromo}</b> <s>{CONFIG.prezzoPieno}</s>
          </p>
          <Bottone posizione="fondo" />
          <Tempo />
        </div>
      </section>

      <Contatto onLead={onLead} track={track} />

      <footer className="p25-piede">
        <div className="p25-griglia">
          <a className="p25-piede__sito" href={CONFIG.link.home}>
            Scopri tutto su Miky
            <Icona nome="freccia" />
          </a>
          <nav className="p25-piede__link" aria-label="Pagine del sito">
            <a href={CONFIG.link.cosaFa}>Cosa fa</a>
            <a href={CONFIG.link.sicurezza}>Sicurezza</a>
            <a href={CONFIG.link.prezzo}>Prezzo</a>
            <a href={CONFIG.link.termini}>Termini</a>
            <a href={CONFIG.link.privacy}>Privacy</a>
          </nav>
          <p>P49 Società Benefit S.r.l. · Padova</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- IL MODULO DI CONTATTO ---------------- */

function Contatto({ onLead, track }: Promo25PageProps) {
  const [contatto, setContatto] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [novita, setNovita] = useState(false);
  const [stato, setStato] = useState<"fermo" | "invio" | "fatto" | "errore">("fermo");

  const tipo = useMemo<"email" | "telefono" | null>(() => {
    const v = contatto.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "email";
    if (/^\+?[\d\s().-]{8,}$/.test(v) && v.replace(/\D/g, "").length >= 8) return "telefono";
    return null;
  }, [contatto]);

  const invia = async (e: FormEvent) => {
    e.preventDefault();
    if (!tipo || !privacy || stato === "invio") return;
    setStato("invio");
    try {
      await onLead?.({ contatto: contatto.trim(), tipo, novita });
      track?.("promo25_contatto", { tipo });
      setStato("fatto");
    } catch {
      setStato("errore");
    }
  };

  return (
    <section className="p25-sezione p25-carta p25-contatto">
      <div className="p25-griglia p25-griglia--modulo">
        <div className="p25-modulo p25-entra">
          {stato === "fatto" ? (
            <>
              <h2 className="p25-h3">Fatto.</h2>
              <p className="p25-didascalia">Ti mandiamo il video e il link per prenotare. PROMO25 resta valida fino a giovedì 8 ottobre alle 23:59.</p>
            </>
          ) : (
            <>
              <h2 className="p25-h3">Non è il momento?</h2>
              <p className="p25-didascalia">Lasciaci la mail o il numero. Ti mandiamo il video e il link, così ci pensi con calma prima che scada PROMO25.</p>
              <form onSubmit={invia} noValidate>
                <label className="p25-campo">
                  <span>Mail o numero di telefono</span>
                  <input type="text" autoComplete="email" value={contatto} onChange={(e) => setContatto(e.target.value)} placeholder="nome@esempio.it" maxLength={120} />
                </label>
                <label className="p25-spunta-riga">
                  <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
                  <span>Ho letto l'<a href={CONFIG.link.privacy}>informativa sulla privacy</a>. Usate il mio contatto per mandarmi il video e il link.</span>
                </label>
                <label className="p25-spunta-riga">
                  <input type="checkbox" checked={novita} onChange={(e) => setNovita(e.target.checked)} />
                  <span>Voglio ricevere anche le novità su Miky. Facoltativo.</span>
                </label>
                <button className="p25-invia" type="submit" disabled={!tipo || !privacy || stato === "invio"}>
                  {stato === "invio" ? "Un momento…" : "Mandamelo"}
                </button>
                {stato === "errore" && <p className="p25-errore">Non è partito. Riprova tra un momento.</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
