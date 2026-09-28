/* ============================================================
   MIKY · LANDING PROMO25 (medaglia NFC, incontro Confcommercio) · 26/09/2026
   v2: impaginazione rifatta sulle pagine prodotto di Apple.

   Pagina raggiungibile solo dal tag NFC della medaglia: miky.ai/promo25
   Offerta: 367,50 € invece di 490 €, da giovedì 1 a giovedì 8 ottobre 2026.
   Dopo le 23:59 dell'8 ottobre (ora italiana) la pagina rimanda alla home.

   Tutto quello che si cambia sta nel blocco CONFIG e nelle liste di testi
   qui sotto. Serve solo React. Lo stile sta in promo25.css e tutte le
   classi cominciano con "p25-", quindi non toccano il resto del sito.
   ============================================================ */

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import "./promo25.css";

/* ---------------- CONFIG ---------------- */

export const CONFIG = {
  /* Il Payment Link creato su Stripe (vedi la guida). */
  stripeLink: "https://buy.stripe.com/INSERISCI_IL_LINK",

  /* Ora italiana: in ottobre fino al 25 vale +02:00. */
  inizio: "2026-10-01T00:00:00+02:00",
  fine: "2026-10-08T23:59:59+02:00",

  prezzoPromo: "367,50 €",
  prezzoPieno: "490 €",
  sconto: "−25%",
  consegna: "tra luglio e settembre 2027",

  /* Indirizzi del sito. Lovable li adatta alle rotte che ha. */
  link: {
    home: "/",
    cosaFa: "/it/cosa-fa",
    sicurezza: "/it/sicurezza",
    prezzo: "/it/prezzo",
    termini: "/it/termini",
    privacy: "/it/privacy",
  },

  /* Cartella delle immagini e del video (public/promo25 nel progetto). */
  asset: "/promo25",
};

/* ---------------- TIPI ---------------- */

type Fase = "prima" | "attiva" | "finita";

export type Promo25PageProps = {
  /* Statistiche: Lovable ci collega il tracciamento che il sito ha già. */
  track?: (evento: string, dati?: Record<string, string>) => void;
  /* Contatto di chi non compra: Lovable lo salva e manda la mail. */
  onLead?: (dati: { contatto: string; tipo: "email" | "telefono"; novita: boolean }) => Promise<void>;
};

/* ---------------- TESTI ---------------- */

const NOTIFICHE = [
  { app: "Posta", testo: "Lo Studio Bianchi chiede un preventivo. È pronto con i prezzi di sempre: lo mando?" },
  { app: "Telefono", testo: "Ha chiamato il corriere: consegna domani fra le 9 e le 12. Confermato." },
  { app: "Calendario", testo: "Il fornitore ha spostato la consegna a giovedì. Ho avvisato i due clienti che la aspettavano." },
  { app: "Posta", testo: "Terzo sollecito per la fattura 112. Ho mandato il promemoria con l'IBAN." },
];

