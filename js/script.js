/* ========== script.js ========== */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Year in Footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Hamburger Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const menuIcon = document.querySelector('.menu-icon');

  if (menuIcon) {
    menuIcon.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuIcon.classList.toggle('active');
    });
  }

  // Close mobile menu on nav item click
  document.querySelectorAll('.nav-links li a').forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      if (menuIcon) menuIcon.classList.remove('active');
    });
  });

  // 3. Carousel
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelectorAll('.carousel-card');
  const instruction = document.getElementById('carousel-instruction');

  if (!carousel || carouselCards.length === 0) return;

  const totalCards = carouselCards.length;
  const angleBetweenCards = 360 / totalCards;
  let rotationAngle = 0;
  let selectedIndex = 0;

  function positionCards() {
    carouselCards.forEach((card, i) => {
      let cardAngle = i * angleBetweenCards + rotationAngle;

      // On mobile, we rely on left: 50% in CSS plus a partial transform
      // So let's only do rotate/translateZ in JS
      if (window.innerWidth <= 576) {
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(300px)`;
      } else {
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
      }
    });
  }

  function updateSelectedIndex() {
    let minDiff = 9999;
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

  // Initial positioning
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

  // Distinguish between a small "click" vs. a big "drag"
  // Also allow vertical scroll on mobile
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let dragDistanceX = 0;
  let dragDistanceY = 0;

  // MOUSE events (desktop)
  carousel.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    dragDistanceX = 0;
    dragDistanceY = 0;
    hideInstruction();
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    dragDistanceX = e.clientX - startX;
    dragDistanceY = e.clientY - startY;
  });

  carousel.addEventListener('mouseup', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    isDragging = false;

    const threshold = 50;
    // Decide if we spun or not
    if (Math.abs(dragDistanceX) > threshold && 
        Math.abs(dragDistanceX) > Math.abs(dragDistanceY)) {
      // Horizontal drag
      if (dragDistanceX < 0) {
        spinForward();
      } else {
        spinBackward();
      }
    } else {
      // small drag => treat as click ONLY if the user clicked on a card
      const target = e.target;
      if (target.classList.contains('carousel-card') || 
          target.closest('.carousel-card')) {
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

  // TOUCH events (mobile)
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

    // If vertical movement is greater, let the page scroll
    if (Math.abs(dragDistanceY) > Math.abs(dragDistanceX)) {
      return; // do not prevent default; user can scroll
    } else {
      e.preventDefault(); // prevent vertical scroll from interfering with horizontal drag
    }
  }, { passive: false });

carousel.addEventListener('touchend', (e) => {
  isTouching = false;
  const threshold = 50;
  if (Math.abs(dragDistanceX) > threshold && 
      Math.abs(dragDistanceX) > Math.abs(dragDistanceY)) {
    if (dragDistanceX < 0) {
      spinForward();
    } else {
      spinBackward();
    }
  } else {
    const touch = e.changedTouches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const activeCard = carouselCards[selectedIndex];
    if (elem && activeCard && activeCard.contains(elem) && 
        activeCard.classList.contains('selected')) {
      alert(`Opening details for: ${
        activeCard.querySelector('h3')?.textContent || 'Project'
      }`);
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
});
