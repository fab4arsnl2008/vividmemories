document.addEventListener('DOMContentLoaded', function () {
    // --- Reusable Elements ---
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const closeModalButton = document.getElementById('closeModalButton');

    // --- State Variables ---
    const allGalleryImagesElements = document.querySelectorAll('.gallery-item img, .mobile-gallery-image');
    
    if (allGalleryImagesElements.length === 0) return;

    const imageUrls = Array.from(allGalleryImagesElements).map(img => img.src);
    let currentOverallImageIndex = 0; 

    // --- Modal Functions ---
    function openModal(index) {
        currentOverallImageIndex = index;
        modalImage.style.opacity = 0; 
        setTimeout(() => {
            modalImage.src = imageUrls[currentOverallImageIndex];
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
        }, 300); 
    }

    function showNextImage() {
        modalImage.style.opacity = 0; 
        setTimeout(() => {
            currentOverallImageIndex = (currentOverallImageIndex + 1) % imageUrls.length;
            modalImage.src = imageUrls[currentOverallImageIndex];
            modalImage.style.opacity = 1; 
        }, 300); 
    }

    // ============================================================
    //  PERFORMANCE OPTIMIZED CAROUSEL LOGIC
    // ============================================================

    // 1. Define Global State (The "Active" Drag)
    let activeDragState = null; 
    let autoScrollTimeout = null;

    // 2. Define Global Window Listeners (Only added ONCE)
    
    const handleGlobalMove = (clientX) => {
        if (!activeDragState) return;
        const walk = clientX - activeDragState.startX;
        activeDragState.container.scrollLeft = activeDragState.scrollLeftStart - walk;
    };

    const handleGlobalEnd = () => {
        if (!activeDragState) return;

        // Reset styles
        activeDragState.container.style.cursor = 'grab';
        activeDragState.container.style.removeProperty('user-select');

        // Run the update function specific to the carousel we just dropped
        clearTimeout(autoScrollTimeout);
        autoScrollTimeout = setTimeout(() => {
            if (activeDragState && activeDragState.onDragEnd) {
                activeDragState.onDragEnd();
            }
            // Clear the state
            activeDragState = null;
        }, 50);
    };

    // Attach Mouse Listeners to Window
    window.addEventListener('mousemove', (e) => {
        if (activeDragState) {
            e.preventDefault();
            handleGlobalMove(e.clientX);
        }
    });

    window.addEventListener('mouseup', handleGlobalEnd);

    // Attach Touch Listeners to Window
    window.addEventListener('touchmove', (e) => {
        if (activeDragState) {
            e.preventDefault(); // Prevent scrolling the page while swiping carousel
            handleGlobalMove(e.touches[0].clientX);
        }
    }, { passive: false }); // 'passive: false' allows preventing default

    window.addEventListener('touchend', handleGlobalEnd);


    // 3. Initialize Carousels (The Setup Loop)
    const mobileCarousels = document.querySelectorAll('[id$="-carousel-mobile"], #mobile-gallery-carousel'); 

    mobileCarousels.forEach(carouselContainer => {
        const scrollableCarouselContainer = carouselContainer.querySelector('.mobile-carousel-container');
        if (!scrollableCarouselContainer) return;

        const mobileGalleryImages = Array.from(carouselContainer.querySelectorAll('.mobile-gallery-image'));
        const carouselPrevButton = carouselContainer.querySelector('.mobile-carousel-nav-button.left');
        const carouselNextButton = carouselContainer.querySelector('.mobile-carousel-nav-button.right');

        // Local state for buttons/arrows
        let currentLocalImageIndex = 0;

        // Function to update arrows (passed to global state later)
        const updateCarouselSelectionAndArrows = () => {
            if (!scrollableCarouselContainer || mobileGalleryImages.length === 0) return;

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
            currentLocalImageIndex = closestImageIdx;

            if (carouselPrevButton) {
                carouselPrevButton.disabled = currentLocalImageIndex === 0;
            }
            if (carouselNextButton) {
                carouselNextButton.disabled = currentLocalImageIndex === mobileGalleryImages.length - 1;
            }
        };

        // Arrow Button Logic
        const scrollToMobileImage = (index) => {
            if (!mobileGalleryImages[index]) return;
            mobileGalleryImages[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
            currentLocalImageIndex = index; 
            updateCarouselSelectionAndArrows(); 
        };

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

        // 4. Attach "Start" Listeners to the specific carousel
        // This creates the "Active Drag" object when touched

        const startDrag = (clientX) => {
            activeDragState = {
                container: scrollableCarouselContainer,
                startX: clientX,
                scrollLeftStart: scrollableCarouselContainer.scrollLeft,
                onDragEnd: updateCarouselSelectionAndArrows // Pass the callback!
            };
            scrollableCarouselContainer.style.cursor = 'grabbing';
            scrollableCarouselContainer.style.userSelect = 'none';
        };

        scrollableCarouselContainer.addEventListener('mousedown', (e) => {
            startDrag(e.clientX);
        });

        scrollableCarouselContainer.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientX);
        });

        // Update arrows on scroll (for momentum scrolling)
        scrollableCarouselContainer.addEventListener('scroll', () => {
            // Only run this if we AREN'T currently dragging (to save performance)
            if (!activeDragState) {
                clearTimeout(autoScrollTimeout);
                autoScrollTimeout = setTimeout(() => {
                    updateCarouselSelectionAndArrows(); 
                }, 100);
            }
        });

        // Initial check on load
        if (window.innerWidth < 768) {
            setTimeout(updateCarouselSelectionAndArrows, 100);
        }
        
        // Re-check on resize
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

    // --- Global Modal Listeners ---
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
                if (e.key === 'ArrowLeft') showPrevImage();
                if (e.key === 'ArrowRight') showNextImage();
                if (e.key === 'Escape') closeModal();
            }
        });
    }

    allGalleryImagesElements.forEach((img, index) => {
        img.addEventListener('click', () => openModal(index));
    });
});