const COSE = [
  {
    img: "mattino.webp",
    etichetta: "Posta",
    titolo: "Le mail di lavoro, sbrigate.",
    testo: "Preventivi, conferme e solleciti. Risponde a quelle di routine e ti lascia solo quelle che hanno bisogno di te.",
  },
  {
    img: "day-work-1.webp",
    etichetta: "Telefono",
    titolo: "I clienti trovano sempre qualcuno.",
    testo: "Risponde mentre sei al lavoro e richiama per te. Dice sempre che è un assistente automatico.",
  },
  {
    img: "day-home-1.webp",
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
  {
    icona: "rimborso",
    t: "Cambi idea prima della spedizione?",
    d: "Ti rimborsiamo tutto quello che hai pagato. Basta una mail, e non ti chiediamo perché.",
  },
  {
    icona: "calendario",
    t: "La consegna slitta?",
    d: "Te lo scriviamo prima, con la data nuova e il motivo. Da quel momento puoi chiedere il rimborso.",
  },
  {
    icona: "pacco",
    t: "Ti è arrivato e non ti convince?",
    d: "Hai quattordici giorni per rimandarlo indietro, come per ogni acquisto online.",
  },
  {
    icona: "lucchetto",
    t: "Il pagamento",
    d: "Passa da Stripe, con Apple Pay, Google Pay o carta. I dati della carta non arrivano mai a noi.",
  },
];

const DOMANDE = [
  {
    q: "Lo posso usare per la mia attività?",
    a: "Sì, ed è per questo che siamo venuti all'incontro. Lo colleghi alla posta di lavoro, al telefono e all'agenda che usi già, e decidi tu cosa può fare da solo e cosa ti deve chiedere prima.",
  },
  {
    q: "Pago tutto subito?",
    a: "Sì. Oggi paghi 367,50 € e hai finito: non c'è un acconto né un saldo da versare dopo. In cambio blocchi il prezzo PROMO25, e fino a quando Miky non parte dal magazzino puoi chiedere indietro tutto.",
  },
  {
    q: "Perché arriva nel 2027?",
    a: "Perché lo stiamo ancora costruendo. Il prototipo esiste e adesso si prepara la prima serie di produzione. Preferiamo darti una data lontana ma vera, e se cambia te lo diciamo prima noi.",
  },
  {
    q: "E se Miky non arriva mai?",
    a: "Ti restituiamo tutti i 367,50 € che hai pagato. Fino al giorno in cui Miky parte dal magazzino il rimborso è intero, e lo chiedi quando vuoi.",
  },
  {
    q: "Cosa pago dopo i dodici mesi?",
    a: "Dal secondo anno c'è un canone mensile, che copre il calcolo, gli agenti, la custodia delle chiavi e gli aggiornamenti. Ti diciamo la cifra prima della consegna, così la sai prima di cominciare a pagarla.",
  },
  {
    q: "Cosa fa davvero oggi?",
    a: "La posta, il telefono e il calendario. Il resto che vedi raccontato sul sito arriva con gli aggiornamenti, e nella pagina del percorso trovi in che ordine. Miky Drone non è compreso.",
  },
  {
    q: "Le mie password escono da Miky?",
    a: "Le chiavi private nascono dentro Miky e non lo lasciano mai. Le credenziali dei servizi che colleghi le custodisce lui, e ogni accesso lo vedi dall'app e lo revochi con un tocco.",
  },
  {
    q: "Posso avere la fattura, o prenderne più di uno?",
    a: "Sì. Nella pagina di pagamento inserisci la partita IVA e ti arriva la fattura intestata alla tua attività. Lì scegli anche quanti ne vuoi, fino a tre, e PROMO25 vale per ognuno.",
  },
];

/* ---------------- ICONE (tratto, 24×24) ---------------- */

type IconaNome = "rimborso" | "calendario" | "pacco" | "lucchetto" | "spunta" | "play" | "freccia";

function Icona({ nome }: { nome: IconaNome }) {
  const p: Record<IconaNome, ReactNode> = {
    rimborso: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v4h4" />
        <path d="M12 7.5v9M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.7-2.5 1.8 0 2.7 5 1.4 5 4.1 0 1.1-1.1 1.9-2.5 1.9-1.2 0-2.2-.5-2.7-1.4" />
      </>
    ),
    calendario: (
      <>
        <rect x="3.5" y="5" width="17" height="15" rx="3" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
        <path d="M9 14.5l2 2 4-4" />
      </>
    ),
    pacco: (
      <>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
      </>
    ),
    lucchetto: (
      <>
        <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        <path d="M12 14.5v2.5" />
      </>
    ),
    spunta: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    play: <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" stroke="none" />,
    freccia: <path d="M5 12h14M13 6l6 6-6 6" />,
  };
  return (
    <svg className="p25-icona" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[nome]}
    </svg>
  );
}

/* ---------------- UTILITÀ ---------------- */

const T_INIZIO = Date.parse(CONFIG.inizio);
const T_FINE = Date.parse(CONFIG.fine);

