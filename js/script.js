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
      const cardAngle = i * angleBetweenCards + rotationAngle;
      card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
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

  // DRAG logic (desktop)
  let isDragging = false;
  let startX = 0;
  let dragDistance = 0;

  carousel.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    dragDistance = 0;
    hideInstruction();
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    dragDistance = e.clientX - startX;
  });

  carousel.addEventListener('mouseup', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    isDragging = false;
    const threshold = 50;
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance < 0) {
        spinForward();
      } else {
        spinBackward();
      }
    } else {
      // small drag => click selected
      const activeCard = carouselCards[selectedIndex];
      if (activeCard) {
        alert(`Opening details for: ${
          activeCard.querySelector('h3')?.textContent || 'Project'
        }`);
      }
    }
  });

  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // TOUCH logic (mobile)
  let touchStartX = 0;
  let touchDistance = 0;
  let isTouching = false;

  carousel.addEventListener('touchstart', (e) => {
    isTouching = true;
    touchStartX = e.touches[0].clientX;
    touchDistance = 0;
    hideInstruction();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (!isTouching) return;
    touchDistance = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  carousel.addEventListener('touchend', () => {
    isTouching = false;
    const threshold = 50;
    if (Math.abs(touchDistance) > threshold) {
      if (touchDistance < 0) {
        spinForward();
      } else {
        spinBackward();
      }
    } else {
      // small drag => click selected
      const activeCard = carouselCards[selectedIndex];
      if (activeCard) {
        alert(`Opening details for: ${
          activeCard.querySelector('h3')?.textContent || 'Project'
        }`);
      }
    }
  });

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
