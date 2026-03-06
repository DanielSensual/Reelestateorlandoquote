/* ═══════════════════════════════════════════════════════════════
   ReelEstate Orlando — Quote Builder Engine
   Standalone, no dependencies
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── Service Catalog ─────────────────────────────────────────

    const CATEGORIES = {
        filming: {
            label: '🎬 Filming Rates',
            icon: '🎬',
            services: [
                { id: 'half-day-shoot', name: 'Half-Day Shoot (4 hours)', desc: 'Single camera operator', price: 600, mode: 'boolean' },
                { id: 'full-day-shoot', name: 'Full-Day Shoot (8 hours)', desc: 'Single camera operator', price: 1200, mode: 'boolean' },
                { id: 'drone-aerial', name: 'Drone Aerial Coverage', desc: 'FAA Part 107 certified pilot', price: 450, mode: 'boolean' },
                { id: 'twilight-shoot', name: 'Twilight / Golden Hour Shoot', desc: 'Magic hour exterior + interior', price: 350, mode: 'boolean' },
                { id: 'second-operator', name: 'Second Camera Operator', desc: 'Additional angles & coverage', price: 400, mode: 'boolean' },
                { id: 'multi-property', name: 'Multi-Property Package', desc: 'Per additional property', price: 350, mode: 'quantity' },
                { id: 'open-house-film', name: 'Open House Coverage', desc: 'Walk-in to walkthrough capture', price: 300, mode: 'boolean' },
                { id: 'agent-headshot', name: 'Agent Photo / Headshot Session', desc: 'Professional portraits on location', price: 250, mode: 'boolean' },
            ]
        },
        editing: {
            label: '✂️ Editing & Post-Production',
            icon: '✂️',
            services: [
                { id: 'mls-listing', name: 'MLS-Ready Listing Video (60-90s)', desc: '16:9 + 1:1 formats included', price: 500, mode: 'boolean' },
                { id: 'cinematic-walkthrough', name: 'Cinematic Walkthrough', desc: 'Floor plan overlay + transitions', price: 900, mode: 'boolean' },
                { id: 'luxury-hero', name: 'Luxury Hero Film (2-3 min)', desc: 'Full cinematic narrative', price: 1200, mode: 'boolean' },
                { id: 'drone-interior', name: 'Drone-to-Interior Transition Edit', desc: 'Seamless aerial to ground flow', price: 600, mode: 'boolean' },
                { id: 'day-night', name: 'Day-to-Night Transition Edit', desc: 'Dramatic lighting shift', price: 400, mode: 'boolean' },
                { id: 'agent-branded', name: 'Agent Branded Intro + Outro', desc: 'Logo, colors, headshot', price: 350, mode: 'boolean' },
                { id: 'neighborhood', name: 'Neighborhood Lifestyle Montage', desc: 'POI, schools, parks', price: 700, mode: 'boolean' },
                { id: 'virtual-staging', name: 'Virtual Staging Overlay', desc: 'Per room', price: 150, mode: 'quantity' },
                { id: 'raw-footage', name: 'Raw Footage Export', desc: 'All unedited clips delivered', price: 250, mode: 'boolean' },
            ]
        },
        social: {
            label: '📱 Social Media Marketing',
            icon: '📱',
            services: [
                { id: 'ig-reels', name: 'Instagram Reels Pack (3 videos)', desc: 'Vertical + trending audio', price: 450, mode: 'boolean' },
                { id: 'tiktok-series', name: 'TikTok Series (5 videos)', desc: 'Trend-driven property content', price: 600, mode: 'boolean' },
                { id: 'just-listed', name: '"Just Listed" Social Post (15-30s)', desc: 'Quick-turn announcement', price: 200, mode: 'boolean' },
                { id: 'just-sold', name: '"Just Sold" Celebration Reel', desc: 'Celebratory client moment', price: 200, mode: 'boolean' },
                { id: 'agent-intro', name: 'Agent Introduction Reel (30s)', desc: 'Personal brand builder', price: 250, mode: 'boolean' },
                { id: 'market-update', name: 'Market Update Talking Head', desc: 'Per episode', price: 250, mode: 'quantity' },
                { id: 'testimonial', name: 'Client Testimonial Edit', desc: 'Per testimonial', price: 200, mode: 'quantity' },
                { id: 'monthly-content', name: 'Monthly Content Package (12 posts)', desc: 'Full month of content', price: 1200, mode: 'boolean' },
                { id: 'stories-pack', name: 'Stories Content Pack (10 clips)', desc: 'Behind-the-scenes + highlights', price: 350, mode: 'boolean' },
                { id: 'caption-overlays', name: 'Animated Caption Overlays', desc: 'Per video', price: 100, mode: 'quantity' },
            ]
        }
    };

    // ─── State ───────────────────────────────────────────────────

    let activeTab = 'filming';
    const selected = {}; // { serviceId: { qty: 1, price: 500, name: '...' } }

    // ─── DOM Refs ────────────────────────────────────────────────

    const tabsContainer = document.getElementById('tabs');
    const servicesContainer = document.getElementById('services');
    const summaryItems = document.getElementById('summaryItems');
    const summaryEmpty = document.getElementById('summaryEmpty');
    const summaryTotal = document.getElementById('summaryTotal');
    const totalAmount = document.getElementById('totalAmount');
    const payBtn = document.getElementById('payBtn');
    const itemCount = document.getElementById('itemCount');

    // ─── Render Tabs ─────────────────────────────────────────────

    function renderTabs() {
        tabsContainer.innerHTML = '';
        for (const [key, cat] of Object.entries(CATEGORIES)) {
            const btn = document.createElement('button');
            btn.className = 'tab' + (key === activeTab ? ' tab--active' : '');
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                activeTab = key;
                renderTabs();
                renderServices();
            });
            tabsContainer.appendChild(btn);
        }
    }

    // ─── Render Services ─────────────────────────────────────────

    function renderServices() {
        servicesContainer.innerHTML = '';

        const cat = CATEGORIES[activeTab];
        const title = document.createElement('h2');
        title.className = 'category__title';
        title.textContent = cat.label;
        servicesContainer.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'services-grid';

        for (const svc of cat.services) {
            const isSelected = !!selected[svc.id];
            const qty = selected[svc.id]?.qty || 0;

            const row = document.createElement('div');
            row.className = 'service' + (isSelected ? ' service--selected' : '');

            const info = document.createElement('div');
            info.className = 'service__info';
            info.innerHTML = `
                <div class="service__name">${svc.name}</div>
                <div class="service__desc">${svc.desc}</div>
            `;

            const priceEl = document.createElement('div');
            priceEl.className = 'service__price';
            priceEl.textContent = '$' + svc.price.toLocaleString();

            row.appendChild(info);
            row.appendChild(priceEl);

            if (svc.mode === 'quantity') {
                const qtyWrap = document.createElement('div');
                qtyWrap.className = 'service__qty';

                const minus = document.createElement('button');
                minus.className = 'service__qty-btn';
                minus.textContent = '−';
                minus.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (qty > 0) {
                        if (qty === 1) {
                            delete selected[svc.id];
                        } else {
                            selected[svc.id].qty = qty - 1;
                        }
                        renderServices();
                        renderSummary();
                    }
                });

                const val = document.createElement('span');
                val.className = 'service__qty-val';
                val.textContent = qty;

                const plus = document.createElement('button');
                plus.className = 'service__qty-btn';
                plus.textContent = '+';
                plus.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!selected[svc.id]) {
                        selected[svc.id] = { qty: 1, price: svc.price, name: svc.name };
                    } else {
                        selected[svc.id].qty += 1;
                    }
                    renderServices();
                    renderSummary();
                });

                qtyWrap.appendChild(minus);
                qtyWrap.appendChild(val);
                qtyWrap.appendChild(plus);
                row.appendChild(qtyWrap);
            } else {
                const toggle = document.createElement('div');
                toggle.className = 'service__toggle';
                row.appendChild(toggle);

                row.addEventListener('click', () => {
                    if (selected[svc.id]) {
                        delete selected[svc.id];
                    } else {
                        selected[svc.id] = { qty: 1, price: svc.price, name: svc.name };
                    }
                    renderServices();
                    renderSummary();
                });
            }

            grid.appendChild(row);
        }

        servicesContainer.appendChild(grid);
    }

    // ─── Render Summary ──────────────────────────────────────────

    function renderSummary() {
        const entries = Object.values(selected);
        const count = entries.length;
        const total = entries.reduce((sum, s) => sum + (s.price * s.qty), 0);

        itemCount.textContent = count;

        if (count === 0) {
            summaryEmpty.style.display = 'block';
            summaryItems.innerHTML = '';
            summaryTotal.style.display = 'none';
            payBtn.classList.add('pay-btn--disabled');
            payBtn.textContent = 'Select services to continue';
            return;
        }

        summaryEmpty.style.display = 'none';
        summaryTotal.style.display = 'flex';
        payBtn.classList.remove('pay-btn--disabled');
        payBtn.textContent = 'Request Quote via Square →';

        summaryItems.innerHTML = '';
        for (const entry of entries) {
            const li = document.createElement('li');
            li.className = 'summary__item';
            const qtyText = entry.qty > 1 ? ` ×${entry.qty}` : '';
            li.innerHTML = `
                <span class="summary__item-name">${entry.name}${qtyText}</span>
                <span class="summary__item-price">$${(entry.price * entry.qty).toLocaleString()}</span>
            `;
            summaryItems.appendChild(li);
        }

        totalAmount.textContent = '$' + total.toLocaleString();
    }

    // ─── Pay Button ──────────────────────────────────────────────

    payBtn.addEventListener('click', () => {
        const entries = Object.values(selected);
        if (entries.length === 0) return;

        const total = entries.reduce((sum, s) => sum + (s.price * s.qty), 0);
        const deposit = Math.ceil(total * 0.5);

        // Build line items for the Square link note
        const items = entries.map(s => {
            const qtyText = s.qty > 1 ? ` ×${s.qty}` : '';
            return `${s.name}${qtyText}: $${(s.price * s.qty).toLocaleString()}`;
        }).join('\n');

        const subject = encodeURIComponent('ReelEstate Orlando — Video Production Quote');
        const body = encodeURIComponent(
            `Hi ReelEstate Orlando,\n\nI'd like to book the following services:\n\n${items}\n\nEstimated Total: $${total.toLocaleString()}\n\nPlease send me a Square invoice.\n\nThank you!`
        );

        window.open(`mailto:reelestateorlando@gmail.com?subject=${subject}&body=${body}`, '_self');
    });

    // ─── Init ────────────────────────────────────────────────────

    renderTabs();
    renderServices();
    renderSummary();
})();
