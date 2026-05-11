document.addEventListener('DOMContentLoaded', () => {

    // 1. Smart Navbar Logic
    const navbar = document.getElementById('smart-navbar');
    let lastScrollY = window.scrollY;
    let isScrolling;

    window.addEventListener('scroll', () => {
        // Hiding/Showing on scroll
        if (window.scrollY > 80) {
            if (window.scrollY > lastScrollY) {
                // Scroll Down
                navbar.classList.add('navbar--hidden');
            } else {
                // Scroll Up
                navbar.classList.remove('navbar--hidden');
            }
        } else {
            // Top of the page
            navbar.classList.remove('navbar--hidden');
        }
        
        lastScrollY = window.scrollY;

        // Display navbar when scrolling stops
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            navbar.classList.remove('navbar--hidden');
        }, 800); 
    });

    // 2. Digital 3D Mountains & Road Generator (Synthwave style)
    const canvas = document.getElementById('mountain-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = document.getElementById('hero-container').offsetHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        let time = 0;
        const speed = 4;
        const spacing = 80;
        const fov = 350; 
        const cols = 60;
        const rows = 35;

        function project(x, y, z) {
            let scale = fov / (fov + z);
            return {
                x: width / 2 + x * scale,
                y: height / 2 + 180 - y * scale
            };
        }

        function getElevation(x, z) {
            let dist = Math.abs(x);
            if (dist < 400) return 0;
            let h = (dist - 400) * 0.55; 
            let n = Math.sin(x * 0.005) * Math.cos(z * 0.005) * 200 + Math.sin(x * 0.02 + z * 0.02) * 50;
            return h + n;
        }

        function animateMountains() {
            ctx.clearRect(0, 0, width, height);
            time += speed; 

            let offsetZ = time % spacing; 
            let absoluteOffsetZ = Math.floor(time / spacing) * spacing;

            let points = [];
            
            for (let z = 0; z < rows; z++) {
                points[z] = [];
                for (let x = 0; x < cols; x++) {
                    let actualX = (x - cols / 2) * spacing;
                    let actualZ = z * spacing - offsetZ; 
                    let absoluteZ = z * spacing + absoluteOffsetZ;

                    let y = getElevation(actualX, absoluteZ);
                    points[z][x] = project(actualX, y, actualZ);
                }
            }

            ctx.lineWidth = 1.2;

            for (let z = 0; z < rows - 1; z++) {
                let alpha = 1 - Math.pow(z / rows, 1.5);
                ctx.strokeStyle = `rgba(0, 85, 255, ${alpha * 0.8})`; 

                ctx.beginPath();
                for (let x = 0; x < cols; x++) {
                    let p = points[z][x];
                    if (x === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            for (let x = 0; x < cols; x++) {
                for (let z = 0; z < rows - 1; z++) {
                    let p1 = points[z][x];
                    let p2 = points[z + 1][x];
                    
                    let alpha = 1 - Math.pow(z / rows, 1.5);
                    let distFromCenter = Math.abs((x - cols/2) * spacing);
                    let isRoadEdge = distFromCenter === 400 || distFromCenter === 480;
                    
                    if (isRoadEdge) {
                        ctx.strokeStyle = `rgba(0, 150, 255, ${alpha})`; 
                        ctx.lineWidth = 2;
                    } else {
                        ctx.strokeStyle = `rgba(0, 85, 255, ${alpha * 0.6})`;
                        ctx.lineWidth = 1;
                    }

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }

            requestAnimationFrame(animateMountains);
        }
        animateMountains();
    }

    // 3. Global Accordion Logic 
    const accordionWrappers = document.querySelectorAll('.accordion-wrapper');
    
    accordionWrappers.forEach(wrapper => {
        const accItems = wrapper.querySelectorAll('.acc-item');
        
        accItems.forEach(item => {
            if (item.classList.contains('active')) {
                const body = item.querySelector('.acc-body');
                body.style.maxHeight = body.scrollHeight + 'px';
            }

            const header = item.querySelector('.acc-header');
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                accItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.acc-body').style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    const body = item.querySelector('.acc-body');
                    body.style.maxHeight = body.scrollHeight + 'px';
                }
            });
        });
    });

    // 4. Pricing Toggle Logic
    const pricingToggle = document.getElementById('pricing-toggle');
    if (pricingToggle) {
        const spans = pricingToggle.querySelectorAll('span');
        const priceAmounts = document.querySelectorAll('.pricing-cards .amount');

        spans.forEach(span => {
            span.addEventListener('click', () => {
                spans.forEach(s => s.classList.remove('active'));
                span.classList.add('active');

                const type = span.getAttribute('data-type');

                priceAmounts.forEach(amount => {
                    if (type === 'monthly') {
                        amount.innerText = amount.getAttribute('data-monthly');
                    } else if (type === 'yearly') {
                        amount.innerText = amount.getAttribute('data-yearly');
                    }
                });
            });
        });
    }
});