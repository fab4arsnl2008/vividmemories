document.addEventListener('DOMContentLoaded', function () {
    // --- Reusable Elements ---
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const closeModalButton = document.getElementById('closeModalButton');

    // --- State Variables ---
    // Collect all image URLs from all gallery sections (works for both Index and Gallery pages)
    const allGalleryImagesElements = document.querySelectorAll('.gallery-item img, .mobile-gallery-image');
    
    // If there are no images, stop the script to prevent errors
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

    // --- Mobile Carousel Initialization ---
    // This generic selector works for both index.html (id="mobile-gallery-carousel") 
    // and gallery.html specific carousels.
    const mobileCarousels = document.querySelectorAll('[id$="-carousel-mobile"], #mobile-gallery-carousel'); 

    mobileCarousels.forEach(carouselContainer => {
        const scrollableCarouselContainer = carouselContainer.querySelector('.mobile-carousel-container');
        // If the inner structure isn't found, skip this container
        if (!scrollableCarouselContainer) return;

        const mobileGalleryImages = Array.from(carouselContainer.querySelectorAll('.mobile-gallery-image'));
        const carouselPrevButton = carouselContainer.querySelector('.mobile-carousel-nav-button.left');
        const carouselNextButton = carouselContainer.querySelector('.mobile-carousel-nav-button.right');

        let currentLocalImageIndex = 0;
        let isDragging = false;
        let startX;
        let scrollLeftStart;
        let autoScrollTimeout;

        function updateCarouselSelectionAndArrows() {
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
        }

        function scrollToMobileImage(index) {
            if (!mobileGalleryImages[index]) return;
            mobileGalleryImages[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
            currentLocalImageIndex = index; 
            updateCarouselSelectionAndArrows(); 
        }

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

        // --- Drag/Swipe Functionality ---

        // 1. MOUSE EVENTS (Already correct - attached to window)
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
                    updateCarouselSelectionAndArrows();
                }, 50);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.clientX;
            const walk = (x - startX);
            scrollableCarouselContainer.scrollLeft = scrollLeftStart - walk;
        });

        // 2. TOUCH EVENTS (UPDATED: Move/End attached to window)
        scrollableCarouselContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            scrollLeftStart = scrollableCarouselContainer.scrollLeft;
        });

        // UPDATED: Attached to window to catch lifts outside the element
        window.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                clearTimeout(autoScrollTimeout);
                autoScrollTimeout = setTimeout(() => {
                    updateCarouselSelectionAndArrows();
                }, 50);
            }
        });

        // UPDATED: Attached to window to allow swiping "off-canvas"
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevents page scrolling while swiping carousel
            const x = e.touches[0].clientX;
            const walk = (x - startX);
            scrollableCarouselContainer.scrollLeft = scrollLeftStart - walk;
        });

        scrollableCarouselContainer.addEventListener('scroll', () => {
            clearTimeout(autoScrollTimeout);
            autoScrollTimeout = setTimeout(() => {
                updateCarouselSelectionAndArrows(); 
            }, 100);
        });

        // Initial update
        if (window.innerWidth < 768) {
            setTimeout(() => {
                updateCarouselSelectionAndArrows();
            }, 100);
        }

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


    // --- Event Listeners (Global Modal) ---
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

    // Attach click listeners to images
    allGalleryImagesElements.forEach((img, index) => {
        img.addEventListener('click', () => openModal(index));
    });
});
