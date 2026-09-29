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

2. **La rotta `/promo25` è a sé.** La pagina ha una sua barra in alto che resta fissa mentre si scorre. Non deve passare dal reindirizzamento di lingua (niente `/it/promo25`, niente redirect a `/en`), e non deve mostrare la barra di navigazione né il footer del sito, perché la pagina ha i suoi. Il banner dei cookie invece deve restare, come nel resto del sito. Aggiungi anche `/promo25/` con la barra finale, e anche `/PROMO25` in maiuscolo, che porta alla stessa pagina.

3. **Collega gli indirizzi.** In cima a `Promo25Page.tsx` c'è un oggetto `CONFIG`. Aggiorna `CONFIG.link` con le rotte vere di questo sito: home, cosa fa, sicurezza, prezzo, termini e privacy (le pagine italiane). Non toccare il resto di `CONFIG`: il link di pagamento Stripe lo inserisco io.

4. **Statistiche.** Il componente accetta una prop `track(evento, dati)` e la chiama con questi eventi: `promo25_vista`, `promo25_popup_vista`, `promo25_popup_chiuso`, `promo25_contatto` (con `origine` e `novita`), `promo25_paga` (con la posizione del bottone), `promo25_video`, `promo25_domanda`, `promo25_schermo`. Salva ogni evento in una tabella `promo25_eventi` (id, evento, dati jsonb, sessione, created_at), con inserimento consentito dal sito e lettura solo per l'admin. La `sessione` è un identificativo casuale che generi una volta per visita e tieni in `sessionStorage`. Se c'è il Meta Pixel, `promo25_paga` va mandato come `InitiateCheckout` **solo se la persona ha accettato i cookie di marketing**, come fa il resto del sito.

5. **Il popup di benvenuto e i contatti.** Appena si apre la pagina compare un popup che chiede nome, cognome ed email. Non c'è doppia conferma: chi lo compila è registrato subito. Lo stesso modulo c'è anche in fondo alla pagina per chi ha chiuso il popup. Il componente chiama la prop `onLead({ nome, cognome, email, novita, origine })`, dove `origine` è `"popup"` oppure `"fondo"` e `novita` dice se ha spuntato le novità su Miky.

   Crea la tabella `promo25_contatti` con: id, nome, cognome, email (unica, minuscola), novita, origine, mail_benvenuto_inviata (boolean), mail_benvenuto_errore (testo), ha_pagato (boolean, default false), pagato_il, importo, stripe_session_id, created_at. Dal sito si può solo inserire. Se la stessa email arriva due volte aggiorna nome e cognome e non creare un doppione, e non mandare una seconda mail di benvenuto. La lettura è riservata all'admin.

   `onLead` chiama una funzione edge `promo25-lead` che:
   - salva il contatto nella tabella;
   - manda subito la mail di benvenuto con Resend, con lo stesso stile delle altre mail del sito (il testo è sotto);
   - segna `mail_benvenuto_inviata` oppure salva l'errore in `mail_benvenuto_errore`;
   - se `novita` è vero, iscrive l'email anche alla newsletter con la funzione `subscribe-newsletter` che esiste già, con sorgente `promo25`.

   Se il salvataggio fallisce `onLead` deve lanciare un errore, così la pagina mostra «Non è partito». Se invece fallisce solo la mail, il contatto resta salvato e l'errore si vede nell'admin.

   **La mail di benvenuto**
   - Oggetto: `{nome}, il tuo prezzo PROMO25 per Miky`
   - Testo:

     > Ciao {nome},
     >
     > grazie di esserti fermato a parlare con noi all'incontro. Come promesso, per te Miky costa 367,50 € invece di 490 €, fino a giovedì 8 ottobre alle 23:59.
     >
     > Dentro ci sono Miky con base, alimentatore e cavo, e i primi dodici mesi del servizio. Si paga tutto adesso e la consegna è prevista tra luglio e settembre 2027. Se cambi idea prima della spedizione ti rimborsiamo tutto.
     >
     > [Bottone] Preordina a 367,50 € → `https://miky.ai/promo25`
     >
     > Se hai una domanda rispondi pure a questa mail, la leggiamo noi.
     >
     > Il team di Miky · P49 Società Benefit, Padova

   - Il bottone porta alla pagina e non direttamente a Stripe, così dopo l'8 ottobre la mail non manda nessuno a un pagamento chiuso.

6. **I pagamenti nell'admin.** Nel webhook di Stripe che il sito usa già (`stripe-webhook`), aggiungi la gestione di `checkout.session.completed` quando il pagamento arriva dal link PROMO25: lo riconosci da `client_reference_id` che inizia con `promo25-` oppure dal metadato `type = promo25` del link. In quel caso cerca in `promo25_contatti` l'email del cliente (`customer_details.email`); se c'è, segna `ha_pagato`, `pagato_il`, `importo` e `stripe_session_id`, se non c'è crea il contatto con origine `"stripe"`. Non toccare la gestione delle prenotazioni da 50 €. La pagina aggiunge da sola `prefilled_email` al link di Stripe, così chi ha compilato il popup trova la sua email già scritta e il pagamento si collega al contatto.

7. **La sezione PROMO25 nel pannello admin.** Aggiungi al pannello admin una voce «PROMO25» con:
   - in alto quattro numeri: visite alla pagina (visitatori unici per sessione), contatti lasciati, click su «Preordina», pagamenti con il totale incassato;
   - sotto, la tabella dei contatti con nome, cognome, email, origine, novità sì o no, mail di benvenuto (inviata o errore), ha pagato sì o no, data. Si ordina per data, si cerca per nome o email, e si filtra per «ha pagato» e «non ha pagato»;
   - un bottone «Esporta CSV» e, sulla riga di un contatto con errore, un bottone «Rimanda la mail di benvenuto».

8. **Non indicizzare.** La pagina non deve finire nel sitemap. Il componente aggiunge da solo `noindex`, ma controlla che il sitemap non la includa.

9. **Il reindirizzamento a tempo è già nel componente**: dopo le 23:59 dell'8 ottobre 2026 la pagina manda alla home. Lascialo com'è.

10. **Prova prima di pubblicare.** Apri `/promo25?anteprima=1` su un telefono: con `?anteprima=1` l'offerta risulta attiva anche prima del 1 ottobre. Controlla che compaia il popup, che il contatto di prova compaia nell'admin e che arrivi la mail di benvenuto. Poi fai un pagamento in modalità test dal link e controlla che nell'admin quel contatto risulti «ha pagato». Il popup non ricompare a chi l'ha già compilato: per rivederlo apri la pagina in una finestra in incognito.

Non aggiungere altro alla pagina e non cambiare nient'altro nel sito.

---

## Dopo che Lovable ha finito

- Apri `miky.ai/promo25?anteprima=1` sul tuo iPhone e confrontala con le schermate in `ANTEPRIMA`. Se Lovable ha cambiato qualcosa (colori, spazi, caratteri diversi), rispondigli «ripristina Promo25Page.tsx e promo25.css esattamente come li ho allegati».
- Apri `miky.ai/promo25` senza niente dopo: prima del 1 ottobre il bottone dice «Si apre giovedì 1 ottobre», ed è giusto così.
- Inserisci il link Stripe in `CONFIG.stripeLink` (vedi la guida Stripe) e ripubblica.
- Scrivi i tag NFC **solo dopo** questa prova, con l'indirizzo `https://miky.ai/promo25`, e poi bloccali in sola lettura.
