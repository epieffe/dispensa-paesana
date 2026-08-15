/**
 * utilita.js
 * Due ritocchi minimi: l'anno corrente nel piè di pagina e la comparsa
 * graduale dei blocchi marcati con data-rivela mentre si scorre la pagina.
 * Se JavaScript è disattivato la pagina resta comunque leggibile.
 */
(function () {
  "use strict";

  document.querySelectorAll("[data-anno]").forEach(function (elemento) {
    elemento.textContent = String(new Date().getFullYear());
  });

  const blocchi = document.querySelectorAll("[data-rivela]");
  if (!blocchi.length) return;

  const motoRidotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (motoRidotto || !("IntersectionObserver" in window)) {
    blocchi.forEach(function (blocco) {
      blocco.classList.add("is-visibile");
    });
    return;
  }

  blocchi.forEach(function (blocco) {
    blocco.classList.add("rivela");
  });

  const osservatore = new IntersectionObserver(
    function (voci) {
      voci.forEach(function (voce) {
        if (!voce.isIntersecting) return;
        voce.target.classList.add("is-visibile");
        osservatore.unobserve(voce.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );

  blocchi.forEach(function (blocco) {
    osservatore.observe(blocco);
  });
})();
