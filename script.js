// =====================================================
// SLIDE-BY-SLIDE CONTROLLER
// Hệ thống điều khiển chuyển cảnh toàn màn hình
// =====================================================

(function() {
    'use strict';

    // ============ CONSTANTS ============
    const ANIM_TIME = 400; // ms
    const WHEEL_COOLDOWN = 500; // ms - Increased for better control
    const MOBILE_BREAKPOINT = 9999; // Disable mobile fallback - always use slide mode
    const TOUCH_THRESHOLD = 50; // Minimum swipe distance

    // ============ STATE ============
    let currentSectionIndex = 0;
    let currentRoadmapStage = 0;
    let currentJobsPage = 0;
    let isAnimating = false;
    let isDesktop = window.innerWidth > MOBILE_BREAKPOINT;
    let viewportHeight = window.innerHeight;
    let isMobile = window.innerWidth <= 900;

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
    const mobileSectionPrevBtn = document.querySelector('.mobile-section-prev');
    const mobileSectionNextBtn = document.querySelector('.mobile-section-next');

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

    // ============ MOBILE SECTION BUTTONS UPDATE ============
    function updateMobileSectionButtons() {
        if (!isMobile) return;
        
        if (mobileSectionPrevBtn) {
            mobileSectionPrevBtn.disabled = currentSectionIndex === 0;
        }
        
        if (mobileSectionNextBtn) {
            mobileSectionNextBtn.disabled = currentSectionIndex === sections.length - 1;
        }
    }

    // ============ SECTION CONTROLLER ============
    function goToSection(index, skipAnimation = false) {
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
            
            // Update mobile section buttons
            updateMobileSectionButtons();
            
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
        } else {
            // Update buttons even when skipping animation
            updateMobileSectionButtons();
        }
    }

    // ============ ROADMAP CONTROLLER ============
    function goToRoadmapStage(index, skipAnimation = false) {
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
        let maxIndex, clampedIndex;
        
        if (isMobile) {
            // Mobile: 12 individual pages (0-11)
            maxIndex = 11;
            clampedIndex = Math.max(0, Math.min(index, maxIndex));
        } else {
            // Desktop: 4 pages (0, 1, 2, 3) with 3 jobs each
            maxIndex = 3;
            clampedIndex = Math.max(0, Math.min(index, maxIndex));
        }
        
        if (clampedIndex === currentJobsPage && !skipAnimation) return;
        
        if (!skipAnimation && isAnimating) return;
        
        currentJobsPage = clampedIndex;
        
        if (!skipAnimation) {
            isAnimating = true;
            body.classList.add('is-animating');
        }
        
        // Use requestAnimationFrame for smooth rendering
        requestAnimationFrame(() => {
            let translateValue;
            if (isMobile) {
                // Mobile: Each page is 100vw
                translateValue = `translate3d(-${clampedIndex * 100}vw, 0, 0)`;
            } else {
                // Desktop: Each page is 100% of viewport
                translateValue = `translate3d(-${clampedIndex * 100}%, 0, 0)`;
            }
            jobsTrack.style.transform = translateValue;
            
            // Update dots
            jobsDots.forEach((dot, i) => {
                let isActive;
                if (isMobile) {
                    // Mobile: dots represent groups of 3 (0-2=dot0, 3-5=dot1, 6-8=dot2, 9-11=dot3)
                    isActive = (i === Math.floor(clampedIndex / 3));
                } else {
                    // Desktop: direct mapping
                    isActive = (i === clampedIndex);
                }
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-selected', isActive);
            });
            
            // Update buttons
            if (jobsPrevBtn) jobsPrevBtn.disabled = clampedIndex === 0;
            if (jobsNextBtn) jobsNextBtn.disabled = clampedIndex === maxIndex;
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
            const maxJobsPage = isMobile ? 11 : 3;
            // Inside jobs
            if (direction > 0) {
                // Scrolling down
                if (currentJobsPage < maxJobsPage) {
                    const nextPage = isMobile ? currentJobsPage + 1 : currentJobsPage + 1;
                    goToJobsPage(nextPage);
                } else {
                    // At last page, go to next section
                    goToSection(currentSectionIndex + 1);
                }
            } else {
                // Scrolling up
                if (currentJobsPage > 0) {
                    const prevPage = isMobile ? currentJobsPage - 1 : currentJobsPage - 1;
                    goToJobsPage(prevPage);
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
        
        const maxJobsPage = isMobile ? 11 : 3;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                if (currentSectionIndex === 1 && currentRoadmapStage < roadmapStages.length - 1) {
                    goToRoadmapStage(currentRoadmapStage + 1);
                } else if (currentSectionIndex === 3 && currentJobsPage < maxJobsPage) {
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

    // ============ TOUCH HANDLER (Mobile Support) ============
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
    }

    function handleTouchEnd(e) {
        if (isAnimating) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndTime = Date.now();
        
        const diffY = touchStartY - touchEndY;
        const diffX = touchStartX - touchEndX;
        const timeDiff = touchEndTime - touchStartTime;
        
        // Ignore if too slow (> 500ms)
        if (timeDiff > 500) return;
        
        // Vertical swipe for sections
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > TOUCH_THRESHOLD) {
            // In roadmap section
            if (currentSectionIndex === 1) {
                if (diffY > 0) {
                    // Swipe up = next
                    if (currentRoadmapStage < roadmapStages.length - 1) {
                        goToRoadmapStage(currentRoadmapStage + 1);
                    } else {
                        goToSection(currentSectionIndex + 1);
                    }
                } else {
                    // Swipe down = prev
                    if (currentRoadmapStage > 0) {
                        goToRoadmapStage(currentRoadmapStage - 1);
                    } else {
                        goToSection(currentSectionIndex - 1);
                    }
                }
                return;
            }
            
            // In jobs section
            if (currentSectionIndex === 3) {
                const maxJobsPage = isMobile ? 11 : 3;
                if (diffY > 0) {
                    // Swipe up = next
                    if (currentJobsPage < maxJobsPage) {
                        goToJobsPage(currentJobsPage + 1);
                    } else {
                        goToSection(currentSectionIndex + 1);
                    }
                } else {
                    // Swipe down = prev
                    if (currentJobsPage > 0) {
                        goToJobsPage(currentJobsPage - 1);
                    } else {
                        goToSection(currentSectionIndex - 1);
                    }
                }
                return;
            }
            
            // Regular sections
            if (diffY > 0) {
                goToSection(currentSectionIndex + 1);
            } else {
                goToSection(currentSectionIndex - 1);
            }
        }
        
        // Horizontal swipe for roadmap and jobs
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > TOUCH_THRESHOLD) {
            if (currentSectionIndex === 1) {
                // Roadmap: swipe left = next, swipe right = prev
                if (diffX > 0) {
                    goToRoadmapStage(currentRoadmapStage + 1);
                } else {
                    goToRoadmapStage(currentRoadmapStage - 1);
                }
            } else if (currentSectionIndex === 3) {
                // Jobs: swipe left = next, swipe right = prev
                if (diffX > 0) {
                    goToJobsPage(currentJobsPage + 1);
                } else {
                    goToJobsPage(currentJobsPage - 1);
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
            if (!isAnimating) {
                goToJobsPage(currentJobsPage - 1);
            }
        });
    }

    if (jobsNextBtn) {
        jobsNextBtn.addEventListener('click', () => {
            if (!isAnimating) {
                goToJobsPage(currentJobsPage + 1);
            }
        });
    }

    jobsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isAnimating) {
                // Desktop: direct page navigation (0, 1, 2, 3)
                // Mobile: navigate to first job of each group (0, 3, 6, 9)
                const targetPage = isMobile ? index * 3 : index;
                goToJobsPage(targetPage);
            }
        });
    });

    // ============ MOBILE SECTION NAVIGATION ============
    if (mobileSectionPrevBtn) {
        mobileSectionPrevBtn.addEventListener('click', () => {
            if (!isAnimating && isMobile) {
                goToSection(currentSectionIndex - 1);
            }
        });
    }

    if (mobileSectionNextBtn) {
        mobileSectionNextBtn.addEventListener('click', () => {
            if (!isAnimating && isMobile) {
                goToSection(currentSectionIndex + 1);
            }
        });
    }

    // ============ RESIZE HANDLER ============
    function handleResize() {
        const wasDesktop = isDesktop;
        const wasMobile = isMobile;
        
        isDesktop = window.innerWidth > MOBILE_BREAKPOINT;
        isMobile = window.innerWidth <= 900;
        
        // Reset jobs page if switching between mobile/desktop
        if (wasMobile !== isMobile) {
            currentJobsPage = 0;
            goToJobsPage(0, true);
        }
        
        // Update viewport height
        viewportHeight = window.innerHeight;
        
        // Always recalculate position on resize
        requestAnimationFrame(() => {
            const translateY = -currentSectionIndex * viewportHeight;
            slidesWrapper.style.transform = `translate3d(0, ${translateY}px, 0)`;
        });
        
        // Update mobile section buttons
        updateMobileSectionButtons();
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

        // Initialize - always use slide mode
        body.style.overflow = 'hidden';
        goToSection(0, true);
        goToRoadmapStage(0, true);
        goToJobsPage(0, true);
        
        // Add event listeners
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyboard);

        // Touch events for mobile
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Resize listener
        window.addEventListener('resize', handleResize);

        // Apply will-change for performance
        slidesWrapper.style.willChange = 'transform';
        roadmapTrack.style.willChange = 'transform';
        jobsTrack.style.willChange = 'transform';
    }

    // ============ START ============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();