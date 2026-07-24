document.addEventListener('DOMContentLoaded', function () {
    // --- Contact Form Subject Auto-Fill ---
    const urlParams = new URLSearchParams(window.location.search);
    const subjectParam = urlParams.get('subject');
    if (subjectParam) {
        const subjectInput = document.getElementById('subject');
        if (subjectInput) {
            subjectInput.value = subjectParam;
        }
    }

    // --- Global Elements ---
    const yearSpan = document.getElementById('currentYear');
    const scrollTopFab = document.getElementById('scrollTopFab');
    const header = document.querySelector('header');

    // --- Footer Year ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Scroll-to-Top FAB + Glass Header Scroll Toggle ---
    if (scrollTopFab || header) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            // FAB visibility
            if (scrollTopFab) {
                if (scrollY > 300) {
                    scrollTopFab.classList.add('show');
                } else {
                    scrollTopFab.classList.remove('show');
                }
            }

            // Glass header frosted effect — solid at top, frosted on scroll
            if (header) {
                if (scrollY > 10) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        });

        if (scrollTopFab) {
            scrollTopFab.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // --- Service Cards (Homepage Specific) ---
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
        let currentlyExpandedCard = null;

        serviceCards.forEach(card => {
            // Inject expand affordance — chevron icon
            const headerEl = card.querySelector('.service-card-header');
            if (headerEl && !headerEl.querySelector('.service-card-expand-icon')) {
                const expandIcon = document.createElement('span');
                expandIcon.className = 'service-card-expand-icon';
                expandIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
                headerEl.appendChild(expandIcon);
            }

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

        if (!mobileMenu || !hamburgerButton) {
            return;
        }

        const isOpen = mobileMenu.classList.contains('open');

        if (isOpen) {
            mobileMenu.classList.remove('open');
            mobileMenu.style.maxHeight = '0';
            hamburgerButton.classList.remove('is-active');
        } else {
            mobileMenu.classList.add('open');
            mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
            hamburgerButton.classList.add('is-active');
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

    // --- Scroll Reveal Choreography ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger siblings appearing at the same time
                    const parent = entry.target.parentElement;
                    const siblings = Array.from(parent.querySelectorAll('.scroll-reveal'));
                    const idx = siblings.indexOf(entry.target);
                    const delay = idx * 50; // 50ms stagger between siblings

                    entry.target.style.transitionDelay = `${delay}ms`;
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target); // Fire once — zero ongoing cost
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }
});
