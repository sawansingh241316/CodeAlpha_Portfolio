/**
 * ==========================================================================
 * SAWAN SINGH MOURYA - PORTFOLIO INTERACTIVE LOGIC & THREE.JS ENGINE
 * Stack: HTML5, CSS3, Vanilla JavaScript, Three.js, GSAP
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* --------------------------------------------------------------------------
     * 1. PRELOADER & PROGRESS COUNTER ENGINE
     * -------------------------------------------------------------------------- */
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progressBar');
    const loadPercent = document.getElementById('loadPercent');
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(progressInterval);
            setTimeout(() => {
                if (preloader) preloader.classList.add('fade-out');
                initScrollReveals();
            }, 400);
        }
        if (progressBar) progressBar.style.width = `${currentProgress}%`;
        if (loadPercent) loadPercent.textContent = `${currentProgress}%`;
    }, 60);

    /* --------------------------------------------------------------------------
     * 2. THREE.JS 3D INTERACTIVE HERO BACKGROUND
     * -------------------------------------------------------------------------- */
    const canvasContainer = document.getElementById('threeCanvasContainer');
    let scene, camera, renderer, particleSystem, geometryMesh;
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let isTabActive = true;
    let animationFrameId = null;

    function initThreeJS() {
        if (!canvasContainer || typeof THREE === 'undefined') return;

        // Scene setup
        scene = new THREE.Scene();

        // Camera setup
        camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 300;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        // Create Particles (Constellation / Neural Network effect)
        const particleCount = window.innerWidth < 768 ? 600 : 1400;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorCyan = new THREE.Color(0x00f0ff);
        const colorPurple = new THREE.Color(0x7000ff);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 800;
            positions[i + 1] = (Math.random() - 0.5) * 800;
            positions[i + 2] = (Math.random() - 0.5) * 800;

            const mixedColor = colorCyan.clone().lerp(colorPurple, Math.random());
            colors[i] = mixedColor.r;
            colors[i + 1] = mixedColor.g;
            colors[i + 2] = mixedColor.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create glowing texture using HTML canvas
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.4, 'rgba(0,240,255,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 16, 16);

        const pTexture = new THREE.CanvasTexture(canvas);

        const particlesMaterial = new THREE.PointsMaterial({
            size: 4,
            map: pTexture,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);

        // Add 3D Wireframe Icosahedron Geometry in Center
        const sphereGeo = new THREE.IcosahedronGeometry(75, 2);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        geometryMesh = new THREE.Mesh(sphereGeo, sphereMat);
        geometryMesh.position.set(180, 0, -100);
        scene.add(geometryMesh);

        // Event Listeners
        window.addEventListener('mousemove', onDocumentMouseMove);
        window.addEventListener('resize', onWindowResize);

        // Start animation loop
        animateThreeJS();
    }

    function onDocumentMouseMove(event) {
        targetMouseX = (event.clientX - window.innerWidth / 2) * 0.2;
        targetMouseY = (event.clientY - window.innerHeight / 2) * 0.2;
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animateThreeJS() {
        if (!isTabActive) return;

        animationFrameId = requestAnimationFrame(animateThreeJS);

        // Smooth Mouse Lerp
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        if (particleSystem) {
            particleSystem.rotation.y += 0.001;
            particleSystem.rotation.x += 0.0005;
            particleSystem.position.x = mouseX * 0.5;
            particleSystem.position.y = -mouseY * 0.5;
        }

        if (geometryMesh) {
            geometryMesh.rotation.y -= 0.003;
            geometryMesh.rotation.x += 0.002;
        }

        renderer.render(scene, camera);
    }

    // Tab visibility handling for performance optimization
    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
        if (isTabActive) {
            animateThreeJS();
        } else if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });

    initThreeJS();

    /* --------------------------------------------------------------------------
     * 3. CUSTOM GLOWING CURSOR FOLLOWER
     * -------------------------------------------------------------------------- */
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    let mousePos = { x: 0, y: 0 };
    let ringPos = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;

        if (cursorDot) {
            cursorDot.style.transform = `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) translate(-50%, -50%)`;
        }
    });

    function updateCursorRing() {
        ringPos.x += (mousePos.x - ringPos.x) * 0.15;
        ringPos.y += (mousePos.y - ringPos.y) * 0.15;

        if (cursorRing) {
            cursorRing.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(updateCursorRing);
    }
    updateCursorRing();

    // Hover effect expansion on clickables
    const hoverTargets = document.querySelectorAll('a, button, .magnetic-target, .project-card, .tilt-card');
    hoverTargets.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (cursorRing) cursorRing.classList.add('active-hover');
        });
        element.addEventListener('mouseleave', () => {
            if (cursorRing) cursorRing.classList.remove('active-hover');
        });
    });

    /* --------------------------------------------------------------------------
     * 4. NAVBAR STICKY EFFECT & MOBILE HAMBURGER DRAWER
     * -------------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* --------------------------------------------------------------------------
     * 5. THEME TOGGLE (DARK / LIGHT MODE WITH LOCALSTORAGE)
     * -------------------------------------------------------------------------- */
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('sawan_portfolio_theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('sawan_portfolio_theme', newTheme);

            // Update Three.js particle materials if active
            if (geometryMesh) {
                geometryMesh.material.color.setHex(newTheme === 'dark' ? 0x00f0ff : 0x7000ff);
            }
        });
    }

    /* --------------------------------------------------------------------------
     * 6. SCROLL REVEAL & ACTIVE SECTION OBSERVER
     * -------------------------------------------------------------------------- */
    function initScrollReveals() {
        const revealElements = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right');
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    
                    // Trigger Skill Progress Bars inside section
                    if (entry.target.classList.contains('skills-section') || entry.target.querySelector('.progress-bar-fill')) {
                        animateSkillBars();
                    }

                    // Trigger Stats Counter inside section
                    if (entry.target.classList.contains('about-section') || entry.target.querySelector('.stat-number')) {
                        animateStatCounters();
                    }
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // Active Navigation Highlight on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => navObserver.observe(section));

    /* --------------------------------------------------------------------------
     * 7. COUNT-UP STATS ANIMATION
     * -------------------------------------------------------------------------- */
    let statsAnimated = false;
    function animateStatCounters() {
        if (statsAnimated) return;
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            let count = 0;
            const duration = 1800; // ms
            const step = Math.max(1, Math.floor(target / (duration / 20)));

            const timer = setInterval(() => {
                count += step;
                if (count >= target) {
                    count = target;
                    clearInterval(timer);
                }
                stat.textContent = count;
            }, 20);
        });
        statsAnimated = true;
    }

    function animateSkillBars() {
        const fills = document.querySelectorAll('.progress-bar-fill');
        fills.forEach(fill => {
            const targetWidth = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, 150);
        });
    }

    /* --------------------------------------------------------------------------
     * 8. 3D TILT EFFECT ON CARDS
     * -------------------------------------------------------------------------- */
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    /* --------------------------------------------------------------------------
     * 9. INTERACTIVE PROJECT DETAILS & LIVE API TESTER MODAL
     * -------------------------------------------------------------------------- */
    const projectModal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');

    const projectData = {
        erp: {
            title: "College ERP Management System",
            subtitle: "Full-Stack Educational Institution Platform",
            tags: ["Java", "Spring Boot", "MySQL", "HTML5", "CSS3", "JavaScript"],
            description: "A complete enterprise college management system facilitating administrative workflows, student record tracking, attendance management, examination marksheets, and timetable distribution.",
            features: [
                "Role-Based Access Control (Admin, Faculty, Student)",
                "Automated Attendance Calculator & Monthly Reports",
                "Marksheet Generator with Semester Analytics",
                "Assignment Submission & Feedback Portal",
                "Interactive Timetable Calendar Grid"
            ],
            codeSnippet: `// Spring Boot Controller Example\n@RestController\n@RequestMapping("/api/v1/erp")\npublic class StudentController {\n    @Autowired\n    private StudentService studentService;\n\n    @GetMapping("/students/{id}")\n    public ResponseEntity<StudentDTO> getStudentProfile(@PathVariable Long id) {\n        return ResponseEntity.ok(studentService.getStudentDetails(id));\n    }\n}`
        },
        api: {
            title: "Java Spring Boot REST API Service",
            subtitle: "Interactive Live Endpoint Simulator",
            tags: ["Java 17", "Spring Boot", "Spring Data JPA", "MySQL", "REST"],
            description: "Production-ready backend API service designed with clean architecture, DTO design patterns, exception handlers, and relational JPA mapping.",
            isInteractiveApi: true
        },
        ecommerce: {
            title: "NeoStore E-Commerce & Tech Portal",
            subtitle: "Full-Stack Online Electronics Store",
            tags: ["Java", "Spring Boot", "MySQL", "JavaScript", "Glassmorphic UI"],
            description: "A feature-rich tech storefront offering dynamic product catalog filtering, real-time cart calculations, checkout summary, and order tracking.",
            features: [
                "Interactive Product Search & Price Range Filters",
                "Dynamic LocalStorage Shopping Cart State",
                "Order Summary & Discount Voucher Logic",
                "Responsive Mobile-Optimized Interface"
            ],
            codeSnippet: `// Cart Service Logic\npublic class OrderService {\n    public OrderResponse checkout(CartRequest cart) {\n        BigDecimal total = cart.getItems().stream()\n            .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))\n            .reduce(BigDecimal.ZERO, BigDecimal::add);\n        return new OrderResponse("ORD-" + UUID.randomUUID(), total, "SUCCESS");\n    }\n}`
        }
    };

    function openModal(projectId) {
        const data = projectData[projectId];
        if (!data || !modalBody || !projectModal) return;

        if (data.isInteractiveApi) {
            modalBody.innerHTML = `
                <div class="api-tester-container">
                    <div class="api-tester-header">
                        <h3><i class="fa-solid fa-terminal" style="color: var(--accent-cyan);"></i> ${data.title}</h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Select an HTTP endpoint below to execute a simulated REST request against Sawan's Spring Boot backend engine:</p>
                    </div>

                    <div class="api-endpoints-selector">
                        <button class="endpoint-btn active" data-endpoint="students">GET /api/v1/students/101</button>
                        <button class="endpoint-btn" data-endpoint="courses">GET /api/v1/courses/cs301</button>
                        <button class="endpoint-btn" data-endpoint="attendance">POST /api/v1/attendance/verify</button>
                    </div>

                    <div class="api-console-box">
                        <div class="api-status-bar">
                            <span>HTTP Method: <strong id="apiMethod" style="color: var(--accent-cyan);">GET</strong></span>
                            <span>Status: <span class="status-200">200 OK</span></span>
                            <span>Latency: <span id="apiLatency" style="color: var(--accent-cyan);">12ms</span></span>
                        </div>
                        <pre class="json-response" id="jsonOutput"></pre>
                    </div>
                </div>
            `;
            initApiSimulator();
        } else {
            modalBody.innerHTML = `
                <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 0.4rem;">${data.title}</h2>
                <h4 style="color: var(--accent-cyan); margin-bottom: 1rem; font-weight: 500;">${data.subtitle}</h4>
                <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem;">${data.description}</p>
                
                <h4 style="font-family: var(--font-heading); margin-bottom: 0.8rem;">Key Architecture Features:</h4>
                <ul style="list-style: disc; padding-left: 1.2rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                    ${data.features.map(f => `<li style="margin-bottom: 0.4rem;">${f}</li>`).join('')}
                </ul>

                <h4 style="font-family: var(--font-heading); margin-bottom: 0.8rem;">Backend Implementation Sample:</h4>
                <pre style="background: #04060c; border: 1px solid var(--glass-border); padding: 1.2rem; border-radius: var(--border-radius-md); font-family: var(--font-code); font-size: 0.82rem; color: #a855f7; overflow-x: auto;"><code>${escapeHtml(data.codeSnippet)}</code></pre>
            `;
        }

        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function initApiSimulator() {
        const endpointBtns = document.querySelectorAll('.endpoint-btn');
        const apiMethod = document.getElementById('apiMethod');
        const apiLatency = document.getElementById('apiLatency');
        const jsonOutput = document.getElementById('jsonOutput');

        const responses = {
            students: {
                method: "GET",
                latency: "14ms",
                payload: {
                    status: 200,
                    message: "Student record retrieved successfully",
                    data: {
                        studentId: 101,
                        name: "Sawan Singh Mourya",
                        degree: "B.Tech Computer Science Engineering",
                        institution: "Acropolis Institute of Technology, Indore",
                        skills: ["Java", "Spring Boot", "MySQL", "JavaScript"],
                        academicStatus: "Active / Top Percentile"
                    }
                }
            },
            courses: {
                method: "GET",
                latency: "9ms",
                payload: {
                    status: 200,
                    message: "Course catalog fetched",
                    data: {
                        courseCode: "CS301",
                        courseName: "Advanced Java Full-Stack & Spring Boot",
                        instructor: "Dept of CSE",
                        credits: 4,
                        enrolledStudents: 120
                    }
                }
            },
            attendance: {
                method: "POST",
                latency: "22ms",
                payload: {
                    status: 200,
                    message: "Attendance verification hash verified",
                    data: {
                        transactionId: "TXN-98421045",
                        verificationStatus: "VERIFIED",
                        timestamp: new Date().toISOString(),
                        integrityScore: 0.99
                    }
                }
            }
        };

        function renderEndpoint(key) {
            const item = responses[key];
            if (!item) return;
            if (apiMethod) apiMethod.textContent = item.method;
            if (apiLatency) apiLatency.textContent = item.latency;
            if (jsonOutput) jsonOutput.textContent = JSON.stringify(item.payload, null, 2);
        }

        renderEndpoint('students');

        endpointBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                endpointBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const key = btn.getAttribute('data-endpoint');
                renderEndpoint(key);
            });
        });
    }

    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute('data-project');
            openModal(projectId);
        });
    });

    if (modalCloseBtn && projectModal) {
        modalCloseBtn.addEventListener('click', () => {
            projectModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                projectModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    /* --------------------------------------------------------------------------
     * 10. CONTACT FORM VALIDATION & FEEDBACK
     * -------------------------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('contactName');
            const emailInput = document.getElementById('contactEmail');
            const subjectInput = document.getElementById('contactSubject');
            const messageInput = document.getElementById('contactMessage');

            let isValid = true;

            // Name validation
            if (!nameInput.value.trim()) {
                showError(nameInput, 'nameError');
                isValid = false;
            } else {
                clearError(nameInput, 'nameError');
            }

            // Email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
                showError(emailInput, 'emailError');
                isValid = false;
            } else {
                clearError(emailInput, 'emailError');
            }

            // Subject validation
            if (!subjectInput.value.trim()) {
                showError(subjectInput, 'subjectError');
                isValid = false;
            } else {
                clearError(subjectInput, 'subjectError');
            }

            // Message validation
            if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
                showError(messageInput, 'messageError');
                isValid = false;
            } else {
                clearError(messageInput, 'messageError');
            }

            if (isValid) {
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span>Sending Message...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
                }

                setTimeout(() => {
                    if (formStatus) {
                        formStatus.className = 'form-status-message success';
                        formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, <strong>${escapeHtml(nameInput.value)}</strong>! Your message has been sent successfully. Sawan will get back to you shortly.`;
                    }
                    contactForm.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>`;
                    }
                }, 1200);
            }
        });
    }

    function showError(inputElement, errorId) {
        const parent = inputElement.parentElement;
        if (parent) parent.classList.add('has-error');
    }

    function clearError(inputElement, errorId) {
        const parent = inputElement.parentElement;
        if (parent) parent.classList.remove('has-error');
    }
});
