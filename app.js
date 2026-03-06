/* ═══════════════════════════════════════════════════════════════
   ReelEstate Orlando — Client-Facing Quote Builder
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── Service Catalog ─────────────────────────────────────────

    const CATEGORIES = {
        filming: {
            label: '🎬 Filming',
            icon: '🎬',
            tagline: 'Professional on-location video services',
            services: [
                { id: 'hourly-rate', name: 'Hourly Filming Rate', desc: '$150/hr — single camera operator', price: 150, mode: 'quantity' },
                { id: 'half-day-shoot', name: 'Half-Day Shoot (4 hours)', desc: 'Single camera operator — great for listings', price: 600, mode: 'boolean' },
                { id: 'full-day-shoot', name: 'Full-Day Shoot (8 hours)', desc: 'Single camera operator — luxury or multi-scene', price: 1200, mode: 'boolean' },
                { id: 'drone-aerial', name: 'Drone Aerial Coverage', desc: 'FAA Part 107 certified — stunning bird\'s eye views', price: 250, mode: 'boolean' },
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
            label: '✂️ Editing & Post',
            icon: '✂️',
            tagline: 'Polished, ready-to-publish video content',
            services: [
                { id: 'mls-listing', name: 'MLS-Ready Listing Video (60-90s)', desc: '16:9 + 1:1 formats — ready for MLS upload', price: 300, mode: 'boolean' },
                { id: 'cinematic-walkthrough', name: 'Cinematic Walkthrough', desc: 'Floor plan overlay + smooth transitions', price: 500, mode: 'boolean' },
                { id: 'luxury-hero', name: 'Luxury Hero Film (2-3 min)', desc: 'Full cinematic narrative — your flagship piece', price: 750, mode: 'boolean' },
                { id: 'drone-interior', name: 'Drone-to-Interior Transition Edit', desc: 'Seamless aerial to ground flow', price: 350, mode: 'boolean' },
                { id: 'day-night', name: 'Day-to-Night Transition Edit', desc: 'Dramatic lighting shift effect', price: 250, mode: 'boolean' },
                { id: 'agent-branded', name: 'Agent Branded Intro + Outro', desc: 'Your logo, colors, and headshot', price: 200, mode: 'boolean' },
                { id: 'neighborhood', name: 'Neighborhood Lifestyle Montage', desc: 'Nearby POIs, schools, parks, dining', price: 400, mode: 'boolean' },
                { id: 'virtual-staging', name: 'Virtual Staging Overlay', desc: 'Per room — digital furniture placement', price: 100, mode: 'quantity' },
                { id: 'raw-footage', name: 'Raw Footage Export', desc: 'All unedited clips delivered via cloud', price: 150, mode: 'boolean' },
            ]
        },
        social: {
            label: '📱 Social Media',
            icon: '📱',
            tagline: 'Content that gets you noticed online',
            services: [
                { id: 'ig-reels', name: 'Instagram Reels Pack (3 videos)', desc: 'Vertical + trending audio — ready to post', price: 300, mode: 'boolean' },
                { id: 'tiktok-series', name: 'TikTok Series (5 videos)', desc: 'Trend-driven property content', price: 400, mode: 'boolean' },
                { id: 'just-listed', name: '"Just Listed" Social Post (15-30s)', desc: 'Quick-turn announcement video', price: 125, mode: 'boolean' },
                { id: 'just-sold', name: '"Just Sold" Celebration Reel', desc: 'Celebratory client moment — great for trust', price: 125, mode: 'boolean' },
                { id: 'agent-intro', name: 'Agent Introduction Reel (30s)', desc: 'Build your personal brand', price: 150, mode: 'boolean' },
                { id: 'market-update', name: 'Market Update Talking Head', desc: 'Per episode — position as local expert', price: 150, mode: 'quantity' },
                { id: 'testimonial', name: 'Client Testimonial Edit', desc: 'Per testimonial — builds social proof', price: 125, mode: 'quantity' },
                { id: 'monthly-content', name: 'Monthly Content Package (12 posts)', desc: 'Full month of social content', price: 800, mode: 'boolean' },
                { id: 'stories-pack', name: 'Stories Content Pack (10 clips)', desc: 'Behind-the-scenes + highlights', price: 200, mode: 'boolean' },
                { id: 'caption-overlays', name: 'Animated Caption Overlays', desc: 'Per video — accessibility + engagement', price: 50, mode: 'quantity' },
            ]
        }
    };

    // ─── State ───────────────────────────────────────────────────

    let activeTab = 'filming';
    const selected = {};

    // ─── DOM Refs ────────────────────────────────────────────────

    const $ = id => document.getElementById(id);
    const tabsContainer = $('tabs');
    const servicesContainer = $('services');
    const summaryItems = $('summaryItems');
    const summaryEmpty = $('summaryEmpty');
    const summaryTotal = $('summaryTotal');
    const totalAmount = $('totalAmount');
    const payBtn = $('payBtn');
    const itemCount = $('itemCount');

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

        // Category header with count
        const header = document.createElement('div');
        header.className = 'category__header';
        header.innerHTML = `
            <h2 class="category__title">${cat.label}</h2>
            <span class="category__count">${cat.tagline}</span>
        `;
        servicesContainer.appendChild(header);

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
                        if (qty === 1) delete selected[svc.id];
                        else selected[svc.id].qty = qty - 1;
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
                    if (selected[svc.id]) delete selected[svc.id];
                    else selected[svc.id] = { qty: 1, price: svc.price, name: svc.name };
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

        itemCount.textContent = `(${count} item${count !== 1 ? 's' : ''})`;

        if (count === 0) {
            summaryEmpty.style.display = 'block';
            summaryItems.innerHTML = '';
            summaryTotal.style.display = 'none';
            payBtn.classList.add('pay-btn--disabled');
            payBtn.textContent = 'Select services above ↑';
            return;
        }

        summaryEmpty.style.display = 'none';
        summaryTotal.style.display = 'flex';
        payBtn.classList.remove('pay-btn--disabled');
        payBtn.textContent = 'Get My Invoice →';

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

    const modal = $('invoiceModal');
    const modalBackdrop = $('modalBackdrop');
    const modalCancel = $('modalCancel');
    const modalSubmit = $('modalSubmit');
    const submitText = $('submitText');
    const submitSpinner = $('submitSpinner');
    const modalError = $('modalError');
    const clientNameInput = $('clientName');
    const clientEmailInput = $('clientEmail');
    const invoiceNoteInput = $('invoiceNote');
    const modalSummary = $('modalSummary');
    const toast = $('toast');
    const successModal = $('successModal');
    const successBackdrop = $('successBackdrop');
    const successClose = $('successClose');
    const successMsg = $('successMsg');

    function openModal() {
        // Build recap in modal
        const entries = Object.values(selected);
        const total = entries.reduce((sum, s) => sum + (s.price * s.qty), 0);
        let recapHTML = entries.map(s => {
            const qtyText = s.qty > 1 ? ` ×${s.qty}` : '';
            return `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.82rem;">
                <span>${s.name}${qtyText}</span>
                <span style="font-weight:600;color:var(--gold-dark);">$${(s.price * s.qty).toLocaleString()}</span>
            </div>`;
        }).join('');
        recapHTML += `<div class="modal__summary-total">
            <span>Total</span><span>$${total.toLocaleString()}</span>
        </div>`;
        modalSummary.innerHTML = recapHTML;

        modal.style.display = 'flex';
        clientNameInput.focus();
    }

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

    payBtn.addEventListener('click', () => {
        if (Object.values(selected).length === 0) return;
        openModal();
    });

    modalBackdrop.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);

    // Submit
    modalSubmit.addEventListener('click', async () => {
        const name = clientNameInput.value.trim();
        const email = clientEmailInput.value.trim();
        const note = invoiceNoteInput.value.trim();

        if (!name || !email) {
            modalError.textContent = 'Please enter your name and email.';
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
            name: s.name, qty: s.qty, price: s.price,
        }));

        try {
            const res = await fetch('/api/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName: name, clientEmail: email, items, note }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create invoice');

            closeModal();

            // Show success modal
            successMsg.textContent = `We've sent your invoice to ${email}. Check your inbox for a secure Square payment link.`;
            successModal.style.display = 'flex';

            // Open Square payment page
            if (data.publicUrl) {
                setTimeout(() => window.open(data.publicUrl, '_blank'), 2000);
            }

            // Clear
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

    // Success modal
    successClose.addEventListener('click', () => { successModal.style.display = 'none'; });
    successBackdrop.addEventListener('click', () => { successModal.style.display = 'none'; });

    // ─── Smooth scroll to builder on CTA ─────────────────────────

    document.querySelectorAll('a[href="#builder"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ─── Init ────────────────────────────────────────────────────

    renderTabs();
    renderServices();
    renderSummary();
})();
