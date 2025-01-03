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
  document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelectorAll('.carousel-card');
  const instruction = document.getElementById('carousel-instruction');
  if (!carousel || carouselCards.length === 0) return;

  const totalCards = carouselCards.length;
  const angleBetweenCards = 360 / totalCards;
  let rotationAngle = 0;
  let selectedIndex = 0;
  let isScrolling = false;

  function positionCards() {
    carouselCards.forEach((card, i) => {
      const cardAngle = i * angleBetweenCards + rotationAngle;
      if (window.innerWidth <= 576) {
        // Center the card properly on mobile
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(150px)`;
      } else {
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
      }
    });
  }

  function updateSelectedIndex() {
    let minDiff = 999999;
    let bestIndex = 0;
    carouselCards.forEach((_, i) => {
      const rawAngle = i * angleBetweenCards + rotationAngle;
      const cardAngle = ((rawAngle % 360) + 360) % 360;
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
      setTimeout(() => instruction.style.visibility = 'hidden', 1000);
    }
  }

  function handleCardClick() {
    const card = carouselCards[selectedIndex];
    if (card) {
      const projectName = card.querySelector('h3')?.textContent || 'Project';
      alert(`You clicked on ${projectName}`);
    }
  }

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

  // Initial setup
  positionCards();
  updateSelectedIndex();
  highlightSelectedCard();

  // Touch handling
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  const DRAG_THRESHOLD = 25;

  carousel.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isScrolling = false;
    hideInstruction();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) return;
    const diffY = e.touches[0].clientY - touchStartY;
    const diffX = e.touches[0].clientX - touchStartX;
    
    if (Math.abs(diffY) > Math.abs(diffX)) {
      isScrolling = true;
      return;
    }
    e.preventDefault();
  }, { passive: false });

  carousel.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 0) return;
    
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (isScrolling) return;

    if (Math.abs(diffX) < DRAG_THRESHOLD && Math.abs(diffY) < DRAG_THRESHOLD) {
      // This was a tap/click
      handleCardClick();
    } else if (Math.abs(diffX) > Math.abs(diffY)) {
      // This was a horizontal swipe
      if (diffX < 0) spinForward();
      else spinBackward();
    }
  }, { passive: true });

  // Mouse handling
  let isDragging = false;
  let startX = 0;
  let dragDistX = 0;

  carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    dragDistX = 0;
    hideInstruction();
    e.preventDefault();
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragDistX = e.clientX - startX;
  });

  carousel.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    if (Math.abs(dragDistX) > DRAG_THRESHOLD) {
      if (dragDistX < 0) spinForward();
      else spinBackward();
    } else {
      handleCardClick();
    }
  });

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') spinForward();
    else if (e.key === 'ArrowLeft') spinBackward();
    else if (e.key === 'Enter') handleCardClick();
  });

  // Handle resize
  window.addEventListener('resize', () => {
    positionCards();
    updateSelectedIndex();
    highlightSelectedCard();
  });
});
