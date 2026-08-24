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
    hasInteracted = true;
    var flipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", flipped ? "true" : "false");
  }

  function openModal(card, trigger) {
    hasInteracted = true;
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

  // First-visit discovery hint, v1 (expect to iterate): once the first
  // card scrolls into view, briefly preview the flip and pulse the play
  // button so both gestures read as interactive. Fires once; skipped if the
  // user already found either gesture before it would trigger.
  var hasInteracted = false;
  var firstCard = cards[0];
  if (firstCard && "IntersectionObserver" in window) {
    var flipper = firstCard.querySelector(".feature-card-flipper");
    var playBtn = firstCard.querySelector(".feature-card-play");
    var io = new IntersectionObserver(
      function (entries) {
        if (hasInteracted) {
          io.disconnect();
          return;
        }
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.disconnect();
          nudge(flipper);
          nudge(playBtn);
        });
      },
      // rootMargin shrinks the observed area to the top 3/5 of the
      // viewport; threshold: 1 then only fires once the whole card fits
      // inside that region, i.e. fully visible AND scrolled up to 3/5.
      { threshold: 1.0, rootMargin: "0px 0px -40% 0px" },
    );
    io.observe(firstCard);
  }

  function nudge(el) {
    if (!el) return;
    el.classList.add("is-nudging");
    el.addEventListener("animationend", function handler() {
      el.classList.remove("is-nudging");
      el.removeEventListener("animationend", handler);
    });
  }
})();
