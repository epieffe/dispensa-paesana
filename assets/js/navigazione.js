/**
 * navigazione.js
 * Apre e chiude il menu sui telefoni e tiene aggiornato lo stato del pulsante.
 */
(function () {
  "use strict";

  const pulsante = document.querySelector("[data-apri-menu]");
  const menu = document.querySelector("[data-menu]");

  if (!pulsante || !menu) return;

  function chiudi() {
    menu.classList.remove("is-aperta");
    pulsante.setAttribute("aria-expanded", "false");
  }

  pulsante.addEventListener("click", function () {
    const aperto = menu.classList.toggle("is-aperta");
    pulsante.setAttribute("aria-expanded", String(aperto));
  });

  // Chiude il menu dopo aver scelto una voce o premuto Esc.
  menu.addEventListener("click", function (evento) {
    if (evento.target.closest("a")) chiudi();
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") chiudi();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) chiudi();
  });
})();