function faseAdesso(ora: number, anteprima: boolean): Fase {
  if (anteprima) return "attiva";
  if (ora < T_INIZIO) return "prima";
  if (ora > T_FINE) return "finita";
  return "attiva";
}

const dueCifre = (n: number) => String(n).padStart(2, "0");

function mancano(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${dueCifre(Math.floor(s / 3600))}:${dueCifre(Math.floor((s % 3600) / 60))}:${dueCifre(s % 60)}`;
}

function linkPagamento(posizione: string) {
  const sep = CONFIG.stripeLink.includes("?") ? "&" : "?";
  return `${CONFIG.stripeLink}${sep}client_reference_id=promo25-${posizione}&utm_source=nfc&utm_medium=medaglia&utm_campaign=promo25`;
}

const A = (f: string) => `${CONFIG.asset}/${f}`;

/* Le sezioni entrano con una leggera salita quando arrivano sullo schermo. */
function useComparsa() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".p25-entra"));
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("p25-entra--vista"));
      return;
    }
    const o = new IntersectionObserver(
      (voci) =>
        voci.forEach((v) => {
          if (v.isIntersecting) {
            v.target.classList.add("p25-entra--vista");
            o.unobserve(v.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);
}

/* ---------------- COMPONENTE ---------------- */

export default function Promo25Page({ track, onLead }: Promo25PageProps) {
  /* ?anteprima=1 serve solo a provarla prima del 1 ottobre. */
  const [anteprima, setAnteprima] = useState(false);
  const [ora, setOra] = useState(() => Date.now());
  const fase = faseAdesso(ora, anteprima);
  const attiva = fase === "attiva";

  const [notifica, setNotifica] = useState(0);
  const [video, setVideo] = useState(false);
  const [slide, setSlide] = useState(0);
  const galleria = useRef<HTMLDivElement>(null);
  const videoEl = useRef<HTMLVideoElement>(null);

  useComparsa();

  /* Titolo, noindex e anteprima si leggono dal browser, dopo la resa. */
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
    return () => {
      document.title = vecchio;
      meta.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* L'orologio: ogni secondo nelle ultime 24 ore, altrimenti ogni minuto. */
  useEffect(() => {
    const ultimo = T_FINE - ora < 24 * 3600 * 1000;
    const id = window.setInterval(() => setOra(Date.now()), ultimo ? 1000 : 60000);
    return () => window.clearInterval(id);
  }, [ora]);

  /* Finita la settimana si va sul sito. replace: "indietro" non riporta qui. */
  useEffect(() => {
    if (fase === "finita") window.location.replace(CONFIG.link.home);
  }, [fase]);

  /* Le notifiche accanto a Miky, una alla volta. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setNotifica((n) => (n + 1) % NOTIFICHE.length), 4500);
    return () => window.clearInterval(id);
  }, []);

  /* Il puntino della galleria segue la scheda più visibile. */
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

  const ultimoGiorno = attiva && T_FINE > ora && T_FINE - ora < 24 * 3600 * 1000;
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

  const scadenza =
    fase === "prima" ? (
      <>Parte giovedì 1 ottobre, vale fino a giovedì 8 alle 23:59.</>
    ) : ultimoGiorno ? (
      <>
        Ultimo giorno: finisce fra <b className="p25-mono">{mancano(T_FINE - ora)}</b>
      </>
    ) : (
      <>
        Vale fino a <b>giovedì 8 ottobre alle 23:59</b>
      </>
    );

  return (
    <div className="p25">
      {/* ---------- barra in alto, sempre visibile (come la barra prodotto di Apple) ---------- */}
      <nav className="p25-nav" aria-label="PROMO25">
        <div className="p25-nav__dentro">
          <a href={CONFIG.link.home} className="p25-nav__logo" aria-label="Miky, vai al sito">
            <img src={A("miky-wordmark-bianco.svg")} alt="Miky" width={70} height={14} />
          </a>
          <span className="p25-nav__promo">
            <i className="p25-punto" aria-hidden="true" />
            PROMO25
          </span>
          <Bottone posizione="nav" piccolo />
        </div>
      </nav>

      {/* ---------- apertura ---------- */}
      <header className="p25-hero">
        <p className="p25-occhiello p25-hero__occhiello">Riservato a chi era all'incontro</p>
        <h1 className="p25-h1">Non aspetta che tu chieda.</h1>
        <p className="p25-hero__sub">
          Miky è il tuo agente AI personale. Sbriga mail, telefonate e appuntamenti al posto tuo,
          entro i limiti che gli dai.
        </p>

        <div className="p25-hero__prezzo">
          <span className="p25-badge">PROMO25 · {CONFIG.sconto}</span>
          <p className="p25-hero__cifre">
            <span className="p25-hero__nuovo">{CONFIG.prezzoPromo}</span>
            <s className="p25-hero__vecchio">{CONFIG.prezzoPieno}</s>
          </p>
          <p className="p25-hero__dentro">Paghi oggi l'intero importo, IVA inclusa e con fattura. Dodici mesi di canone e spedizione compresi.</p>
          <div className="p25-hero__cta">
            <Bottone posizione="alto" />
          </div>
          <p className="p25-hero__nota">{scadenza}</p>
        </div>

        <div className="p25-palco" aria-hidden="true">
          <div className="p25-palco__alone" />
          <img className="p25-palco__miky" src={A("miky.webp")} alt="" width={640} height={838} fetchPriority="high" />
          <div className="p25-palco__ombra" />
          <div className="p25-notifica" key={notifica}>
            <img src={A("miky-symbol-bianco.svg")} alt="" width={28} height={24} />
            <div>
              <span className="p25-notifica__app">
                Miky · {NOTIFICHE[notifica].app} <em>adesso</em>
              </span>
              <span className="p25-notifica__testo">{NOTIFICHE[notifica].testo}</span>
            </div>
          </div>
        </div>
        <p className="p25-legale">
          Prezzo più basso degli ultimi 30 giorni: {CONFIG.prezzoPieno}. Pagamento oggi, consegna prevista {CONFIG.consegna}.
        </p>
      </header>

      {/* ---------- video ---------- */}
      <section className="p25-sezione p25-carta">
        <div className="p25-griglia">
          <div className="p25-testa p25-entra">
            <p className="p25-occhiello p25-occhiello--rosso">In un minuto e cinquanta</p>
            <h2 className="p25-h2">Come funziona, dall'accensione alle chiavi.</h2>
          </div>
          <div className="p25-video p25-entra">
            {video ? (
              <video
                ref={videoEl}
                src={A("come-funziona.mp4")}
                poster={A("come-funziona.webp")}
                controls
                playsInline
                autoPlay
                onPlay={() => track?.("promo25_video")}
              />
            ) : (
              <button className="p25-video__copertina" onClick={() => setVideo(true)} aria-label="Guarda il video Come funziona">
                <img src={A("come-funziona.webp")} alt="" loading="lazy" />
                <span className="p25-video__play">
                  <Icona nome="play" />
                </span>
                <span className="p25-video__durata">1:50</span>
              </button>
            )}
          </div>
          <p className="p25-didascalia p25-entra">
            Lo attacchi alla presa e ti guida lui, a voce, fino a collegare la posta, il telefono e
            l'agenda che usi già.
          </p>
        </div>
      </section>

      {/* ---------- cosa fa oggi: galleria ---------- */}
      <section className="p25-sezione p25-carta p25-sezione--attaccata">
        <div className="p25-griglia">
          <div className="p25-testa p25-entra">
            <p className="p25-occhiello p25-occhiello--rosso">Cosa fa già oggi</p>
            <h2 className="p25-h2">Le cose che rimandi, le sbriga lui.</h2>
          </div>
        </div>
        <div className="p25-galleria p25-entra" ref={galleria} role="list">
          {COSE.map((c) => (
            <article className="p25-scheda" role="listitem" key={c.titolo}>
              <img src={A(c.img)} alt="" loading="lazy" />
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
              <button
                key={c.titolo}
                role="tab"
                aria-selected={slide === i}
                aria-label={c.etichetta}
                className={slide === i ? "p25-punti__on" : ""}
                onClick={() => vaiA(i)}
              />
            ))}
          </div>
          <p className="p25-didascalia p25-entra">
            Il resto arriva con gli aggiornamenti. Sul sito trovi{" "}
            <a href={CONFIG.link.cosaFa}>tutto quello che farà</a>, e in che ordine.
          </p>
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
              <img src={A("tazza.webp")} alt="Miky sulla scrivania accanto a una tazza" loading="lazy" />
            </div>
            <ul className="p25-lista">
              {INCLUSO.map((x) => (
                <li key={x}>
                  <span className="p25-lista__segno">
                    <Icona nome="spunta" />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <p className="p25-didascalia p25-didascalia--scura p25-entra">
            Dal secondo anno c'è un canone mensile, e ti diciamo la cifra prima della consegna. Miky
            Drone non è compreso.
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
                <span className="p25-tessera__icona">
                  <Icona nome={g.icona} />
                </span>
                <h3>{g.t}</h3>
                <p>{g.d}</p>
              </div>
            ))}
          </div>
          <p className="p25-didascalia p25-entra">Miky lo progetta e lo produce P49 Società Benefit, a Padova.</p>
        </div>
      </section>

      {/* ---------- domande ---------- */}
      <section className="p25-sezione p25-carta p25-sezione--attaccata">
        <div className="p25-griglia p25-griglia--stretta">
          <div className="p25-testa p25-entra">
            <h2 className="p25-h2">Le domande di chi ha un'attività.</h2>
          </div>
          <div className="p25-domande p25-entra">
            {DOMANDE.map((d) => (
              <details key={d.q} onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && track?.("promo25_domanda", { q: d.q })}>
                <summary>
                  {d.q}
                  <i aria-hidden="true" />
                </summary>
                <p>{d.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- chiusura ---------- */}
      <section className="p25-chiusura">
        <div className="p25-griglia p25-entra">
          <img className="p25-chiusura__miky" src={A("miky-piccolo.webp")} alt="" width={120} height={157} loading="lazy" />
          <h2 className="p25-h2">PROMO25 finisce giovedì 8 ottobre.</h2>
          <p className="p25-hero__cifre p25-hero__cifre--chiusura">
            <span className="p25-hero__nuovo">{CONFIG.prezzoPromo}</span>
            <s className="p25-hero__vecchio">{CONFIG.prezzoPieno}</s>
          </p>
          <div className="p25-hero__cta">
            <Bottone posizione="fondo" />
          </div>
          <p className="p25-hero__nota">{scadenza}</p>
        </div>
      </section>

      {/* ---------- contatto ---------- */}
      <Contatto onLead={onLead} track={track} />

      {/* ---------- piede ---------- */}
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
              <p className="p25-didascalia">
                Ti mandiamo il video e il link per prenotare. PROMO25 resta valida fino a giovedì 8
                ottobre alle 23:59.
              </p>
            </>
          ) : (
            <>
              <h2 className="p25-h3">Non è il momento?</h2>
              <p className="p25-didascalia">
                Lasciaci la mail o il numero. Ti mandiamo il video e il link, così ci pensi con calma
                prima che scada PROMO25.
              </p>
              <form onSubmit={invia} noValidate>
                <label className="p25-campo">
                  <span>Mail o numero di telefono</span>
                  <input
                    type="text"
                    autoComplete="email"
                    value={contatto}
                    onChange={(e) => setContatto(e.target.value)}
                    placeholder="nome@esempio.it"
                    maxLength={120}
                  />
                </label>
                <label className="p25-spunta-riga">
                  <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
                  <span>
                    Ho letto l'<a href={CONFIG.link.privacy}>informativa sulla privacy</a>. Usate il mio
                    contatto per mandarmi il video e il link.
                  </span>
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
