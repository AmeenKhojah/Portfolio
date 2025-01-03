document.addEventListener('DOMContentLoaded', () => {
  // 1) Dynamic Year in the Footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2) Mobile Nav Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const menuIcon = document.querySelector('.menu-icon');

  // Clicking hamburger toggles the nav
  if (menuIcon) {
    menuIcon.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuIcon.classList.toggle('active');
      menuToggle.checked = !menuToggle.checked;
    });
  }

  // Close mobile nav if a link is clicked
  document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (menuIcon) menuIcon.classList.remove('active');
      menuToggle.checked = false;
    });
  });

  // 3) Carousel
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelectorAll('.carousel-card');
  const instruction = document.getElementById('carousel-instruction');
  if (!carousel || carouselCards.length === 0) return;

  const totalCards = carouselCards.length;
  const angleBetweenCards = 360 / totalCards;

  let rotationAngle = 0;
  let selectedIndex = 0;

  // =========== Position Cards ===========
  function positionCards() {
    carouselCards.forEach((card, i) => {
      let cardAngle = i * angleBetweenCards + rotationAngle;

      // For smaller screens => smaller circle
      if (window.innerWidth <= 576) {
        // Tweak 'translateZ(...)' to control circle radius on mobile
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(150px)`;
      } else {
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
      }
    });
  }

  // =========== Update Selected Card ===========
  function updateSelectedIndex() {
    let minDiff = 999999;
    let bestIndex_ = 0;

    carouselCards.forEach((_, i) => {
      let rawAngle = i * angleBetweenCards + rotationAngle;
      let cardAngle = ((rawAngle % 360) + 360) % 360; // normalized 0..360
      let diff = Math.min(Math.abs(cardAngle), 360 - Math.abs(cardAngle));
      if (diff < minDiff) {
        minDiff = diff;
        bestIndex_ = i;
      }
    });
    selectedIndex = bestIndex_;
  }

  function highlightSelectedCard() {
    carouselCards.forEach((card, i) => {
      card.classList.toggle('selected', i === selectedIndex);
    });
  }

  function hideInstruction() {
    if (instruction && !instruction.classList.contains('fade-out')) {
      instruction.classList.add('fade-out');
      setTimeout(() => {
        instruction.style.visibility = 'hidden';
      }, 1000);
    }
  }

  // Initial
  positionCards();
  updateSelectedIndex();
  highlightSelectedCard();

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

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      spinForward();
    } else if (e.key === 'ArrowLeft') {
      spinBackward();
    } else if (e.key === 'Enter') {
      const activeCard = carouselCards[selectedIndex];
      if (activeCard) {
        alert(`Opening details for: ${
          activeCard.querySelector('h3')?.textContent || 'Project'
        }`);
      }
    }
  });

  // MOUSE DRAG ON PC
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragDistX = 0;
  let dragDistY = 0;
  const DRAG_THRESHOLD = 25;

  // We attach pointer events to the entire carousel so you can drag from ANY part of each card
  carousel.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dragDistX = 0;
    dragDistY = 0;
    hideInstruction();
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragDistX = e.clientX - startX;
    dragDistY = e.clientY - startY;
  });

  carousel.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    if (
      Math.abs(dragDistX) > DRAG_THRESHOLD &&
      Math.abs(dragDistX) > Math.abs(dragDistY)
    ) {
      // spin horizontally
      if (dragDistX < 0) spinForward();
      else spinBackward();
    } else {
      // treat as click
      const elem = e.target;
      if (elem.classList.contains('carousel-card') ||
          elem.closest('.carousel-card')) {
        const card = carouselCards[selectedIndex];
        if (card) {
          alert(`Opening details for: ${
            card.querySelector('h3')?.textContent || 'Project'
          }`);
        }
      }
    }
  });

  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // MOBILE TOUCH DRAG
  let isTouchDragging = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let diffX = 0;
  let diffY = 0;

  carousel.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return; // ignore multi-touch
    isTouchDragging = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    diffX = 0;
    diffY = 0;
    hideInstruction();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (!isTouchDragging) return;
    diffX = e.touches[0].clientX - touchStartX;
    diffY = e.touches[0].clientY - touchStartY;

    // If user moves vertically more => allow scroll
    if (Math.abs(diffY) > Math.abs(diffX)) return;
    else e.preventDefault(); // horizontal drag
  }, { passive: false });

  carousel.addEventListener('touchend', (e) => {
    if (!isTouchDragging) return;
    isTouchDragging = false;

    if (
      Math.abs(diffX) > DRAG_THRESHOLD &&
      Math.abs(diffX) > Math.abs(diffY)
    ) {
      if (diffX < 0) spinForward();
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

  // Accessibility: press Enter on card
  carouselCards.forEach((card) => {
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        alert(`Opening details for: ${
          card.querySelector('h3')?.textContent || 'Project'
        }`);
      }
    });
  });

  // Reposition on orientation/resize => immediate effect
  window.addEventListener('resize', () => {
    positionCards();
    updateSelectedIndex();
    highlightSelectedCard();
  });
});
