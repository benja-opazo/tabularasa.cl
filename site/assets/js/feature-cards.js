/* ============================================================
   tabularasa.cl — feature-cards.js

   Two independent interactions on the four "Shipped" feature cards
   (#feature-grid .feature-card.is-flippable — the Roadmap card and the
   trust-section cards reuse .feature-card but opt out, no is-flippable
   class, this file never touches them):

     1. Click/Enter/Space anywhere on a card (except its play button) flips
        it 180° to reveal a GIF of that feature on the back.
     2. The play button opens the SAME gif full-size in a shared modal,
        independent of flip state.

   GIFs live at assets/img/features/<slug>.gif (see docs/decisions/
   feature-media.md for exact filenames) and don't ship with this repo yet —
   if a card's <img> 404s, its `error` handler swaps in a "Demo coming soon"
   fallback instead of a broken-image icon, matching the site's existing
   honest-stub convention (demo-table.js's "coming soon" popovers).
   ============================================================ */
(function () {
  "use strict";

  var grid = document.getElementById("feature-grid");
  var modal = document.getElementById("feature-modal");
  if (!grid || !modal) return;

  var modalMedia = document.getElementById("feature-modal-media");
  var modalGif = document.getElementById("feature-modal-gif");
  var modalTitle = document.getElementById("feature-modal-title");
  var lastFocused = null;

  function markMissing(imgEl, containerEl) {
    imgEl.addEventListener("error", function () {
      containerEl.classList.add("has-no-gif");
    });
  }

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".feature-card.is-flippable"));

  cards.forEach(function (card) {
    var backImg = card.querySelector(".feature-card-gif");
    var back = card.querySelector(".feature-card-back");
    if (backImg && back) markMissing(backImg, back);

    card.addEventListener("click", function (e) {
      if (e.target.closest(".feature-card-play")) return;
      toggleFlip(card);
    });

    card.addEventListener("keydown", function (e) {
      if (e.target !== card) return; // let the nested play <button> handle its own Enter/Space
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip(card);
      }
    });

    var playBtn = card.querySelector(".feature-card-play");
    if (playBtn) {
      playBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openModal(card, playBtn);
      });
    }
  });

  function toggleFlip(card) {
    var flipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", flipped ? "true" : "false");
  }

  function openModal(card, trigger) {
    var gif = card.getAttribute("data-gif") || "";
    var title = card.querySelector("h3");

    modalGif.src = gif;
    modalGif.alt = title ? title.textContent : "";
    modalTitle.textContent = title ? title.textContent : "";
    modalMedia.classList.remove("has-no-gif");
    modalGif.onerror = function () {
      modalMedia.classList.add("has-no-gif");
    };

    lastFocused = trigger;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".feature-modal-close").focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    modalGif.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
    lastFocused = null;
  }

  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-action='close-modal']")) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
})();
