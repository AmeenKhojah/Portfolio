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
  const messageOverlay = document.getElementById('message-overlay'); // New element
  if (!carousel || carouselCards.length === 0) return;

  const totalCards = carouselCards.length;
  const angleBetweenCards = 360 / totalCards;

  let rotationAngle = 0;
  let selectedIndex = 0;

  // Flags for drag and click prevention
  let isDragging = false;
  let clickPrevented = false;

  // Drag threshold increased to 50 to prevent misinterpretation
  const DRAG_THRESHOLD = 50;

  // =========== Position Cards ===========
  function positionCards() {
    carouselCards.forEach((card, i) => {
      let cardAngle = i * angleBetweenCards + rotationAngle;

      // For smaller screens => smaller circle
      if (window.innerWidth <= 576) {
        // Control circle radius on mobile
        card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(150px)`;
      } else {
        card.style.transform = `rotateY(${cardAngle}deg) translateZ(300px)`;
      }
    });
  }

  // =========== Update Selected Card ===========
  function updateSelectedIndex() {
    let minDiff = Infinity;
    let bestIndex_ = 0;

    carouselCards.forEach((_, i) => {
      let rawAngle = i * angleBetweenCards + rotationAngle;
      let cardAngle = ((rawAngle % 360) + 360) % 360; // Normalize 0..360
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

  function showMessage(message) {
    if (!messageOverlay) return;
    messageOverlay.textContent = message;
    messageOverlay.classList.add('show');
    setTimeout(() => {
      messageOverlay.classList.remove('show');
    }, 2000); // Message disappears after 2 seconds
  }

  // Initial Setup
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
        const projectName = activeCard.querySelector('h3')?.textContent || 'Project';
        showMessage(`You clicked on X (${projectName})`);
      }
    }
  });

  // MOUSE DRAG ON PC
  let startX = 0;
  let startY = 0;
  let dragDistX = 0;
  let dragDistY = 0;

  carousel.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = false;
    clickPrevented = false;
    startX = e.clientX;
    startY = e.clientY;
    dragDistX = 0;
    dragDistY = 0;
    hideInstruction();
  });

  carousel.addEventListener('mousemove', (e) => {
    if (e.buttons !== 1) return; // Only track when mouse is pressed
    dragDistX = e.clientX - startX;
    dragDistY = e.clientY - startY;
    if (!isDragging) {
      if (Math.abs(dragDistX) > DRAG_THRESHOLD && Math.abs(dragDistX) > Math.abs(dragDistY)) {
        isDragging = true;
        clickPrevented = true;
      }
    }
  });

  carousel.addEventListener('mouseup', (e) => {
    if (isDragging) {
      if (dragDistX < 0) spinForward();
      else spinBackward();
    } else {
      // Click action
      const elem = e.target.closest('.carousel-card');
      if (elem) {
        const index = Array.from(carouselCards).indexOf(elem);
        if (index !== -1) {
          selectedIndex = index;
          updateSelectedIndex();
          highlightSelectedCard();
          hideInstruction();
          const projectName = elem.querySelector('h3')?.textContent || 'Project';
          showMessage(`You clicked on X (${projectName})`);
        }
      }
    }
    isDragging = false;
  });

  carousel.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // MOBILE TOUCH DRAG
  let touchStartX = 0;
  let touchStartY = 0;
  let diffX = 0;
  let diffY = 0;

  carousel.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return; // ignore multi-touch
    isDragging = false;
    clickPrevented = false;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    diffX = 0;
    diffY = 0;
    hideInstruction();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) return; // ignore multi-touch
    diffX = e.touches[0].clientX - touchStartX;
    diffY = e.touches[0].clientY - touchStartY;

    // If user moves vertically more => allow scroll
    if (Math.abs(diffY) > Math.abs(diffX)) {
      isScrolling = true;
      return;
    } else {
      e.preventDefault(); // horizontal drag
      if (!isDragging && Math.abs(diffX) > DRAG_THRESHOLD) {
        isDragging = true;
        clickPrevented = true;
      }
    }
  }, { passive: false });

  carousel.addEventListener('touchend', (e) => {
    if (isDragging) {
      if (diffX < 0) spinForward();
      else spinBackward();
    } else {
      // Click action
      const touch = e.changedTouches[0];
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const card = elem.closest('.carousel-card');
      if (card) {
        const index = Array.from(carouselCards).indexOf(card);
        if (index !== -1) {
          selectedIndex = index;
          updateSelectedIndex();
          highlightSelectedCard();
          hideInstruction();
          const projectName = card.querySelector('h3')?.textContent || 'Project';
          showMessage(`You clicked on X (${projectName})`);
        }
      }
    }
    isDragging = false;
  }, { passive: true });

  // Accessibility: press Enter on card
  carouselCards.forEach((card) => {
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const projectName = card.querySelector('h3')?.textContent || 'Project';
        showMessage(`You clicked on X (${projectName})`);
      }
    });

    // Attach Click Event Listener to Each Card
    card.addEventListener('click', (e) => {
      if (clickPrevented) return; // Prevent click if it was a drag
      const projectName = card.querySelector('h3')?.textContent || 'Project';
      showMessage(`You clicked on X (${projectName})`);
    });
  });

  // Reposition on orientation/resize => immediate effect
  window.addEventListener('resize', () => {
    positionCards();
    updateSelectedIndex();
    highlightSelectedCard();
  });
});
