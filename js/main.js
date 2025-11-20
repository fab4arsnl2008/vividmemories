document.addEventListener('DOMContentLoaded', function () {
    // --- Global Elements ---
    const yearSpan = document.getElementById('currentYear');
    const scrollTopFab = document.getElementById('scrollTopFab');
    const header = document.querySelector('header');

    // --- Footer Year ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Scroll-to-Top FAB ---
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

    // --- Service Cards (Homepage Specific) ---
    const serviceCards = document.querySelectorAll('.service-card');
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

    // --- Mobile Menu Logic ---
    function toggleMobileMenuState() {
        const mobileMenu = document.getElementById('mobile-menu-container');
        const hamburgerButton = document.getElementById('hamburger-button');
        const closeButton = document.getElementById('close-button');

        if (!mobileMenu || !hamburgerButton || !closeButton) {
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
            mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
            hamburgerButton.classList.add('hidden');
            closeButton.classList.remove('hidden');
        }
    }

    const hamburgerButton = document.getElementById('hamburger-button');
    const closeButton = document.getElementById('close-button');

    if (hamburgerButton) hamburgerButton.addEventListener('click', toggleMobileMenuState);
    if (closeButton) closeButton.addEventListener('click', toggleMobileMenuState);

    const mobileMenuLinks = document.querySelectorAll('#mobile-menu-container .mobile-menu-link');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobile-menu-container');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                toggleMobileMenuState(); 
            }
        });
    });

    // --- Universal Smooth Scrolling ---
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault(); 
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
