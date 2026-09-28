# Landing PROMO25 · medaglia NFC · incontro Confcommercio · 26/09/2026

Indirizzo da scrivere nei tag: **https://miky.ai/promo25**
Offerta PROMO25: 367,50 € invece di 490 €, da giovedì 1 a giovedì 8 ottobre 2026 alle 23:59.
Dopo, la pagina rimanda da sola alla home del sito.

Cosa c'è qui, in ordine:
- `1_PROMPT_PER_LOVABLE.md`: il testo da incollare in Lovable, con i file da caricare.
- `2_GUIDA_STRIPE.md`: come si crea il link di pagamento e come si prova.
- `3_DA_DECIDERE_PRIMA_DEL_1_OTTOBRE.md`: le promesse della pagina che P49 deve confermare. Leggilo per primo.
- `PER_LOVABLE/`: il componente (`src/pages/promo25/`) e le immagini, il video e i font (`public/promo25/`).
- `ANTEPRIMA/`: la pagina già funzionante, con le schermate su iPhone 13. Per vederla sul PC apri un terminale in questa cartella e scrivi `python -m http.server`, poi vai su http://localhost:8000. Aperta col doppio clic il video e i caratteri non sempre si caricano.

v2 del 26/09 pomeriggio: impaginazione rifatta sul modello delle pagine prodotto di Apple (griglia unica centrata, barra fissa in alto con «Preordina», Miky scontornato che non si taglia mai, card tutte uguali). La v1 è in `_superato_v1`.

Il sorgente vero è `PER_LOVABLE/src/pages/promo25/Promo25Page.tsx`: testi, date, prezzi e link stanno tutti nel blocco CONFIG in cima e nelle liste subito sotto.

v3 del 26/09 sera: testi rivisti perché si paga tutto subito. Il bottone dice «Preordina», sotto il prezzo c'è «Paghi oggi l'intero importo», le garanzie si chiamano «Paghi tutto oggi, e fino alla spedizione puoi riaverlo», e fra le domande c'è «Pago tutto subito?». La v2 è in `_superato_v2`.

v4 del 28/09: prezzo protagonista in apertura (scende da 490 a 367,50 appena si apre la pagina, «Risparmi 122,50 €», bordo di luce che gira, conto alla rovescia a data fissa), titolo più piccolo, prezzo sempre visibile nella barra in alto. Video e render animati: Miky con le app in apertura (si inclina seguendo il dito), le tre schede di «Cosa fa» sono video, Miky che gira in «Cosa ricevi», Miky nell'alone ciano in chiusura. Schermo interattivo «Senza Miky / Con Miky». Tre domande sole. La v3 è in `_superato_v3`.
