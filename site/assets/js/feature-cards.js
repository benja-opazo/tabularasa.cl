// Flip-to-GIF + shared play-button modal on the four "Shipped" feature cards
// (.feature-card.is-flippable only). See docs/decisions/feature-media.md.
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
