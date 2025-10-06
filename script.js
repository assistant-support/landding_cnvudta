// =====================================================
// SLIDE-BY-SLIDE CONTROLLER
// Hệ thống điều khiển chuyển cảnh toàn màn hình
// =====================================================

(function() {
    'use strict';

    // ============ CONSTANTS ============
    const ANIM_TIME = 400; // ms
    const WHEEL_COOLDOWN = 500; // ms - Increased for better control
    const MOBILE_BREAKPOINT = 900; // px

    // ============ STATE ============
    let currentSectionIndex = 0;
    let currentRoadmapStage = 0;
    let currentJobsPage = 0;
    let isAnimating = false;
    let isDesktop = window.innerWidth > MOBILE_BREAKPOINT;
    let viewportHeight = window.innerHeight;

    // ============ DOM ELEMENTS ============
    const body = document.body;
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const sections = ['#hero', '#roadmap-container', '#clubs', '#jobs', '#destination'];
    const roadmapTrack = document.querySelector('.roadmap-track');
    const roadmapStages = document.querySelectorAll('.roadmap-stage');
    const roadmapDots = document.querySelectorAll('.roadmap-nav .nav-dot');
    const jobsTrack = document.querySelector('.jobs-track');
    const jobsPages = document.querySelectorAll('.jobs-page');
    const jobsPrevBtn = document.querySelector('.jobs-prev');
    const jobsNextBtn = document.querySelector('.jobs-next');
    const jobsDots = document.querySelectorAll('.jobs-pagination .jobs-dot');
    const loadingScreen = document.querySelector('.loading-screen');

    // ============ PRELOAD IMAGES ============
    const imagesToPreload = [
        'logo.png',
        'year1.png', 'year2.png', 'year3.png', 'year4.png',
        'job1.png', 'job2.png', 'job3.png', 'job4.png', 'job5.png', 'job6.png',
        'job7.png', 'job8.png', 'job9.png', 'job10.png', 'job11.png', 'job12.png',
        'phimtruongLHU.jpg', 'talab.png', 'lhumedia.jpg'
    ];

    function preloadImages() {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalImages = imagesToPreload.length;
            const timeout = setTimeout(() => resolve(), 1500); // Timeout fallback

            if (totalImages === 0) {
                resolve();
                return;
            }

            imagesToPreload.forEach(src => {
                const img = new Image();
                img.onload = img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        clearTimeout(timeout);
                        resolve();
                    }
                };
                img.src = src;
            });
        });
    }

    // ============ SECTION CONTROLLER ============
    function goToSection(index, skipAnimation = false) {
        if (!isDesktop) return;
        
        const clampedIndex = Math.max(0, Math.min(index, sections.length - 1));
        
        if (clampedIndex === currentSectionIndex && !skipAnimation) return;
        
        if (!skipAnimation && isAnimating) return;
        
        currentSectionIndex = clampedIndex;
        
        if (!skipAnimation) {
            isAnimating = true;
            body.classList.add('is-animating');
        }
        
        // Force reflow before animation
        void slidesWrapper.offsetHeight;
        
        // Use requestAnimationFrame for precise timing
        requestAnimationFrame(() => {
            // Recalculate viewport height to ensure accuracy
            viewportHeight = window.innerHeight;
            const translateY = -clampedIndex * viewportHeight;
            slidesWrapper.style.transform = `translate3d(0, ${translateY}px, 0)`;
            
            // Focus management
            setTimeout(() => {
                const targetSection = document.querySelector(sections[clampedIndex]);
                if (targetSection) {
                    targetSection.focus();
                }
            }, ANIM_TIME / 2);
        });
        
        if (!skipAnimation) {
            setTimeout(() => {
                isAnimating = false;
                body.classList.remove('is-animating');
                
                // Double check position after animation
                requestAnimationFrame(() => {
                    const translateY = -currentSectionIndex * viewportHeight;
                    slidesWrapper.style.transform = `translate3d(0, ${translateY}px, 0)`;
                });
            }, ANIM_TIME);
        }
    }

    // ============ ROADMAP CONTROLLER ============
    function goToRoadmapStage(index, skipAnimation = false) {
        if (!isDesktop) return;
        
        const clampedIndex = Math.max(0, Math.min(index, roadmapStages.length - 1));
        
        if (clampedIndex === currentRoadmapStage && !skipAnimation) return;
        
        if (!skipAnimation && isAnimating) return;
        
        currentRoadmapStage = clampedIndex;
        
        if (!skipAnimation) {
            isAnimating = true;
            body.classList.add('is-animating');
        }
        
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            const translateX = -clampedIndex * 100;
            roadmapTrack.style.transform = `translate3d(${translateX}vw, 0, 0)`;
            
            // Update stage active state
            roadmapStages.forEach((stage, i) => {
                stage.classList.toggle('is-active', i === clampedIndex);
            });
            
            // Update dots
            roadmapDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === clampedIndex);
            });
        });
        
        if (!skipAnimation) {
            setTimeout(() => {
                isAnimating = false;
                body.classList.remove('is-animating');
            }, ANIM_TIME);
        }
    }

    // ============ JOBS PAGINATION CONTROLLER ============
    function goToJobsPage(index, skipAnimation = false) {
        if (!isDesktop) return;
        
        const clampedIndex = Math.max(0, Math.min(index, jobsPages.length - 1));
        
        if (clampedIndex === currentJobsPage && !skipAnimation) return;
        
        if (!skipAnimation && isAnimating) return;
        
        currentJobsPage = clampedIndex;
        
        if (!skipAnimation) {
            isAnimating = true;
            body.classList.add('is-animating');
        }
        
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            const translateX = -clampedIndex * 100;
            jobsTrack.style.transform = `translate3d(${translateX}%, 0, 0)`;
            
            // Update dots
            jobsDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === clampedIndex);
                dot.setAttribute('aria-selected', i === clampedIndex);
            });
            
            // Update buttons
            if (jobsPrevBtn) jobsPrevBtn.disabled = clampedIndex === 0;
            if (jobsNextBtn) jobsNextBtn.disabled = clampedIndex === jobsPages.length - 1;
        });
        
        if (!skipAnimation) {
            setTimeout(() => {
                isAnimating = false;
                body.classList.remove('is-animating');
            }, ANIM_TIME);
        }
    }

    // ============ WHEEL EVENT HANDLER ============
    let wheelCooldown = false;
    let wheelTimeout = null;
    let accumulatedDelta = 0;
    const WHEEL_THRESHOLD = 50; // Minimum delta to trigger action

    function handleWheel(e) {
        if (!isDesktop) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // If animating, ignore all wheel events
        if (isAnimating) return;
        
        // If in cooldown, accumulate but don't act
        if (wheelCooldown) {
            return;
        }
        
        // Accumulate delta
        accumulatedDelta += Math.abs(e.deltaY);
        
        // Clear any existing timeout
        if (wheelTimeout) {
            clearTimeout(wheelTimeout);
        }
        
        // Wait for accumulated delta to reach threshold
        if (accumulatedDelta < WHEEL_THRESHOLD) {
            wheelTimeout = setTimeout(() => {
                accumulatedDelta = 0;
            }, 50);
            return;
        }
        
        // Reset accumulated delta
        accumulatedDelta = 0;
        
        const direction = e.deltaY > 0 ? 1 : -1;
        
        // Set cooldown immediately
        wheelCooldown = true;
        
        // Roadmap section logic
        if (currentSectionIndex === 1) {
            // Inside roadmap
            if (direction > 0) {
                // Scrolling down
                if (currentRoadmapStage < roadmapStages.length - 1) {
                    goToRoadmapStage(currentRoadmapStage + 1);
                } else {
                    // At last stage, go to next section
                    goToSection(currentSectionIndex + 1);
                }
            } else {
                // Scrolling up
                if (currentRoadmapStage > 0) {
                    goToRoadmapStage(currentRoadmapStage - 1);
                } else {
                    // At first stage, go to prev section
                    goToSection(currentSectionIndex - 1);
                }
            }
            wheelTimeout = setTimeout(() => { 
                wheelCooldown = false;
                wheelTimeout = null;
            }, WHEEL_COOLDOWN);
            return;
        }
        
        // Jobs section logic
        if (currentSectionIndex === 3) {
            // Inside jobs
            if (direction > 0) {
                // Scrolling down
                if (currentJobsPage < jobsPages.length - 1) {
                    goToJobsPage(currentJobsPage + 1);
                } else {
                    // At last page, go to next section
                    goToSection(currentSectionIndex + 1);
                }
            } else {
                // Scrolling up
                if (currentJobsPage > 0) {
                    goToJobsPage(currentJobsPage - 1);
                } else {
                    // At first page, go to prev section
                    goToSection(currentSectionIndex - 1);
                }
            }
            wheelTimeout = setTimeout(() => { 
                wheelCooldown = false;
                wheelTimeout = null;
            }, WHEEL_COOLDOWN);
            return;
        }
        
        // Regular sections
        goToSection(currentSectionIndex + direction);
        wheelTimeout = setTimeout(() => { 
            wheelCooldown = false;
            wheelTimeout = null;
        }, WHEEL_COOLDOWN);
    }

    // ============ KEYBOARD HANDLER ============
    function handleKeyboard(e) {
        if (!isDesktop || isAnimating) return;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                if (currentSectionIndex === 1 && currentRoadmapStage < roadmapStages.length - 1) {
                    goToRoadmapStage(currentRoadmapStage + 1);
                } else if (currentSectionIndex === 3 && currentJobsPage < jobsPages.length - 1) {
                    goToJobsPage(currentJobsPage + 1);
                } else {
                    goToSection(currentSectionIndex + 1);
                }
                break;
                
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                if (currentSectionIndex === 1 && currentRoadmapStage > 0) {
                    goToRoadmapStage(currentRoadmapStage - 1);
                } else if (currentSectionIndex === 3 && currentJobsPage > 0) {
                    goToJobsPage(currentJobsPage - 1);
                } else {
                    goToSection(currentSectionIndex - 1);
                }
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                if (currentSectionIndex === 1) {
                    goToRoadmapStage(currentRoadmapStage - 1);
                } else if (currentSectionIndex === 3) {
                    goToJobsPage(currentJobsPage - 1);
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                if (currentSectionIndex === 1) {
                    goToRoadmapStage(currentRoadmapStage + 1);
                } else if (currentSectionIndex === 3) {
                    goToJobsPage(currentJobsPage + 1);
                }
                break;
                
            case 'Home':
                e.preventDefault();
                goToSection(0);
                break;
                
            case 'End':
                e.preventDefault();
                goToSection(sections.length - 1);
                break;
        }
    }

    // ============ TOUCH HANDLER (Mobile fallback) ============
    let touchStartY = 0;
    let touchStartX = 0;

    function handleTouchStart(e) {
        if (isDesktop) return;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchEnd(e) {
        if (isDesktop) return;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const diffY = touchStartY - touchEndY;
        const diffX = touchStartX - touchEndX;
        
        // Horizontal swipe in jobs section
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const jobsSection = document.querySelector('#jobs');
            if (jobsSection && isInViewport(jobsSection)) {
                if (diffX > 0 && currentJobsPage < jobsPages.length - 1) {
                    goToJobsPage(currentJobsPage + 1, true);
                } else if (diffX < 0 && currentJobsPage > 0) {
                    goToJobsPage(currentJobsPage - 1, true);
                }
            }
        }
    }

    function isInViewport(elem) {
        const rect = elem.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }

    // ============ ROADMAP DOT NAVIGATION ============
    roadmapDots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isDesktop || isAnimating) return;
            goToRoadmapStage(index);
        });
    });

    // ============ JOBS NAVIGATION ============
    if (jobsPrevBtn) {
        jobsPrevBtn.addEventListener('click', () => {
            if (!isAnimating) goToJobsPage(currentJobsPage - 1);
        });
    }

    if (jobsNextBtn) {
        jobsNextBtn.addEventListener('click', () => {
            if (!isAnimating) goToJobsPage(currentJobsPage + 1);
        });
    }

    jobsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isAnimating) goToJobsPage(index);
        });
    });

    // ============ RESIZE HANDLER ============
    function handleResize() {
        const wasDesktop = isDesktop;
        isDesktop = window.innerWidth > MOBILE_BREAKPOINT;
        
        // Update viewport height
        viewportHeight = window.innerHeight;
        
        if (wasDesktop !== isDesktop) {
            if (isDesktop) {
                // Switch to desktop mode
                body.style.overflow = 'hidden';
                goToSection(0, true);
                goToRoadmapStage(0, true);
                goToJobsPage(0, true);
            } else {
                // Switch to mobile mode
                body.style.overflow = '';
                slidesWrapper.style.transform = '';
                roadmapTrack.style.transform = '';
                jobsTrack.style.transform = '';
                roadmapStages.forEach(stage => stage.classList.add('is-active'));
            }
        } else if (isDesktop) {
            // Recalculate position on resize in desktop mode
            requestAnimationFrame(() => {
                const translateY = -currentSectionIndex * viewportHeight;
                slidesWrapper.style.transform = `translate3d(0, ${translateY}px, 0)`;
            });
        }
    }

    // ============ INITIALIZATION ============
    async function init() {
        // Show loading screen
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }

        // Preload images
        await preloadImages();

        // Hide loading screen
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }

        // Initialize based on screen size
        if (isDesktop) {
            body.style.overflow = 'hidden';
            goToSection(0, true);
            goToRoadmapStage(0, true);
            goToJobsPage(0, true);
            
            // Add event listeners for desktop
            window.addEventListener('wheel', handleWheel, { passive: false });
            window.addEventListener('keydown', handleKeyboard);
        } else {
            // Mobile: show all stages as active
            roadmapStages.forEach(stage => stage.classList.add('is-active'));
            jobsTrack.style.transform = '';
        }

        // Touch events (for mobile swipe)
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Resize listener
        window.addEventListener('resize', handleResize);

        // Apply will-change for performance
        if (isDesktop) {
            slidesWrapper.style.willChange = 'transform';
            roadmapTrack.style.willChange = 'transform';
            jobsTrack.style.willChange = 'transform';
        }
    }

    // ============ START ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();