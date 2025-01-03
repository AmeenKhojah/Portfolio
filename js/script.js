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

    // Close nav and reset brand position when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuIcon.contains(e.target)) {
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          menuIcon.classList.remove('active');
          menuToggle.checked = false;
        }
      }
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

  // 3) PC Carousel (Untouched)
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelectorAll('.carousel-card');
  const instruction = document.getElementById('carousel-instruction');
  if (carousel && carouselCards.length > 0) {
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
          // 3D carousel removed for mobile; handled separately
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

    // Reposition on orientation/resize => immediate effect
    window.addEventListener('resize', () => {
      positionCards();
      updateSelectedIndex();
      highlightSelectedCard();
    });
  }

  // 4) Revamped Mobile Carousel
  const mobileCarousel = document.querySelector('.mobile-carousel');
  const mobileCards = document.querySelectorAll('.mobile-carousel-card');

  if (mobileCarousel && mobileCards.length > 0) {
    // Click/Tap handling for mobile cards
    mobileCards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        // Prevent click if user is swiping
        if (card.dataset.isSwiping === 'true') {
          // Reset flag
          card.dataset.isSwiping = 'false';
          return;
        }
        alert(`Opening details for: ${card.querySelector('h3')?.textContent || 'Project'}`);
      });

      // Touch handling to distinguish between swipe and tap
      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      let touchEndY = 0;
      let touchMoved = false;

      card.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchMoved = false;
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        if (Math.abs(touchEndX - touchStartX) > 10 || Math.abs(touchEndY - touchStartY) > 10) {
          touchMoved = true;
          card.dataset.isSwiping = 'true';
        }
      }, { passive: true });

      card.addEventListener('touchend', (e) => {
        if (!touchMoved) {
          // It's a tap
          alert(`Opening details for: ${card.querySelector('h3')?.textContent || 'Project'}`);
        }
        // Reset flag
        card.dataset.isSwiping = 'false';
      }, { passive: true });
    });
  }
});
