document.addEventListener('DOMContentLoaded', function () {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const closeModalButton = document.getElementById('closeModalButton');
    let currentOverallImageIndex = 0;

    // Select all gallery images from both masonry and mobile carousel
    const allGalleryImages = document.querySelectorAll('#masonry-gallery .gallery-item img, #mobile-gallery-carousel .mobile-gallery-image');
    let imageUrls = [];
    if (allGalleryImages.length > 0) {
        imageUrls = Array.from(allGalleryImages).map(img => img.src);
    }
    

    // Mobile Carousel elements
    const galleryCarouselMobile = document.getElementById('galleryCarouselMobile');
    const innerCarouselMobile = document.getElementById('innerCarouselMobile');
    const mobileGalleryImages = document.querySelectorAll('#innerCarouselMobile .mobile-gallery-image');
    const carouselPrevMobileButton = document.getElementById('carouselPrevMobile');
    const carouselNextMobileButton = document.getElementById('carouselNextMobile');

    let isDragging = false;
    let startX;
    let scrollLeftStart;
    let autoScrollTimeout;

    // Function to update carousel selection and arrow states for mobile carousel
    function updateMobileCarouselSelectionAndArrows() {
        if (!galleryCarouselMobile || !mobileGalleryImages.length) return;

        const carouselCenter = galleryCarouselMobile.scrollLeft + galleryCarouselMobile.offsetWidth / 2;
        let closestImageIndex = 0;
        let minDistance = Infinity;

        mobileGalleryImages.forEach((img, idx) => {
            const imageCenter = img.offsetLeft + img.offsetWidth / 2;
            const distance = Math.abs(imageCenter - carouselCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestImageIndex = idx;
            }
        });

        // Update overall index based on mobile carousel's closest image
        if (mobileGalleryImages[closestImageIndex]) {
            const clickedImgSrc = mobileGalleryImages[closestImageIndex].src;
            currentOverallImageIndex = imageUrls.indexOf(clickedImgSrc);
        }

        if (carouselPrevMobileButton) {
            carouselPrevMobileButton.disabled = galleryCarouselMobile.scrollLeft <= 0;
        }
        if (carouselNextMobileButton) {
            carouselNextMobileButton.disabled = galleryCarouselMobile.scrollLeft + galleryCarouselMobile.offsetWidth >= galleryCarouselMobile.scrollWidth - 1;
        }
    }

    // Function to scroll to an image in the mobile carousel
    function scrollToMobileImage(index) {
        if (!mobileGalleryImages[index]) return;
        mobileGalleryImages[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
        // Update the overall index based on the mobile carousel's image
        const scrolledImgSrc = mobileGalleryImages[index].src;
        currentOverallImageIndex = imageUrls.indexOf(scrolledImgSrc);
    }

    // Event listeners for mobile carousel navigation
    if (carouselNextMobileButton) {
        carouselNextMobileButton.addEventListener('click', () => {
            const currentMobileIndex = Array.from(mobileGalleryImages).findIndex(img => img.src === imageUrls[currentOverallImageIndex]);
            if (currentMobileIndex < mobileGalleryImages.length - 1) {
                scrollToMobileImage(currentMobileIndex + 1);
            }
        });
    }

    if (carouselPrevMobileButton) {
        carouselPrevMobileButton.addEventListener('click', () => {
            const currentMobileIndex = Array.from(mobileGalleryImages).findIndex(img => img.src === imageUrls[currentOverallImageIndex]);
            if (currentMobileIndex > 0) {
                scrollToMobileImage(currentMobileIndex - 1);
            }
        });
    }

    // Mobile carousel drag/swipe functionality
    if (galleryCarouselMobile) {
        galleryCarouselMobile.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            scrollLeftStart = galleryCarouselMobile.scrollLeft;
            galleryCarouselMobile.style.cursor = 'grabbing';
            galleryCarouselMobile.style.userSelect = 'none';
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                galleryCarouselMobile.style.cursor = 'grab';
                galleryCarouselMobile.style.removeProperty('user-select');
                clearTimeout(autoScrollTimeout);
                autoScrollTimeout = setTimeout(() => {
                    updateMobileCarouselSelectionAndArrows();
                }, 50);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.clientX;
            const walk = (x - startX);
            galleryCarouselMobile.scrollLeft = scrollLeftStart - walk;
        });

        galleryCarouselMobile.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            scrollLeftStart = galleryCarouselMobile.scrollLeft;
        });

        galleryCarouselMobile.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                clearTimeout(autoScrollTimeout);
                autoScrollTimeout = setTimeout(() => {
                    updateMobileCarouselSelectionAndArrows();
                }, 50);
            }
        });

        galleryCarouselMobile.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.touches[0].clientX;
            const walk = (x - startX);
            galleryCarouselMobile.scrollLeft = scrollLeftStart - walk;
        });

        galleryCarouselMobile.addEventListener('scroll', () => {
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = setTimeout(() => {
                updateMobileCarouselSelectionAndArrows();
            }, 100);
        });
    }


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
            // If on mobile, scroll the carousel to the corresponding image
            if (window.innerWidth < 768 && mobileGalleryImages[currentOverallImageIndex]) {
                scrollToMobileImage(currentOverallImageIndex);
            }
        }, 300);
    }

    function showNextImage() {
        modalImage.style.opacity = 0;
        setTimeout(() => {
            currentOverallImageIndex = (currentOverallImageIndex + 1) % imageUrls.length;
            modalImage.src = imageUrls[currentOverallImageIndex];
            modalImage.style.opacity = 1;
            // If on mobile, scroll the carousel to the corresponding image
            if (window.innerWidth < 768 && mobileGalleryImages[currentOverallImageIndex]) {
                scrollToMobileImage(currentOverallImageIndex);
            }
        }, 300);
    }

    // **FIX**: Only add listeners if the gallery images and modal exist
    if (allGalleryImages.length > 0) {
        allGalleryImages.forEach((img, index) => {
            img.addEventListener('click', () => openModal(index));
        });
    }

    if (imageModal) {
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
    }

    // Initial update for mobile carousel if visible
    if (window.innerWidth < 768 && galleryCarouselMobile) {
        setTimeout(() => {
            updateMobileCarouselSelectionAndArrows();
        }, 100);
    }

    let lastWindowWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth !== lastWindowWidth) {
            lastWindowWidth = window.innerWidth;
            // Re-evaluate carousel state on resize if applicable
            if (window.innerWidth < 768 && galleryCarouselMobile) {
                updateMobileCarouselSelectionAndArrows();
            }
        }
    });

    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const scrollTopFab = document.getElementById('scrollTopFab');
    // **FIX**: Check if the FAB exists before adding listeners
    if (scrollTopFab) {
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
    }

    const serviceCards = document.querySelectorAll('.service-card');
    // **FIX**: Check if service cards exist on the page
    if (serviceCards.length > 0) {
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
    }

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
            // Check if the menu is open before trying to close it
            const mobileMenu = document.getElementById('mobile-menu-container');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                toggleMobileMenuState(); 
            }
            // The universal smooth scroll handler will take care of the actual scrolling
        });
    });

    // Universal smooth scrolling for all internal anchor links, accounting for fixed header
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            // Make sure it's a valid anchor on the same page
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
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
