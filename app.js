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
                { id: 'hourly-rate', name: 'Hourly Filming Rate', desc: '$150/hr — single camera operator', price: 150, mode: 'quantity' },
                { id: 'half-day-shoot', name: 'Half-Day Shoot (4 hours)', desc: 'Single camera operator', price: 600, mode: 'boolean' },
                { id: 'full-day-shoot', name: 'Full-Day Shoot (8 hours)', desc: 'Single camera operator', price: 1200, mode: 'boolean' },
                { id: 'drone-aerial', name: 'Drone Aerial Coverage', desc: 'FAA Part 107 certified pilot', price: 250, mode: 'boolean' },
                { id: 'twilight-shoot', name: 'Twilight / Golden Hour Shoot', desc: 'Magic hour exterior + interior', price: 200, mode: 'boolean' },
                { id: 'second-operator', name: 'Second Camera Operator', desc: 'Additional angles & coverage', price: 200, mode: 'boolean' },
                { id: 'multi-property', name: 'Multi-Property Package', desc: 'Per additional property', price: 200, mode: 'quantity' },
                { id: 'open-house-film', name: 'Open House Coverage', desc: 'Walk-in to walkthrough capture', price: 175, mode: 'boolean' },
                { id: 'agent-headshot', name: 'Agent Photo / Headshot Session', desc: 'Professional portraits on location', price: 150, mode: 'boolean' },
                { id: 'travel-local', name: 'Travel Fee (within 100 miles)', desc: 'Orlando metro area', price: 60, mode: 'boolean' },
                { id: 'travel-extended', name: 'Travel Fee (100+ miles)', desc: 'Beyond Orlando metro', price: 150, mode: 'boolean' },
            ]
        },
        editing: {
            label: '✂️ Editing & Post-Production',
            icon: '✂️',
            services: [
                { id: 'mls-listing', name: 'MLS-Ready Listing Video (60-90s)', desc: '16:9 + 1:1 formats included', price: 300, mode: 'boolean' },
                { id: 'cinematic-walkthrough', name: 'Cinematic Walkthrough', desc: 'Floor plan overlay + transitions', price: 500, mode: 'boolean' },
                { id: 'luxury-hero', name: 'Luxury Hero Film (2-3 min)', desc: 'Full cinematic narrative', price: 750, mode: 'boolean' },
                { id: 'drone-interior', name: 'Drone-to-Interior Transition Edit', desc: 'Seamless aerial to ground flow', price: 350, mode: 'boolean' },
                { id: 'day-night', name: 'Day-to-Night Transition Edit', desc: 'Dramatic lighting shift', price: 250, mode: 'boolean' },
                { id: 'agent-branded', name: 'Agent Branded Intro + Outro', desc: 'Logo, colors, headshot', price: 200, mode: 'boolean' },
                { id: 'neighborhood', name: 'Neighborhood Lifestyle Montage', desc: 'POI, schools, parks', price: 400, mode: 'boolean' },
                { id: 'virtual-staging', name: 'Virtual Staging Overlay', desc: 'Per room', price: 100, mode: 'quantity' },
                { id: 'raw-footage', name: 'Raw Footage Export', desc: 'All unedited clips delivered', price: 150, mode: 'boolean' },
            ]
        },
        social: {
            label: '📱 Social Media Marketing',
            icon: '📱',
            services: [
                { id: 'ig-reels', name: 'Instagram Reels Pack (3 videos)', desc: 'Vertical + trending audio', price: 300, mode: 'boolean' },
                { id: 'tiktok-series', name: 'TikTok Series (5 videos)', desc: 'Trend-driven property content', price: 400, mode: 'boolean' },
                { id: 'just-listed', name: '"Just Listed" Social Post (15-30s)', desc: 'Quick-turn announcement', price: 125, mode: 'boolean' },
                { id: 'just-sold', name: '"Just Sold" Celebration Reel', desc: 'Celebratory client moment', price: 125, mode: 'boolean' },
                { id: 'agent-intro', name: 'Agent Introduction Reel (30s)', desc: 'Personal brand builder', price: 150, mode: 'boolean' },
                { id: 'market-update', name: 'Market Update Talking Head', desc: 'Per episode', price: 150, mode: 'quantity' },
                { id: 'testimonial', name: 'Client Testimonial Edit', desc: 'Per testimonial', price: 125, mode: 'quantity' },
                { id: 'monthly-content', name: 'Monthly Content Package (12 posts)', desc: 'Full month of content', price: 800, mode: 'boolean' },
                { id: 'stories-pack', name: 'Stories Content Pack (10 clips)', desc: 'Behind-the-scenes + highlights', price: 200, mode: 'boolean' },
                { id: 'caption-overlays', name: 'Animated Caption Overlays', desc: 'Per video', price: 50, mode: 'quantity' },
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

    // ─── Modal + Square API ────────────────────────────────────

    const modal = document.getElementById('invoiceModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalCancel = document.getElementById('modalCancel');
    const modalSubmit = document.getElementById('modalSubmit');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const modalError = document.getElementById('modalError');
    const clientNameInput = document.getElementById('clientName');
    const clientEmailInput = document.getElementById('clientEmail');
    const invoiceNoteInput = document.getElementById('invoiceNote');
    const toast = document.getElementById('toast');

    function openModal() { modal.style.display = 'flex'; clientNameInput.focus(); }
    function closeModal() {
        modal.style.display = 'none';
        modalError.style.display = 'none';
        submitText.style.display = 'inline';
        submitSpinner.style.display = 'none';
        modalSubmit.disabled = false;
    }
    function showToast(msg, type) {
        toast.textContent = msg;
        toast.className = 'toast toast--' + type;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }

    // Open modal on pay button click
    payBtn.addEventListener('click', () => {
        const entries = Object.values(selected);
        if (entries.length === 0) return;
        openModal();
    });

    modalBackdrop.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);

    // Submit invoice
    modalSubmit.addEventListener('click', async () => {
        const name = clientNameInput.value.trim();
        const email = clientEmailInput.value.trim();
        const note = invoiceNoteInput.value.trim();

        if (!name || !email) {
            modalError.textContent = 'Please enter both name and email.';
            modalError.style.display = 'block';
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            modalError.textContent = 'Please enter a valid email address.';
            modalError.style.display = 'block';
            return;
        }

        modalError.style.display = 'none';
        submitText.style.display = 'none';
        submitSpinner.style.display = 'inline';
        modalSubmit.disabled = true;

        const items = Object.values(selected).map(s => ({
            name: s.name,
            qty: s.qty,
            price: s.price,
        }));

        try {
            const res = await fetch('/api/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName: name, clientEmail: email, items, note }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create invoice');
            }

            closeModal();
            showToast(`✅ Invoice #${data.invoiceNumber} sent to ${email}`, 'success');

            // Open Square payment page if available
            if (data.publicUrl) {
                setTimeout(() => window.open(data.publicUrl, '_blank'), 1500);
            }

            // Clear selections
            Object.keys(selected).forEach(k => delete selected[k]);
            renderServices();
            renderSummary();
            clientNameInput.value = '';
            clientEmailInput.value = '';
            invoiceNoteInput.value = '';

        } catch (err) {
            modalError.textContent = err.message;
            modalError.style.display = 'block';
            submitText.style.display = 'inline';
            submitSpinner.style.display = 'none';
            modalSubmit.disabled = false;
        }
    });

    // ─── Init ────────────────────────────────────────────────────

    renderTabs();
    renderServices();
    renderSummary();
})();
