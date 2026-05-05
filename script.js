document.addEventListener('DOMContentLoaded', () => {
    // 1. Hero Particles Animation
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resizeCanvas() {
            width = canvas.width = canvas.parentElement.offsetWidth * 1.4;
            height = canvas.height = canvas.parentElement.offsetHeight * 1.4;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = width / 2 + (Math.random() - 0.5) * (width * 0.9);
                this.y = height / 2 + (Math.random() - 0.5) * (height * 0.9);
                
                this.vx = (Math.random() - 0.5) * 0.15;
                this.vy = (Math.random() - 0.5) * 0.15 - 0.1;
                
                this.radius = Math.random() * 0.4 + 0.2;
                this.baseAlpha = Math.random() * 0.6 + 0.2;
                this.alpha = 0;
                
                this.life = Math.random() * 300 + 200;
                this.age = 0;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.age++;

                if (this.age < 30) {
                    this.alpha = this.baseAlpha * (this.age / 30);
                } else {
                    this.alpha = this.baseAlpha * (1 - (this.age - 30) / (this.life - 30));
                }

                if (this.age >= this.life || this.alpha <= 0) {
                    this.reset();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 85, 255, ${this.alpha})`;
                
                ctx.shadowBlur = 4;
                ctx.shadowColor = `rgba(0, 85, 255, ${this.alpha})`;
                
                ctx.fill();
                ctx.shadowBlur = 0; 
            }
        }

        for (let i = 0; i < 80; i++) {
            const p = new Particle();
            p.age = Math.random() * p.life;
            particles.push(p);
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }

    // 2. Isolated Accordion Logic
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

    // 3. Pricing Toggle Logic
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