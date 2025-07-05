document.addEventListener('DOMContentLoaded', function () {
    const galleryCarouselContainer = document.getElementById('galleryCarousel');
    const innerCarousel = document.getElementById('innerCarousel');
    const galleryImages = document.querySelectorAll('#innerCarousel .gallery-image');
    const carouselPrevButton = document.getElementById('carouselPrev');
    const carouselNextButton = document.getElementById('carouselNext');

    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const closeModalButton = document.getElementById('closeModalButton');
    let currentOverallImageIndex = 0;

    const imageUrls = Array.from(galleryImages).map(img => img.src);

    let isDragging = false;
    let startX;
    let scrollLeftStart;
    let autoScrollTimeout;

    function updateCarouselSelectionAndArrows() {
        if (imageModal.classList.contains('active')) {
            return;
        }

        const carouselCenter = galleryCarouselContainer.scrollLeft + galleryCarouselContainer.offsetWidth / 2;
        let closestImageIndex = 0;
        let minDistance = Infinity;

        galleryImages.forEach((img, idx) => {
            const imageCenter = img.offsetLeft + img.offsetWidth / 2;
            const distance = Math.abs(imageCenter - carouselCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestImageIndex = idx;
            }
        });

        currentOverallImageIndex = closestImageIndex;

        carouselPrevButton.disabled = galleryCarouselContainer.scrollLeft <= 0;
        carouselNextButton.disabled = galleryCarouselContainer.scrollLeft + galleryCarouselContainer.offsetWidth >= galleryCarouselContainer.scrollWidth - 1;
    }

    function scrollToImage(index) {
        currentOverallImageIndex = index;
        galleryImages[currentOverallImageIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }

    carouselNextButton.addEventListener('click', () => {
        if (currentOverallImageIndex < galleryImages.length - 1) {
            scrollToImage(currentOverallImageIndex + 1);
        }
    });

    carouselPrevButton.addEventListener('click', () => {
        if (currentOverallImageIndex > 0) {
            scrollToImage(currentOverallImageIndex - 1);
        }
    });

    galleryCarouselContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        scrollLeftStart = galleryCarouselContainer.scrollLeft;
        galleryCarouselContainer.style.cursor = 'grabbing';
        galleryCarouselContainer.style.userSelect = 'none';
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            galleryCarouselContainer.style.cursor = 'grab';
            galleryCarouselContainer.style.removeProperty('user-select');
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = setTimeout(() => {
                updateCarouselSelectionAndArrows();
            }, 50);
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.clientX;
        const walk = (x - startX);
        galleryCarouselContainer.scrollLeft = scrollLeftStart - walk;
    });

    galleryCarouselContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        scrollLeftStart = galleryCarouselContainer.scrollLeft;
    });

    galleryCarouselContainer.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = setTimeout(() => {
                updateCarouselSelectionAndArrows();
            }, 50);
        }
    });

    galleryCarouselContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].clientX;
        const walk = (x - startX);
        galleryCarouselContainer.scrollLeft = scrollLeftStart - walk;
    });

    galleryCarouselContainer.addEventListener('scroll', () => {
        clearTimeout(autoScrollTimeout);
        autoScrollTimeout = setTimeout(() => {
            updateCarouselSelectionAndArrows();
        }, 100);
    });

    function openModal(index) {
        currentOverallImageIndex = index;
        modalImage.style.opacity = 0;
        setTimeout(() => {
            modalImage.src = imageUrls[index];
            modalImage.style.opacity = 1;
        }, 50);

        imageModal.classList.add('active');
        document.body.classList.add('modal-active');
    }

    function closeModal() {
        imageModal.classList.remove('active');
        document.body.classList.remove('modal-active');
    }

    function showPrevImage() {
        modalImage.style.opacity = 0;
        setTimeout(() => {
            currentOverallImageIndex = (currentOverallImageIndex - 1 + imageUrls.length) % imageUrls.length;
            modalImage.src = imageUrls[currentOverallImageIndex];
            modalImage.style.opacity = 1;
            scrollToImage(currentOverallImageIndex);
        }, 300);
    }

    function showNextImage() {
        modalImage.style.opacity = 0;
        setTimeout(() => {
            currentOverallImageIndex = (currentOverallImageIndex + 1) % imageUrls.length;
            modalImage.src = imageUrls[currentOverallImageIndex];
            modalImage.style.opacity = 1;
            scrollToImage(currentOverallImageIndex);
        }, 300);
    }

    galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => openModal(index));
    });

    closeModalButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (imageModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'Escape') {
                closeModal();
            }
        }
    });

    setTimeout(() => {
        updateCarouselSelectionAndArrows();
    }, 100);

    let lastWindowWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth !== lastWindowWidth) {
            lastWindowWidth = window.innerWidth;
            if (galleryImages && galleryImages.length > currentOverallImageIndex && galleryImages[currentOverallImageIndex]) {
                scrollToImage(currentOverallImageIndex);
            }
        }
    });

    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const scrollTopFab = document.getElementById('scrollTopFab');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopFab.classList.add('show');
        } else {
            scrollTopFab.classList.remove('show');
        }
    });

    scrollTopFab.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    const serviceCards = document.querySelectorAll('.service-card');
    let currentlyExpandedCard = null;

    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const content = card.querySelector('.service-card-content');
            if (card.classList.contains('expanded')) {
                card.classList.remove('expanded');
                content.style.maxHeight = '0';
                currentlyExpandedCard = null;
            } else {
                if (currentlyExpandedCard && currentlyExpandedCard !== card) {
                    currentlyExpandedCard.classList.remove('expanded');
                    currentlyExpandedCard.querySelector('.service-card-content').style.maxHeight = '0';
                }
                card.classList.add('expanded');
                setTimeout(() => {
                    content.style.maxHeight = (content.scrollHeight + 30) + 'px';
                }, 10);
                currentlyExpandedCard = card;
            }
        });
    });

    // Mobile menu toggle function
    function toggleMobileMenuState() {
        const mobileMenu = document.getElementById('mobile-menu-container');
        const hamburgerButton = document.getElementById('hamburger-button');
        const closeButton = document.getElementById('close-button');

        if (!mobileMenu || !hamburgerButton || !closeButton) {
            console.error('Mobile menu elements not found!');
            return;
        }

        const isOpen = mobileMenu.classList.contains('open');

        if (isOpen) {
            mobileMenu.classList.remove('open');
            mobileMenu.style.maxHeight = '0';
            hamburgerButton.classList.remove('hidden');
            closeButton.classList.add('hidden');
        } else {
            mobileMenu.classList.add('open');
            // Set max-height after adding 'open' class for correct scrollHeight calculation
            mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
            hamburgerButton.classList.add('hidden');
            closeButton.classList.remove('hidden');
        }
    }

    // Attach event listeners for hamburger and close buttons
    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');

    if (hamburgerButton) {
        hamburgerButton.addEventListener('click', toggleMobileMenuState);
    }
    if (closeButton) {
        closeButton.addEventListener('click', toggleMobileMenuState);
    }

    // Event listeners for mobile menu links (to close menu after navigation)
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu-container .mobile-menu-link');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileMenuState(); // Close the menu when a link is clicked
            // The universal smooth scroll handler will take care of the actual scrolling
        });
    });

    // Universal smooth scrolling for all internal anchor links, accounting for fixed header
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                e.preventDefault(); // Prevent default jump behavior

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const offsetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
