document.addEventListener('DOMContentLoaded', () => {

    // ===== СБРОС ПОЗИЦИИ СКРОЛЛА ПРИ ЗАГРУЗКЕ =====
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP не загружен!');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    console.log('GSAP loaded, starting animations...');

    const isMobile = window.innerWidth <= 768;

    // ===== Анимация первого экрана при загрузке =====
    gsap.fromTo('#heroContent',
        { opacity: 0.3, scale: 0.95 },
        {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.2
        }
    );

    if (isMobile) {
        // ===== МОБИЛЬНАЯ ВЕРСИЯ: последовательное появление при скролле =====
        console.log('Mobile version: sequential scroll animations');

        // 1. Дата появляется первой
        gsap.to('#dateBlock', {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contentFixed',
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });

        // 2. Год появляется после даты
        gsap.to('#dateYear', {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contentFixed',
                start: 'top 65%',
                toggleActions: 'play none none none'
            }
        });

        // 3. Текст появляется после даты
        gsap.to('#textBlock', {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#contentFixed',
                start: 'top 60%',
                toggleActions: 'play none none none'
            }
        });

        // 4. Параграфы появляются по очереди
        gsap.to('.text-paragraph', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#textBlock',
                start: 'top 55%',
                toggleActions: 'play none none none'
            }
        });

        // 5. Название компании
        gsap.to('#companyName', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#companyName',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        // 6. Локация появляется последней
        gsap.to('#location', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#location',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });

    } else {
        // ===== ДЕСКТОПНАЯ ВЕРСИЯ: анимация с нырянием =====
        console.log('Desktop version: dive animation');

        let isReverseBlocked = false;
        let minScrollPosition = 0;

        const mainTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#scrollSpacer',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onUpdate: (self) => {
                    console.log('Scroll progress:', self.progress.toFixed(2));

                    if (self.progress > 0.3 && !isReverseBlocked) {
                        isReverseBlocked = true;
                        minScrollPosition = window.scrollY;
                        console.log('Blocking reverse scroll at position:', minScrollPosition);
                    }
                }
            }
        });

        // Фаза 1 (0-30%): Ныряние первого экрана
        mainTl.to('#heroContent', {
            scale: 40,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut'
        });

        // Скрываем первый экран
        mainTl.to('#heroFixed', {
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            duration: 0.05
        });

        // Показываем второй экран
        mainTl.to('#contentFixed', {
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'auto',
            duration: 0.05
        });

        // Фаза 2 (30-50%): Дата
        mainTl.to('#dateBlock', {
            opacity: 1,
            x: 0,
            duration: 0.2,
            ease: 'power3.out'
        })
            .to('#dateYear', {
                opacity: 1,
                x: 0,
                duration: 0.15,
                ease: 'power3.out'
            }, '-=0.1');

        // Фаза 3 (50-75%): Текст
        mainTl.to('#textBlock', {
            opacity: 1,
            x: 0,
            duration: 0.15,
            ease: 'power3.out'
        })
            .to('.text-paragraph', {
                opacity: 1,
                y: 0,
                duration: 0.15,
                stagger: 0.08,
                ease: 'power3.out'
            }, '-=0.1')
            .to('#companyName', {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: 'power3.out'
            }, '-=0.1');

        // Фаза 4 (75-100%): Локация
        mainTl.to('#location', {
            opacity: 1,
            y: 0,
            duration: 0.25,
            ease: 'power3.out'
        });

        // ===== Блокировка обратного скролла =====
        window.addEventListener('wheel', (e) => {
            if (isReverseBlocked && e.deltaY < 0 && window.scrollY <= minScrollPosition + 50) {
                e.preventDefault();
                window.scrollTo(0, minScrollPosition);
            }
        }, { passive: false });

        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isReverseBlocked) {
                const touchEndY = e.touches[0].clientY;
                const diff = touchStartY - touchEndY;

                if (diff < 0 && window.scrollY <= minScrollPosition + 50) {
                    e.preventDefault();
                    window.scrollTo(0, minScrollPosition);
                }
            }
        }, { passive: false });

        window.addEventListener('keydown', (e) => {
            if (isReverseBlocked && (e.key === 'PageUp' || e.key === 'ArrowUp') && window.scrollY <= minScrollPosition + 50) {
                e.preventDefault();
                window.scrollTo(0, minScrollPosition);
            }
        });
    }

    // ===== Обновление ScrollTrigger при ресайзе =====
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
});