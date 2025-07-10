document.addEventListener('DOMContentLoaded', function () {
    // --- Reusable Elements ---
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const closeModalButton = document.getElementById('closeModalButton');
    const scrollTopFab = document.getElementById('scrollTopFab');
    const yearSpan = document.getElementById('currentYear');
    // Removed mobile menu related elements from here, as main.js will handle them.
    // const hamburgerButton = document.getElementById('hamburger-button');
    // const closeMenuButton = document.getElementById('close-button');
    // const mobileMenu = document.getElementById('mobile-menu-container');

    // --- State Variables ---
    // Collect all image URLs from all gallery sections for the lightbox
    // This now queries both masonry images and mobile carousel images
    const allGalleryImagesElements = document.querySelectorAll('.gallery-item img, .mobile-gallery-image');
    const imageUrls = Array.from(allGalleryImagesElements).map(img => img.src);
    let currentOverallImageIndex = 0; // This will track the index for the global lightbox

    // --- Modal Functions ---
    function openModal(index) {
        currentOverallImageIndex = index;
        modalImage.style.opacity = 0; // Start fade out
        setTimeout(() => {
            modalImage.src = imageUrls[currentOverallImageIndex];
            modalImage.style.opacity = 1; // Fade in
        }, 50); // Small delay for fade effect

        imageModal.classList.add('active');
        document.body.classList.add('modal-active'); // For blurring background
    }

    function closeModal() {
        imageModal.classList.remove('active');
        document.body.classList.remove('modal-active');
    }

    function showPrevImage() {
        modalImage.style.opacity = 0; // Start fade out
        setTimeout(() => {
            currentOverallImageIndex = (currentOverallImageIndex - 1 + imageUrls.length) % imageUrls.length;
            modalImage.src = imageUrls[currentOverallImageIndex];
            modalImage.style.opacity = 1; // Fade in
        }, 300); // Match CSS transition duration
    }

    function showNextImage() {
        modalImage.style.opacity = 0; // Start fade out
        setTimeout(() => {
            currentOverallImageIndex = (currentOverallImageIndex + 1) % imageUrls.length;
            modalImage.src = imageUrls[currentOverallImageIndex];
            modalImage.style.opacity = 1; // Fade in
        }, 300); // Match CSS transition duration
    }

    // --- Mobile Menu Toggle (Removed from here - now handled solely by main.js) ---
    // function toggleMobileMenuState() { ... }

    // --- Scroll-to-Top FAB ---
    function handleScroll() {
        if (window.scrollY > 300) {
            scrollTopFab.classList.add('show');
        } else {
            scrollTopFab.classList.remove('show');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // --- Mobile Carousel Initialization and Logic (for each carousel section) ---
    const mobileCarousels = document.querySelectorAll('[id$="-carousel-mobile"]'); // Selects all divs ending with -carousel-mobile

    mobileCarousels.forEach(carouselContainer => {
        // Corrected: Target the actual scrollable container for events and scroll properties
        const scrollableCarouselContainer = carouselContainer.querySelector('.mobile-carousel-container');
        const mobileGalleryImages = Array.from(carouselContainer.querySelectorAll('.mobile-gallery-image')); // Convert to array for easier indexing
        const carouselPrevButton = carouselContainer.querySelector('.mobile-carousel-nav-button.left');
        const carouselNextButton = carouselContainer.querySelector('.mobile-carousel-nav-button.right');

        let currentLocalImageIndex = 0; // Local index for THIS carousel
        let isDragging = false;
        let startX;
        let scrollLeftStart;
        let autoScrollTimeout;

        // Function to update carousel selection and arrow states for a specific mobile carousel
        function updateCarouselSelectionAndArrows() {
            if (!scrollableCarouselContainer || mobileGalleryImages.length === 0) return;

            // Determine the closest image to the center of the viewport for this carousel
            const carouselCenter = scrollableCarouselContainer.scrollLeft + scrollableCarouselContainer.offsetWidth / 2;
            let closestImageIdx = 0;
            let minDistance = Infinity;

            mobileGalleryImages.forEach((img, idx) => {
                const imageCenter = img.offsetLeft + img.offsetWidth / 2;
                const distance = Math.abs(imageCenter - carouselCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestImageIdx = idx;
                }
            });
            currentLocalImageIndex = closestImageIdx; // Update local index based on scroll position

            // Update button states for this specific carousel
            if (carouselPrevButton) {
                carouselPrevButton.disabled = currentLocalImageIndex === 0;
            }
            if (carouselNextButton) {
                carouselNextButton.disabled = currentLocalImageIndex === mobileGalleryImages.length - 1;
            }
        }

        // Function to scroll to an image in a specific mobile carousel
        function scrollToMobileImage(index) {
            if (!mobileGalleryImages[index]) return;
            mobileGalleryImages[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
            currentLocalImageIndex = index; // Update local index after scrolling
            updateCarouselSelectionAndArrows(); // Update arrow states after scroll
        }

        // Event listeners for mobile carousel navigation buttons
        if (carouselNextButton) {
            carouselNextButton.addEventListener('click', () => {
                if (currentLocalImageIndex < mobileGalleryImages.length - 1) {
                    scrollToMobileImage(currentLocalImageIndex + 1);
                }
            });
        }

        if (carouselPrevButton) {
            carouselPrevButton.addEventListener('click', () => {
                if (currentLocalImageIndex > 0) {
                    scrollToMobileImage(currentLocalImageIndex - 1);
                }
            });
        }

        // Drag/swipe functionality for this specific carousel
        if (scrollableCarouselContainer) { // Use the corrected scrollable container
            scrollableCarouselContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                scrollLeftStart = scrollableCarouselContainer.scrollLeft;
                scrollableCarouselContainer.style.cursor = 'grabbing';
                scrollableCarouselContainer.style.userSelect = 'none';
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    scrollableCarouselContainer.style.cursor = 'grab';
                    scrollableCarouselContainer.style.removeProperty('user-select');
                    clearTimeout(autoScrollTimeout);
                    autoScrollTimeout = setTimeout(() => {
                        updateCarouselSelectionAndArrows(); // Important: update arrows after drag ends
                    }, 50);
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault(); // Prevent default text selection/dragging
                const x = e.clientX;
                const walk = (x - startX);
                scrollableCarouselContainer.scrollLeft = scrollLeftStart - walk;
            });

            scrollableCarouselContainer.addEventListener('touchstart', (e) => {
                isDragging = true;
                startX = e.touches[0].clientX;
                scrollLeftStart = scrollableCarouselContainer.scrollLeft;
            });

            scrollableCarouselContainer.addEventListener('touchend', () => {
                if (isDragging) {
                    isDragging = false;
                    clearTimeout(autoScrollTimeout);
                    autoScrollTimeout = setTimeout(() => {
                        updateCarouselSelectionAndArrows(); // Important: update arrows after drag ends
                    }, 50);
                }
            });

            scrollableCarouselContainer.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault(); // Crucial to prevent native scrolling and enable custom drag
                const x = e.touches[0].clientX;
                const walk = (x - startX);
                scrollableCarouselContainer.scrollLeft = scrollLeftStart - walk;
            });

            scrollableCarouselContainer.addEventListener('scroll', () => {
                clearTimeout(autoScrollTimeout);
                autoScrollTimeout = setTimeout(() => {
                    updateCarouselSelectionAndArrows(); // Update arrows while scrolling
                }, 100);
            });
        }

        // Initial update for this mobile carousel if visible
        if (window.innerWidth < 768) {
            setTimeout(() => {
                updateCarouselSelectionAndArrows();
            }, 100);
        }

        // Re-evaluate carousel state on resize if applicable for this specific carousel
        let lastWindowWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            if (window.innerWidth !== lastWindowWidth) {
                lastWindowWidth = window.innerWidth;
                if (window.innerWidth < 768) {
                    updateCarouselSelectionAndArrows();
                }
            }
        });
    });


    // --- Event Listeners (Global) ---

    // Modal listeners
    closeModalButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    imageModal.addEventListener('click', (e) => {
        // Close modal if the overlay (background) is clicked
        if (e.target === imageModal) {
            closeModal();
        }
    });

    // Keyboard navigation for modal
    document.addEventListener('keydown', (e) => {
        if (imageModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'Escape') closeModal();
        }
    });

    // Mobile menu listeners (Removed from here - now handled solely by main.js)
    // if (hamburgerButton && closeMenuButton && mobileMenu) {
    //     hamburgerButton.addEventListener('click', toggleMobileMenuState);
    //     closeMenuButton.addEventListener('click', toggleMobileMenuState);
    // }

    // Scroll-to-top listeners
    window.addEventListener('scroll', handleScroll);
    scrollTopFab.addEventListener('click', scrollToTop);

    // Attach click listeners to all gallery images (both masonry and mobile carousel)
    allGalleryImagesElements.forEach((img, index) => {
        img.addEventListener('click', () => openModal(index));
    });

    // Handle scroll-to-section links on gallery.html
    const galleryNavLinks = document.querySelectorAll('.container.mx-auto.px-4 p.text-center.mb-12 a[href^="#gallery-"]');
    const header = document.querySelector('header');

    galleryNavLinks.forEach(link => {
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


    // --- Initialization ---

    // Set the current year in the footer
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
