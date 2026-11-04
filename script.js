document.addEventListener('DOMContentLoaded', () => {

    // Сброс позиции скролла при загрузке
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 50);

    // Проверка загрузки GSAP
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP не загружен!');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    console.log('GSAP loaded, starting animations...');

    const isMobile = window.innerWidth <= 768;

    // Анимация первого экрана при загрузке (работает везде)
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
        console.log('Mobile version: CSS handles 100% visibility (GSAP disabled for debugging)');

        // На мобильном мы полностью полагаемся на CSS (opacity: 1 !important),
        // чтобы гарантировать отображение второго экрана без конфликтов с JS.
        // Как только это сработает, мы сможем аккуратно вернуть анимации.

        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 300);

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

        // Фаза 1: Ныряние первого экрана
        mainTl.to('#heroContent', {
            scale: 40,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut'
        });

        mainTl.to('#heroFixed', {
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            duration: 0.05
        });

        mainTl.to('#contentFixed', {
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'auto',
            duration: 0.05
        });

        // Фаза 2: Дата
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

        // Фаза 3: Текст
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

        // Фаза 4: Локация
        mainTl.to('#location', {
            opacity: 1,
            y: 0,
            duration: 0.25,
            ease: 'power3.out'
        });

        // Блокировка обратного скролла на десктопе
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

    // Обновление ScrollTrigger при изменении размера окна
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
});