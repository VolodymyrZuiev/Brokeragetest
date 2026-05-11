document.addEventListener('DOMContentLoaded', () => {

    // 1. Smart Navbar Logic
    const navbar = document.getElementById('smart-navbar');
    let lastScrollY = window.scrollY;
    let isScrolling;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            if (window.scrollY > lastScrollY) {
                navbar.classList.add('navbar--hidden');
            } else {
                navbar.classList.remove('navbar--hidden');
            }
        } else {
            navbar.classList.remove('navbar--hidden');
        }
        
        lastScrollY = window.scrollY;

        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            navbar.classList.remove('navbar--hidden');
        }, 800); 
    });

    // 2. WebGL Mapbox/MapLibre Initialization (Global Focus & No Labels)
    const mapContainer = document.getElementById('hero-map-container');
    if (mapContainer && typeof maplibregl !== 'undefined') {
        
        const map = new maplibregl.Map({
            container: 'hero-map-container',
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', 
            center: [-35.0, 42.0], // Атлантика
            zoom: 2.2, 
            pitch: 45, 
            bearing: -10, 
            interactive: false 
        });

        map.on('load', () => {
            
            // Удаляем все текстовые слои (названия стран, городов, улиц), оставляя только чистую карту
            map.getStyle().layers.forEach((layer) => {
                if (layer.type === 'symbol') {
                    map.removeLayer(layer.id);
                }
            });

            // Глобальные маршруты (США <-> Европа + внутренние)
            const routes = [
                { start: [-74.006, 40.712], end: [-0.1276, 51.5072] }, // Нью-Йорк -> Лондон
                { start: [-80.191, 25.761], end: [2.3522, 48.8566] },  // Майами -> Париж
                { start: [-95.369, 29.760], end: [-3.7038, 40.4168] }, // Хьюстон -> Мадрид
                { start: [-87.629, 41.878], end: [8.6821, 50.1109] },  // Чикаго -> Франкфурт
                { start: [-118.243, 34.052], end: [-74.006, 40.712] }, // Лос-Анджелес -> Нью-Йорк
                { start: [-0.1276, 51.5072], end: [12.4924, 41.8902] } // Лондон -> Рим
            ];

            // Создаем красивую дугу из 100 отрезков
            function getCurve(start, end) {
                const coords = [];
                const segments = 100;
                for(let i = 0; i <= segments; i++) {
                    let t = i / segments;
                    let lng = start[0] + (end[0] - start[0]) * t;
                    let lat = start[1] + (end[1] - start[1]) * t;
                    // Изгиб дуги
                    lat += Math.sin(t * Math.PI) * 8; 
                    coords.push([lng, lat]);
                }
                return coords;
            }

            routes.forEach((route, i) => {
                const arc = getCurve(route.start, route.end);
                
                // 1. Линия маршрута
                map.addSource(`route-${i}`, {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': arc
                        }
                    }
                });

                map.addLayer({
                    'id': `route-line-${i}`,
                    'type': 'line',
                    'source': `route-${i}`,
                    'layout': { 'line-join': 'round', 'line-cap': 'round' },
                    'paint': { 
                        'line-color': '#0055ff', 
                        'line-width': 2, 
                        'line-opacity': 0.3 
                    }
                });

                // 2. Движущийся груз (точка)
                map.addSource(`point-${i}`, {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': arc[0]
                        }
                    }
                });

                // Тень (свечение)
                map.addLayer({
                    'id': `point-glow-${i}`,
                    'type': 'circle',
                    'source': `point-${i}`,
                    'paint': {
                        'circle-radius': 12,
                        'circle-color': '#00c6ff',
                        'circle-blur': 1,
                        'circle-opacity': 0.5
                    }
                });

                // Само ядро точки
                map.addLayer({
                    'id': `point-core-${i}`,
                    'type': 'circle',
                    'source': `point-${i}`,
                    'paint': {
                        'circle-radius': 4,
                        'circle-color': '#ffffff'
                    }
                });

                // Анимация
                let counter = Math.random(); 
                let speed = 0.0015 + (Math.random() * 0.002);
                
                function animate() {
                    counter += speed;
                    if (counter > 1) counter = 0;
                    
                    const idx = Math.floor(counter * 100);
                    if(arc[idx]) {
                        map.getSource(`point-${i}`).setData({
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': arc[idx]
                            }
                        });
                    }
                    requestAnimationFrame(animate);
                }
                animate();
            });
        });
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