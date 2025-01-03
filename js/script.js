document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Year in Footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Mobile Nav Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const menuIcon = document.querySelector('.menu-icon');

  // Ensure checkbox & classes stay in sync
  if (menuIcon) {
    menuIcon.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuIcon.classList.toggle('active');
      menuToggle.checked = !menuToggle.checked;
    });
  }

  // Close mobile menu on nav item click
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

  // No initial offset => start at rotationAngle = 0
  let rotationAngle = 0;
  let selectedIndex = 0;

  function positionCards() {
    carouselCards.forEach((card, i) => {
      const cardAngle = i * angleBetweenCards + rotationAngle;
      // On mobile, rely on left:50% + transform
      if (window.innerWidth <= 576) {
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(300px)`;
      } else {
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
      }
    });
  }

  function updateSelectedIndex() {
    let minDiff = Infinity;
    let bestIndex = 0;
    carouselCards.forEach((_, i) => {
      // Wrap angle in 0..360
      let cardAngle = (i * angleBetweenCards + rotationAngle) % 360;
      if (cardAngle < 0) cardAngle += 360;
      // Closer angle => more front-facing card
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

  // Initial setup
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

  // Distinguish between small click vs big drag; allow vertical scroll
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragDistanceX = 0;
  let dragDistanceY = 0;

  // MOUSE events
  carousel.addEventListener('mousedown', (e) => {
    e.preventDefault(); // prevent text selection
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dragDistanceX = 0;
    dragDistanceY = 0;
    hideInstruction();
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragDistanceX = e.clientX - startX;
    dragDistanceY = e.clientY - startY;
  });

  carousel.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const threshold = 40; // smaller threshold => more sensitive to drag
    if (
      Math.abs(dragDistanceX) > threshold &&
      Math.abs(dragDistanceX) > Math.abs(dragDistanceY)
    ) {
      // Horizontal drag => spin
      if (dragDistanceX < 0) spinForward();
      else spinBackward();
    } else {
      // Small drag => treat as click if user clicked on a card
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
  let isTouching = false;

  carousel.addEventListener('touchstart', (e) => {
    isTouching = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dragDistanceX = 0;
    dragDistanceY = 0;
    hideInstruction();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (!isTouching) return;
    dragDistanceX = e.touches[0].clientX - startX;
    dragDistanceY = e.touches[0].clientY - startY;

    // If vertical movement is bigger => let page scroll
    if (Math.abs(dragDistanceY) > Math.abs(dragDistanceX)) {
      return;
    } else {
      e.preventDefault(); // user is dragging horizontally
    }
  }, { passive: false });

  carousel.addEventListener('touchend', (e) => {
    isTouching = false;
    const threshold = 40;
    if (
      Math.abs(dragDistanceX) > threshold &&
      Math.abs(dragDistanceX) > Math.abs(dragDistanceY)
    ) {
      if (dragDistanceX < 0) spinForward();
      else spinBackward();
    } else {
      // small drag => treat as click
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

  // Recalculate positions on resize (covers orientation changes too)
  window.addEventListener('resize', () => {
    positionCards();
  });
});
