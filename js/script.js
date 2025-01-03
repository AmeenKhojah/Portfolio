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

  if (menuIcon) {
    menuIcon.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuIcon.classList.toggle('active');
      menuToggle.checked = !menuToggle.checked;
    });
  }

  document.querySelectorAll('.nav-links li a').forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (menuIcon) menuIcon.classList.remove('active');
      menuToggle.checked = false;
    });
  });

  // 3. Carousel
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelectorAll('.carousel-card');
  const instruction = document.getElementById('carousel-instruction');

  if (!carousel || carouselCards.length === 0) return;

  const totalCards = carouselCards.length;
  const angleBetweenCards = 360 / totalCards;

  // Start with no rotation offset
  let rotationAngle = 0;
  let selectedIndex = 0;

  function positionCards() {
    carouselCards.forEach((card, i) => {
      const cardAngle = i * angleBetweenCards + rotationAngle;
      if (window.innerWidth <= 576) {
        // Smaller phones => smaller translateZ & rely on left:50%
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(200px)`;
      } else {
        // Larger screens => bigger circle
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
      }
    });
  }

  function updateSelectedIndex() {
    let minDiff = Infinity;
    let bestIndex = 0;
    carouselCards.forEach((_, i) => {
      let cardAngle = (i * angleBetweenCards + rotationAngle) % 360;
      if (cardAngle < 0) cardAngle += 360;
      const diff = Math.min(Math.abs(cardAngle), 360 - Math.abs(cardAngle));
      if (diff < minDiff) {
        minDiff = diff;
        bestIndex = i;
      }
    });
    selectedIndex = bestIndex;
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

  // Keyboard control
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

  // Distinguish small click vs drag
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragDistanceX = 0;
  let dragDistanceY = 0;
  const DRAG_THRESHOLD = 30; // smaller => easier to spin

  // Attach MOUSE listeners to each card => so we can drag from anywhere
  carouselCards.forEach((card) => {
    card.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      dragDistanceX = 0;
      dragDistanceY = 0;
      hideInstruction();
    });
  });

  // Keep tracking on mousemove over the entire .carousel (so we don't lose events)
  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragDistanceX = e.clientX - startX;
    dragDistanceY = e.clientY - startY;
  });

  carousel.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    if (
      Math.abs(dragDistanceX) > DRAG_THRESHOLD &&
      Math.abs(dragDistanceX) > Math.abs(dragDistanceY)
    ) {
      // horizontal drag => spin
      if (dragDistanceX < 0) spinForward();
      else spinBackward();
    } else {
      // treat as click if target is a card
      const target = e.target;
      if (
        target.classList.contains('carousel-card') ||
        target.closest('.carousel-card')
      ) {
        const activeCard = carouselCards[selectedIndex];
        if (activeCard) {
          alert(`Opening details for: ${
            activeCard.querySelector('h3')?.textContent || 'Project'
          }`);
        }
      }
    }
  });

  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // TOUCH events
  carouselCards.forEach((card) => {
    card.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return; // ignore pinch
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragDistanceX = 0;
      dragDistanceY = 0;
      hideInstruction();
    }, { passive: true });
  });

  carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    dragDistanceX = e.touches[0].clientX - startX;
    dragDistanceY = e.touches[0].clientY - startY;
    // if vertical is bigger => let user scroll
    if (Math.abs(dragDistanceY) > Math.abs(dragDistanceX)) {
      return;
    } else {
      e.preventDefault();
    }
  }, { passive: false });

  carousel.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    if (
      Math.abs(dragDistanceX) > DRAG_THRESHOLD &&
      Math.abs(dragDistanceX) > Math.abs(dragDistanceY)
    ) {
      if (dragDistanceX < 0) spinForward();
      else spinBackward();
    } else {
      // treat as click
      const touch = e.changedTouches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elem && (
        elem.classList.contains('carousel-card') ||
        elem.closest('.carousel-card')
      )) {
        const activeCard = carouselCards[selectedIndex];
        if (activeCard) {
          alert(`Opening details for: ${
            activeCard.querySelector('h3')?.textContent || 'Project'
          }`);
        }
      }
    }
  }, { passive: true });

  // Accessibility: press Enter on a card
  carouselCards.forEach((card) => {
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        alert(`Opening details for: ${
          card.querySelector('h3')?.textContent || 'Project'
        }`);
      }
    });
  });

  // Reposition on resize/orientation => plus recalc selection
  window.addEventListener('resize', () => {
    positionCards();
    updateSelectedIndex();
    highlightSelectedCard();
  });
});
