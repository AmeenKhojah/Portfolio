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
  const navBrand = document.querySelector('.nav-brand');

  // Clicking hamburger toggles the nav
  if (menuIcon) {
    menuIcon.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      navLinks.classList.toggle('active');
      menuIcon.classList.toggle('active');
      menuToggle.checked = !menuToggle.checked;

      // Push the nav-brand out when nav is active
      if (navLinks.classList.contains('active')) {
        navBrand.style.transform = 'translateX(-200%)';
      } else {
        navBrand.style.transform = 'translateX(0)';
      }
    });

    // Close nav and reset brand position when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuIcon.contains(e.target)) {
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          menuIcon.classList.remove('active');
          menuToggle.checked = false;
          navBrand.style.transform = 'translateX(0)';
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
      navBrand.style.transform = 'translateX(0)';
    });
  });

  // 3) 3D Carousel (PC and Mobile)
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

        // Adjust translateZ based on screen size
        if (window.innerWidth <= 576) {
          // Smaller translateZ for mobile to fit within screen
          card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(80px)`;
        } else if (window.innerWidth <= 768) {
          // Medium translateZ for tablets
          card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(120px)`;
        } else {
          // Larger translateZ for desktops
          card.style.transform = `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(300px)`;
        }
      });
    }

    // =========== Update Selected Card ===========
    function updateSelectedIndex() {
      let minDiff = Infinity;
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

    // Dragging logic
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

    // TOUCH EVENTS for Mobile Carousel
    let isTouchDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDragDistX = 0;
    let touchDragDistY = 0;

    carousel.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return; // ignore multi-touch
      isTouchDragging = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDragDistX = 0;
      touchDragDistY = 0;
      hideInstruction();
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
      if (!isTouchDragging) return;
      touchDragDistX = e.touches[0].clientX - touchStartX;
      touchDragDistY = e.touches[0].clientY - touchStartY;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      if (!isTouchDragging) return;
      isTouchDragging = false;

      if (
        Math.abs(touchDragDistX) > DRAG_THRESHOLD &&
        Math.abs(touchDragDistX) > Math.abs(touchDragDistY)
      ) {
        if (touchDragDistX < 0) spinForward();
        else spinBackward();
      } else {
        // treat as click/tap on the card
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
  }
});
