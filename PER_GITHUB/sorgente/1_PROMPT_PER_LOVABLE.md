# Prompt da incollare in Lovable

Prima di incollarlo, carica in Lovable i file della cartella `PER_LOVABLE`:
- `src/pages/promo25/Promo25Page.tsx` e `src/pages/promo25/promo25.css`
- tutta la cartella `public/promo25/` (immagini, video, font e logo)

Se Lovable non ti lascia caricare i file, apri `Promo25Page.tsx` e `promo25.css` con il Blocco note e incolla il contenuto dentro il messaggio, sotto il prompt. Le immagini e il video vanno caricati comunque, perché il testo non li porta con sé.

---

## Il testo da incollare

Aggiungi al sito una landing page per la promozione PROMO25, riservata a chi riceve la nostra medaglia NFC a un incontro Confcommercio, all'indirizzo **/promo25**. Ti allego il componente già finito (`Promo25Page.tsx`), il suo foglio di stile (`promo25.css`) e le immagini da mettere in `public/promo25/`.

Regole importanti:

1. **Usa i file così come sono.** Non cambiare testi, colori, caratteri, spaziature o struttura, e non convertire lo stile in Tailwind. Metti `Promo25Page.tsx` e `promo25.css` in `src/pages/promo25/` e le immagini, il video, i font e i loghi in `public/promo25/`, con gli stessi nomi.

2. **La rotta `/promo25` è a sé.** La pagina ha una sua barra in alto che resta fissa mentre si scorre. Non deve passare dal reindirizzamento di lingua (niente `/it/promo25`, niente redirect a `/en`), e non deve mostrare la barra di navigazione né il footer del sito, perché la pagina ha i suoi. Il banner dei cookie invece deve restare, come nel resto del sito. Aggiungi anche `/promo25/` con la barra finale, e anche `/PROMO25` in maiuscolo,, che porta alla stessa pagina.

3. **Collega gli indirizzi.** In cima a `Promo25Page.tsx` c'è un oggetto `CONFIG`. Aggiorna `CONFIG.link` con le rotte vere di questo sito: home, cosa fa, sicurezza, prezzo, termini e privacy (le pagine italiane). Non toccare il resto di `CONFIG`: il link di pagamento Stripe lo inserisco io.

4. **Statistiche.** Il componente accetta una prop `track(evento, dati)` e la chiama con questi eventi: `promo25_vista`, `promo25_paga` (con la posizione del bottone), `promo25_video`, `promo25_domanda`, `promo25_contatto`. Collegala al tracciamento delle visite che il sito usa già (la funzione `track-pageview`), salvando il nome dell'evento e i dati. Se c'è il Meta Pixel, `promo25_paga` va mandato come `InitiateCheckout` **solo se la persona ha accettato i cookie di marketing**, come fa il resto del sito.

5. **Contatti di chi non compra.** Il componente accetta una prop `onLead({ contatto, tipo, novita })`, dove `tipo` è `"email"` oppure `"telefono"` e `novita` dice se ha acconsentito alle novità. Crea una tabella `promo25_contatti` (id, contatto, tipo, novita, created_at) in cui si può solo inserire dal sito, con la lettura riservata all'admin, e salva lì ogni contatto con la sorgente `promo25`. Se il tipo è email:
   - manda subito una mail con Resend, come fanno le altre mail del sito, con oggetto «Il video di Miky e la tua PROMO25» e un testo breve: grazie di esserti fermato a parlare con noi all'incontro, il video lo trovi qui (link a `https://miky.ai/promo25`), PROMO25 (367,50 € invece di 490 €) vale fino a giovedì 8 ottobre alle 23:59;
   - se `novita` è vero, iscrivi l'indirizzo anche alla newsletter con la funzione `subscribe-newsletter` che esiste già, con sorgente `promo25`.

   Se `onLead` fallisce deve lanciare un errore, così la pagina mostra «Non è partito».
   Aggiungi i contatti di PROMO25 al pannello admin, in una lista semplice che si può esportare in CSV.

6. **Non indicizzare.** La pagina non deve finire nel sitemap. Il componente aggiunge da solo `noindex`, ma controlla che il sitemap non la includa.

7. **Il reindirizzamento a tempo è già nel componente**: dopo le 23:59 dell'8 ottobre 2026 la pagina manda alla home. Lascialo com'è.

8. **Prova prima di pubblicare.** Apri `/promo25?anteprima=1` su un telefono: con `?anteprima=1` l'offerta risulta attiva anche prima del 1 ottobre. Controlla che la foto in alto, il video e i caratteri si carichino, e che il modulo salvi un contatto di prova.

Non aggiungere altro alla pagina e non cambiare nient'altro nel sito.

---

## Dopo che Lovable ha finito

- Apri `miky.ai/promo25?anteprima=1` sul tuo iPhone e confrontala con le schermate in `ANTEPRIMA`. Se Lovable ha cambiato qualcosa (colori, spazi, caratteri diversi), rispondigli «ripristina Promo25Page.tsx e promo25.css esattamente come li ho allegati».
- Apri `miky.ai/promo25` senza niente dopo: prima del 1 ottobre il bottone dice «Si apre giovedì 1 ottobre», ed è giusto così.
- Inserisci il link Stripe in `CONFIG.stripeLink` (vedi la guida Stripe) e ripubblica.
- Scrivi i tag NFC **solo dopo** questa prova, con l'indirizzo `https://miky.ai/promo25`, e poi bloccali in sola lettura.
