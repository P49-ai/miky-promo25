# Il link di pagamento su Stripe, passo passo

Il pagamento della landing è un **Payment Link** di Stripe: una pagina di pagamento che Stripe ospita, con Apple Pay e Google Pay già dentro. Si crea dal pannello in una decina di minuti, senza toccare il codice del sito.

Fallo **prima in modalità di test** (l'interruttore «Modalità test» in alto a destra), prova a pagare, e solo dopo rifallo in modalità reale.

## 1. Il prodotto

Catalogo prodotti → **Aggiungi prodotto**.

- **Nome:** `Miky · PROMO25`
- **Descrizione:** `Miky con base, alimentatore e cavo. Primi 12 mesi di canone inclusi. Consegna prevista tra luglio e settembre 2027. PROMO25 valida dal 1 all'8 ottobre 2026.`
- **Immagine:** una foto di Miky (va bene `hero.webp` o `miky.webp` della cartella `public/promo25`, o un render del sito).
- **Prezzo:** una tantum, **367,50 EUR**.
- **IVA:** se usate Stripe Tax, imposta il prezzo come «IVA inclusa». Se non lo usate, lascia com'è: 367,50 € è già il prezzo finale.

Perché un prodotto nuovo e non uno sconto sul prodotto da 490 €: con un coupon, dopo la scadenza il link continuerebbe a funzionare a 490 €, e qualcuno potrebbe pagare il prezzo pieno pensando di avere lo sconto.

## 2. Il link

Payment Links → **Nuovo**, e scegli il prodotto appena creato.

- **Quantità:** attiva «I clienti possono modificare la quantità», da 1 a 3.
- **Dati da raccogliere:** nome, email, **numero di telefono**, indirizzo di spedizione (solo Italia).
- **ID fiscale:** attiva «Consenti ai clienti di aggiungere un ID fiscale», per chi vuole la fattura con partita IVA.
- **Termini di servizio:** attiva «Richiedi ai clienti di accettare i termini» (serve l'indirizzo dei termini di vendita nelle impostazioni pubbliche di Stripe, vedi il file 3).
- **Dopo il pagamento:** «Mostra pagina di conferma» con questo messaggio:
  `Grazie. Il tuo preordine di Miky con PROMO25 è pagato e confermato, non c'è altro da versare. Ti scriviamo quando entra in produzione e prima della spedizione, prevista tra luglio e settembre 2027. Se cambi idea prima della spedizione basta una mail e ti rimborsiamo tutto.`
- **Opzioni avanzate:** in «Metadati» aggiungi `type` = `promo25`.

Poi, in Impostazioni:
- **Metodi di pagamento:** controlla che Apple Pay e Google Pay siano attivi.
- **Email ai clienti:** attiva «Pagamenti riusciti», così chi paga riceve subito la ricevuta.
- **Fatture:** se volete una fattura per ogni pagamento, attiva la creazione della fattura dopo il pagamento.

Copia il link (inizia con `https://buy.stripe.com/`) e mettilo in `CONFIG.stripeLink` dentro `Promo25Page.tsx`, al posto di `https://buy.stripe.com/INSERISCI_IL_LINK`. Il resto dell'indirizzo lo aggiunge la pagina da sola: ogni pagamento arriva con `client_reference_id` che dice da quale bottone è partito: `promo25-nav` (la barra in alto), `promo25-alto` (sotto il prezzo) o `promo25-fondo` (in chiusura).

## 3. La prova

In modalità test paga con la carta `4242 4242 4242 4242`, una data futura qualunque e un CVC qualunque. Controlla che:
- nella pagina di pagamento si veda il prezzo giusto e la descrizione con la consegna;
- arrivi la mail di ricevuta;
- il pagamento compaia in Stripe con `client_reference_id` e i metadati.

Poi rifai il prodotto e il link in modalità reale e metti nella pagina **il link reale**.

## 4. Venerdì 9 ottobre, la mattina

Payment Links → apri il link di PROMO25 → **Disattiva**. La pagina alle 23:59 dell'8 rimanda già al sito, ma chi ha salvato il link di Stripe potrebbe ancora pagare: disattivarlo lo chiude davvero.

## 5. I pagamenti nell'admin

Il prompt per Lovable chiede di aggiungere al webhook `stripe-webhook` il riconoscimento dei pagamenti PROMO25, così nell'admin ogni contatto risulta «ha pagato» quando paga. Perché funzioni, nel pannello di Stripe il webhook del sito deve ricevere anche l'evento `checkout.session.completed` (Sviluppatori → Webhook → il webhook del sito → Eventi). Se c'è già, non serve fare altro.

Il collegamento fra contatto e pagamento passa dall'email. La pagina mette nel link di Stripe l'email lasciata nel popup, quindi chi paga la trova già scritta. Se la cambia a mano, il pagamento compare nell'admin come contatto nuovo con origine «stripe».

Il webhook è codice che tocca anche le prenotazioni da 50 €: prima di pubblicare conviene farlo rivedere a Tony.
