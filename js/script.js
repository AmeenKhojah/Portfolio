document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Year in Footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Mobile Nav Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const menuIcon = document.querySelector('.menu-icon');

  // Toggle nav on hamburger click
  if (menuIcon) {
    menuIcon.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuIcon.classList.toggle('active');
      menuToggle.checked = !menuToggle.checked;
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (menuIcon) menuIcon.classList.remove('active');
      menuToggle.checked = false;
    });
  });

  // 3. Carousel
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelectorAll('.carousel-card');
  const instruction = document.getElementById('carousel-instruction');

  // If no carousel or no cards, do nothing
  if (!carousel || carouselCards.length === 0) return;

  const totalCards = carouselCards.length;
  const angleBetweenCards = 360 / totalCards;

  // Start with no offset rotation
  let rotationAngle = 0;
  let selectedIndex = 0;

  // (A) Position the cards based on rotationAngle
  function positionCards() {
    carouselCards.forEach((card, i) => {
      let cardAngle = i * angleBetweenCards + rotationAngle;

      // On iPhone/small devices => smaller circle
      if (window.innerWidth <= 576) {
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(150px)`;
      } else {
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
      }
    });
  }

  // (B) Determine which card is front (best angle) => highlight
  function updateSelectedIndex() {
    let minDiff = Infinity;
    let best = 0;

    for (let i = 0; i < totalCards; i++) {
      let cardAngle = (i * angleBetweenCards + rotationAngle) % 360;
      if (cardAngle < 0) cardAngle += 360;
      // diff from 0 => front facing
      let diff = Math.min(Math.abs(cardAngle), 360 - Math.abs(cardAngle));
      if (diff < minDiff) {
        minDiff = diff;
        best = i;
      }
    }
    selectedIndex = best;
  }

  // (C) Mark the selected card visually
  function highlightSelectedCard() {
    carouselCards.forEach((card, i) => {
      card.classList.toggle('selected', i === selectedIndex);
    });
  }

  // (D) Hide instructions once user interacts
  function hideInstruction() {
    if (instruction && !instruction.classList.contains('fade-out')) {
      instruction.classList.add('fade-out');
      setTimeout(() => {
        instruction.style.visibility = 'hidden';
      }, 1000);
    }
  }

  // Initial setup
  positionCards();
  updateSelectedIndex();
  highlightSelectedCard();

  // Utility to spin forward/back
  function spinForward() {
    rotationAngle -= angleBetweenCards;
    positionCards();
    updateSelectedIndex();
    highlightSelectedCard();
    hideInstruction();
  }
  function spinBackward() {
    rotationAngle += angleBetweenCards;
    positionCards();
    updateSelectedIndex();
    highlightSelectedCard();
    hideInstruction();
  }

  // KEYBOARD
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      spinForward();
    } else if (e.key === 'ArrowLeft') {
      spinBackward();
    } else if (e.key === 'Enter') {
      const card = carouselCards[selectedIndex];
      if (card) {
        alert(`Opening details for: ${
          card.querySelector('h3')?.textContent || 'Project'
        }`);
      }
    }
  });

  // (E) Drag logic for PC from anywhere on the card
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragX = 0;
  let dragY = 0;
  const DRAG_THRESHOLD = 25; // small => easier to spin vs. click

  // Attach MOUSE events to entire .carousel so user can drag from anywhere
  carousel.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dragX = 0;
    dragY = 0;
    hideInstruction();
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragX = e.clientX - startX;
    dragY = e.clientY - startY;
  });

  carousel.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    // Distinguish spin vs. click
    if (
      Math.abs(dragX) > DRAG_THRESHOLD &&
      Math.abs(dragX) > Math.abs(dragY)
    ) {
      if (dragX < 0) spinForward();
      else spinBackward();
    } else {
      // It's a click => see if user clicked on a card
      const target = e.target;
      if (target.classList.contains('carousel-card') ||
          target.closest('.carousel-card')) {
        const card = carouselCards[selectedIndex];
        if (card) {
          alert(`Opening details for: ${
            card.querySelector('h3')?.textContent || 'Project'
          }`);
        }
      }
    }
  });

  // If mouse leaves => no drag
  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // (F) Touch logic (mobile)
  let touchDragging = false;
  let startTouchX = 0;
  let startTouchY = 0;
  let distX = 0;
  let distY = 0;

  carousel.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return; // ignore multi-touch
    touchDragging = true;
    startTouchX = e.touches[0].clientX;
    startTouchY = e.touches[0].clientY;
    distX = 0;
    distY = 0;
    hideInstruction();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (!touchDragging) return;
    distX = e.touches[0].clientX - startTouchX;
    distY = e.touches[0].clientY - startTouchY;

    if (Math.abs(distY) > Math.abs(distX)) {
      // vertical => let page scroll
      return;
    } else {
      e.preventDefault(); // horizontal => spin
    }
  }, { passive: false });

  carousel.addEventListener('touchend', (e) => {
    if (!touchDragging) return;
    touchDragging = false;

    if (
      Math.abs(distX) > DRAG_THRESHOLD &&
      Math.abs(distX) > Math.abs(distY)
    ) {
      if (distX < 0) spinForward();
      else spinBackward();
    } else {
      // treat as click
      const touch = e.changedTouches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elem && (
        elem.classList.contains('carousel-card') ||
        elem.closest('.carousel-card')
      )) {
        const card = carouselCards[selectedIndex];
        if (card) {
          alert(`Opening details for: ${
            card.querySelector('h3')?.textContent || 'Project'
          }`);
        }
      }
    }
  }, { passive: true });

  // ACCESSIBILITY: press Enter on a card
  carouselCards.forEach((card) => {
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        alert(`Opening details for: ${
          card.querySelector('h3')?.textContent || 'Project'
        }`);
      }
    });
  });

  // (G) Reposition on orientation/resize => immediate effect
  window.addEventListener('resize', () => {
    positionCards();
    updateSelectedIndex();
    highlightSelectedCard();
  });
});
