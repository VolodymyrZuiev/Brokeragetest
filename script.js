document.addEventListener('DOMContentLoaded', () => {

    // --- Управление Прелоадером ---
    const preloader = document.getElementById('preloader');
    
    function removeLoader() {
        if (preloader) {
            preloader.classList.add('hidden');
            document.body.classList.remove('loading');
        }
    }

    const fallbackTimer = setTimeout(removeLoader, 3000);


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


    // 2. WebGL Mapbox/MapLibre Initialization (USA FOCUS + NATIVE GL DOTS)
    const mapContainer = document.getElementById('hero-map-container');
    if (mapContainer && typeof maplibregl !== 'undefined') {
        
        const map = new maplibregl.Map({
            container: 'hero-map-container',
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', 
            // Фокус на США
            center: [-98.5795, 38.8283], 
            zoom: 3.8, 
            pitch: 50, 
            bearing: -15, 
            interactive: false 
        });

        map.on('load', () => {
            
            clearTimeout(fallbackTimer);
            removeLoader();

            // Удаляем все текстовые/символьные слои карты
            map.getStyle().layers.forEach((layer) => {
                if (layer.type === 'symbol') {
                    map.removeLayer(layer.id);
                }
            });

            // Внутренние маршруты по США
            const routes = [
                { start: [-122.414, 37.776], end: [-74.006, 40.712] }, // SF to NY
                { start: [-118.243, 34.052], end: [-87.629, 41.878] }, // LA to Chicago
                { start: [-80.191, 25.761], end: [-122.332, 47.606] }, // Miami to Seattle
                { start: [-95.369, 29.760], end: [-71.058, 42.360] }   // Houston to Boston
            ];

            function getCurve(start, end) {
                const coords = [];
                const segments = 100;
                for(let i = 0; i <= segments; i++) {
                    let t = i / segments;
                    let lng = start[0] + (end[0] - start[0]) * t;
                    let lat = start[1] + (end[1] - start[1]) * t;
                    // Аккуратная дуга для США
                    lat += Math.sin(t * Math.PI) * 4; 
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

                // 2. Движущийся груз (светящаяся точка через WebGL, никаких дефолтных маркеров)
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
                let speed = 0.002 + (Math.random() * 0.002);
                
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
    } else {
        removeLoader();
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