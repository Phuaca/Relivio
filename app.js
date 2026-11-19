document.addEventListener('DOMContentLoaded', () => {

    // Tab Switching Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const headerTitle = document.querySelector('.app-header h1');
    const headerSubtitle = document.querySelector('.app-header p');

    const viewTitles = {
        'view-home': { title: 'RELIVIO', subtitle: 'Connecting communities, reducing waste' },
        'view-donate': { title: 'Post a Donation', subtitle: 'Help reduce food waste in your community' },
        'view-collections': { title: 'Collections', subtitle: 'Manage your pickups' },
        'view-impact': { title: 'Your Impact', subtitle: 'Making a difference together' },
        'view-accept': { title: 'Accept Donation', subtitle: 'Review details' }
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');

            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch views
            views.forEach(view => {
                if (view.id === targetId) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });

            // Update Header Text
            if (viewTitles[targetId]) {
                headerTitle.textContent = viewTitles[targetId].title;
                headerSubtitle.textContent = viewTitles[targetId].subtitle;
            }

            // Specific view updates
            if (targetId === 'view-collections') {
                renderCollections();
            }

            // Force Feed View when clicking Home
            if (targetId === 'view-home') {
                const feedContainer = document.getElementById('feed-container');
                const mapContainer = document.getElementById('map-container');
                const btnFeed = document.getElementById('btn-feed-view');
                const btnMap = document.getElementById('btn-map-view');

                if (feedContainer && mapContainer && btnFeed && btnMap) {
                    feedContainer.style.display = 'block';
                    mapContainer.style.display = 'none';
                    btnFeed.classList.add('active');
                    btnMap.classList.remove('active');
                }
            }

            // Scroll to top
            document.querySelector('main').scrollTop = 0;
        });
    });

    // Simple interaction for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            if (this.classList.contains('nav-item')) return; // handled above

            // Visual feedback
            const originalText = this.innerHTML;
            if (this.textContent.includes('Claim') || this.textContent.includes('Post') || this.textContent.includes('Mark')) {
                // Mock action
            }
        });
    });

    // Store Selector Logic
    const locationSelect = document.getElementById('schedule-location-select');
    const mapFrame = document.getElementById('store-map-frame');
    const btnDirections = document.getElementById('btn-directions');

    // Map data for stores
    const storeLocations = {
        'fairprice': {
            query: 'FairPrice+Xtra+Northshore+Plaza',
            address: 'FairPrice Xtra - Northshore Plaza II',
            coords: [1.4093, 103.9038]
        },
        'kopitiam': {
            query: 'Kopitiam+Corner+Northshore+Plaza',
            address: 'Kopitiam Corner - Northshore Plaza II',
            coords: [1.4098, 103.9042]
        },
        'coffeebean': {
            query: 'Coffee+Bean+Northshore+Plaza',
            address: 'The Coffee Bean & Tea Leaf',
            coords: [1.4091, 103.9035]
        },
        'sweeheng': {
            query: 'Swee+Heng+1989+Classic+Northshore+Plaza',
            address: 'Swee Heng 1989 Classic - Northshore Plaza I',
            coords: [1.4085, 103.9025]
        }
    };

    // Global Store State
    const storeState = {
        'fairprice': {
            name: 'FairPrice Xtra',
            location: 'Northshore Plaza II',
            status: 'available', // available, fully_booked, accepted, collected
            slotId: null
        },
        'kopitiam': {
            name: 'Kopitiam Corner',
            location: 'Northshore Plaza II',
            status: 'fully_booked', // Mock: Booked by other org
            slotId: null
        },
        'coffeebean': {
            name: 'Coffee Bean & Tea Leaf',
            location: 'Northshore Plaza II',
            status: 'available',
            slotId: null
        },
        'sweeheng': {
            name: 'Swee Heng 1989 Classic',
            location: 'Northshore Plaza I',
            status: 'available',
            slotId: null
        }
    };

    // Initialize Home Page Cards based on State
    function renderHomeCards() {
        const cards = document.querySelectorAll('.donation-card');
        cards.forEach(card => {
            const storeId = card.getAttribute('data-store');
            if (storeState[storeId]) {
                const state = storeState[storeId];

                // Clear existing states
                card.classList.remove('fully-booked', 'booked-by-me');
                const existingBadge = card.querySelector('.badge-booked');
                if (existingBadge) existingBadge.remove();

                if (state.status === 'fully_booked') {
                    card.classList.add('fully-booked');
                } else if (state.status === 'accepted') {
                    card.classList.add('booked-by-me');
                    // Add badge
                    const badge = document.createElement('span');
                    badge.className = 'badge-urgent badge-booked';
                    badge.style.backgroundColor = '#2196F3'; // Blue for Accepted
                    badge.textContent = 'Accepted';
                    card.querySelector('.card-image').appendChild(badge);
                } else if (state.status === 'collected') {
                    card.style.opacity = '0.6';
                    const badge = document.createElement('span');
                    badge.className = 'badge-urgent badge-booked';
                    badge.style.backgroundColor = '#4CAF50';
                    badge.textContent = 'Collected';
                    card.querySelector('.card-image').appendChild(badge);
                }
            }
        });
    }

    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            const storeKey = e.target.value;
            // Re-render based on current store state
            renderAcceptView(storeKey);
        });
    }

    // Simplified Accept Donation Logic
    function renderAcceptView(storeId) {
        const state = storeState[storeId];
        const uiInitial = document.getElementById('accept-ui-initial');
        const uiSuccess = document.getElementById('accept-ui-success');
        const mapContainer = document.getElementById('store-map-container');
        const btnAccept = document.getElementById('btn-accept-donation');
        const btnMark = document.getElementById('btn-mark-collected-main');
        const btnDelete = document.getElementById('btn-delete-donation');

        // Ensure delete button is hidden for store view
        if (btnDelete) btnDelete.style.display = 'none';
        if (btnMark) btnMark.style.display = 'block';

        if (!state) return;

        // Reset UI
        uiInitial.style.display = 'block';
        uiSuccess.style.display = 'none';
        mapContainer.style.display = 'none';

        if (state.status === 'accepted' || state.status === 'collected') {
            uiInitial.style.display = 'none';
            uiSuccess.style.display = 'block';
            mapContainer.style.display = 'block';

            if (state.status === 'collected') {
                btnMark.style.display = 'none';
                uiSuccess.querySelector('h3').textContent = 'Collection Completed';
                uiSuccess.querySelector('p').textContent = 'Thank you for your help!';
            } else {
                btnMark.style.display = 'block';
                uiSuccess.querySelector('h3').textContent = 'Donation Accepted!';
                uiSuccess.querySelector('p').innerHTML = 'You can view the details below. <br>Navigate to the store and mark as collected.';
            }

            // Update Map src
            if (storeLocations[storeId]) {
                const loc = storeLocations[storeId];
                const mapUrl = `https://maps.google.com/maps?q=${loc.query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
                const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.query}`;

                const frame = document.getElementById('store-map-frame');
                const btnDir = document.getElementById('btn-directions');
                if (frame) frame.src = mapUrl;
                if (btnDir) btnDir.href = dirUrl;
            }
        }

        // Clone to clear listeners
        const newBtnAccept = btnAccept.cloneNode(true);
        btnAccept.parentNode.replaceChild(newBtnAccept, btnAccept);

        newBtnAccept.addEventListener('click', () => {
            storeState[storeId].status = 'accepted';
            renderAcceptView(storeId);
            renderCollections();
            renderHomeCards();
        });

        const newBtnMark = btnMark.cloneNode(true);
        btnMark.parentNode.replaceChild(newBtnMark, btnMark);

        newBtnMark.addEventListener('click', () => {
            storeState[storeId].status = 'collected';
            renderAcceptView(storeId);
            renderCollections();
            renderHomeCards();
        });
    }

    // Render Collections View
    function renderCollections() {
        const activeContainer = document.querySelector('.active-list');
        const historyContainer = document.querySelector('.history-list');

        if (!activeContainer || !historyContainer) return;

        activeContainer.innerHTML = '';
        historyContainer.innerHTML = '';

        let hasActive = false;
        let hasHistory = false;

        Object.entries(storeState).forEach(([key, data]) => {
            if (data.status === 'accepted') {
                hasActive = true;
                const card = createCollectionCard(key, data, false);
                activeContainer.appendChild(card);
            } else if (data.status === 'collected') {
                hasHistory = true;
                const card = createCollectionCard(key, data, true);
                historyContainer.appendChild(card);
            }
        });

        if (!hasActive) activeContainer.innerHTML = '<div class="empty-state">No active collections. Accept a donation from Home to see it here.</div>';
        if (!hasHistory) historyContainer.innerHTML = '<div class="empty-state">No past collections yet.</div>';
    }

    function createCollectionCard(key, data, isHistory) {
        const card = document.createElement('div');
        card.className = `card route-card ${isHistory ? 'completed' : ''}`;

        card.innerHTML = `
            <div class="route-header">
                <h4>${data.name}</h4>
                <span class="route-status ${isHistory ? 'completed' : 'pending'}">
                    ${isHistory ? 'Collected' : 'Pending Pickup'}
                </span>
            </div>
            <p><i class="material-icons-round">location_on</i> ${data.location}</p>
            ${!isHistory ? `<button class="btn-complete" data-store="${key}">Mark as Collected</button>` : ''}
        `;

        const btn = card.querySelector('.btn-complete');
        if (btn) {
            btn.addEventListener('click', () => {
                storeState[key].status = 'collected';
                renderCollections();
                renderHomeCards(); // Update home badge
            });
        }
        return card;
    }

    // Tab Logic for Collections View
    const collectionTabs = document.querySelectorAll('.pill-tab');
    collectionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            collectionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.getAttribute('data-tab');
            document.querySelectorAll('.collection-tab-content').forEach(c => c.style.display = 'none');
            document.getElementById(target).style.display = 'block';
        });
    });

    // Initial Renders
    renderHomeCards();
    renderCollections();

    // Home Map View Logic
    let homeMap = null;
    const feedContainer = document.getElementById('feed-container');
    const mapContainer = document.getElementById('map-container');
    const btnFeedView = document.getElementById('btn-feed-view');
    const btnMapView = document.getElementById('btn-map-view');

    function initHomeMap() {
        if (homeMap) return; // Already initialized

        homeMap = L.map('home-map').setView([1.4090, 103.9035], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(homeMap);

        // Add markers for each store
        Object.entries(storeState).forEach(([key, data]) => {
            const loc = storeLocations[key];
            if (loc && loc.coords) {
                const marker = L.marker(loc.coords).addTo(homeMap);

                // Popup content based on store status
                let popupContent;
                if (data.status === 'fully_booked') {
                    popupContent = `
                        <div style="text-align: center;">
                            <strong>${data.name}</strong><br>
                            <small>${data.location}</small><br>
                            <div style="margin-top: 8px; padding: 8px 12px; background: #dc3545; color: white; border-radius: 6px; font-weight: 600;">
                                FULLY BOOKED
                            </div>
                        </div>
                    `;
                } else {
                    popupContent = `
                        <div style="text-align: center;">
                            <strong>${data.name}</strong><br>
                            <small>${data.location}</small><br>
                            <button onclick="window.viewDonation('${key}')" style="margin-top: 8px; padding: 6px 12px; background: #E2A602; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                View Details
                            </button>
                        </div>
                    `;
                }
                marker.bindPopup(popupContent);
            }
        });

        // Add markers for user donations
        if (typeof userDonations !== 'undefined') {
            userDonations.forEach(d => addDonationToMap(d));
        }

        setTimeout(() => homeMap.invalidateSize(), 100);
    }

    // Global Delete Function
    window.deleteUserDonation = function (id, btn) {
        if (confirm('Delete this donation?')) {
            const index = userDonations.findIndex(d => d.id === id);

            // Remove marker
            if (index > -1) {
                const donation = userDonations[index];
                if (donation.marker && homeMap) {
                    homeMap.removeLayer(donation.marker);
                }
                userDonations.splice(index, 1);
            }

            // Remove card
            const card = btn.closest('.card');
            if (card) card.remove();
        }
    };

    // Global function for marker click
    window.viewDonation = function (storeId) {
        views.forEach(view => view.classList.remove('active'));
        document.getElementById('view-accept').classList.add('active');
        if (locationSelect) {
            locationSelect.value = storeId;
            renderAcceptView(storeId);
        }
        document.querySelector('main').scrollTop = 0;
    };

    // Toggle between Feed and Map
    if (btnFeedView && btnMapView) {
        btnFeedView.addEventListener('click', () => {
            btnFeedView.classList.add('active');
            btnMapView.classList.remove('active');
            feedContainer.style.display = 'block';
            mapContainer.style.display = 'none';
        });

        btnMapView.addEventListener('click', () => {
            btnMapView.classList.add('active');
            btnFeedView.classList.remove('active');
            feedContainer.style.display = 'none';
            mapContainer.style.display = 'block';
            initHomeMap();
            if (homeMap) homeMap.invalidateSize();
        });
    }

    // Link Home Cards to Accept View
    const donationCards = document.querySelectorAll('.donation-card');
    donationCards.forEach(card => {
        card.addEventListener('click', () => {
            const storeId = card.getAttribute('data-store');
            if (!storeId) return;

            // 1. Switch to Accept view
            views.forEach(view => view.classList.remove('active'));
            document.getElementById('view-accept').classList.add('active');

            // 2. Select the store (also triggers update of accept view)
            if (locationSelect) {
                locationSelect.value = storeId;
                // Manually trigger render
                renderAcceptView(storeId);
            }

            // Scroll to top
            document.querySelector('main').scrollTop = 0;
        });
    });

    // Donate Page Functionality
    let uploadedPhoto = null;
    let selectedLocation = null; // Store selected place details
    const photoInput = document.getElementById('photo-input');
    const photoUploadBtn = document.getElementById('photo-upload-btn');
    const photoPreview = document.getElementById('photo-preview');
    const previewImg = document.getElementById('preview-img');
    const removePhotoBtn = document.getElementById('remove-photo');
    const btnPostDonation = document.getElementById('btn-post-donation');
    const locationInput = document.getElementById('donate-location');

    // Initialize Google Places Autocomplete (try immediately and on API load)
    function initPlacesAutocomplete() {
        if (locationInput && window.google && window.google.maps && window.google.maps.places) {
            const autocomplete = new google.maps.places.Autocomplete(locationInput, {
                componentRestrictions: { country: 'sg' },
                fields: ['formatted_address', 'geometry', 'name']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    selectedLocation = {
                        address: place.formatted_address || place.name,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    console.log('Location selected:', selectedLocation);
                }
            });
            console.log('Places Autocomplete initialized');
        } else {
            // Retry after a short delay if Google API not loaded yet
            // Dictionary loop disabled - switching to Nominatim
            // setTimeout(initPlacesAutocomplete, 500); 
            initNominatimAutocomplete();
        }
    }

    // Try to initialize immediately
    initPlacesAutocomplete();

    // Nominatim Autocomplete Logic
    function initNominatimAutocomplete() {
        // Create dropdown if doesn't exist
        let results = locationInput.parentNode.querySelector('.autocomplete-results');
        if (!results) {
            results = document.createElement('div');
            results.className = 'autocomplete-results';
            locationInput.parentNode.appendChild(results);
        }

        const debounce = (func, wait) => {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };

        const handleSearch = async (e) => {
            const query = e.target.value.trim();
            if (query.length < 3) {
                results.style.display = 'none';
                return;
            }

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=sg&limit=5`);
                const data = await response.json();

                if (data.length > 0) {
                    results.innerHTML = '';
                    data.forEach(place => {
                        const item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.innerHTML = `<strong>${place.display_name.split(',')[0]}</strong><small>${place.display_name}</small>`;
                        item.onclick = () => {
                            locationInput.value = place.display_name.split(',')[0];
                            selectedLocation = { address: place.display_name, lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
                            results.style.display = 'none';
                            console.log('Nominatim location selected:', selectedLocation);
                        };
                        results.appendChild(item);
                    });
                    results.style.display = 'block';
                } else {
                    results.style.display = 'none';
                }
            } catch (error) { console.warn('Nominatim error:', error); }
        };

        locationInput.addEventListener('input', debounce(handleSearch, 300));
        document.addEventListener('click', (e) => {
            if (e.target !== locationInput && e.target !== results) results.style.display = 'none';
        });
        console.log('Nominatim Autocomplete Initialized');
    }

    // Photo upload click
    if (photoUploadBtn && photoInput) {
        photoUploadBtn.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedPhoto = event.target.result;
                    previewImg.src = uploadedPhoto;
                    photoPreview.style.display = 'block';
                    photoUploadBtn.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        removePhotoBtn.addEventListener('click', () => {
            uploadedPhoto = null;
            photoInput.value = '';
            photoPreview.style.display = 'none';
            photoUploadBtn.style.display = 'block';
        });
    }

    // Post Donation
    let userDonations = []; // Store user-posted donations
    if (btnPostDonation) {
        btnPostDonation.addEventListener('click', () => {
            const title = document.getElementById('donate-title').value.trim();
            const quantity = document.getElementById('donate-quantity').value.trim();
            const description = document.getElementById('donate-description').value.trim();
            const location = document.getElementById('donate-location').value.trim();
            const time = document.getElementById('donate-time').value;

            // Validation
            if (!title || !quantity || !location) {
                console.warn('Please fill in all required fields');
                return;
            }

            /*
            if (!uploadedPhoto) {
                console.warn('Please add a photo');
                return;
            }
            */

            // Create new donation object
            const coords = selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : generateRandomCoords();
            const newDonation = {
                id: 'user-' + Date.now(),
                name: title,
                location: selectedLocation ? selectedLocation.address : location,
                subtitle: selectedLocation ? selectedLocation.address : location,
                quantity: quantity,
                description: description,
                time: time,
                photo: uploadedPhoto || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
                distance: '0.1 km',
                timeLeft: calculateTimeLeft(time),
                coords: coords,
                isUserPost: true
            };

            userDonations.push(newDonation);

            // Add to feed view
            addDonationToFeed(newDonation);

            // Add to map view
            if (homeMap) {
                addDonationToMap(newDonation);
            }

            // Reset form
            document.getElementById('donate-title').value = '';
            document.getElementById('donate-quantity').value = '';
            document.getElementById('donate-description').value = '';
            document.getElementById('donate-location').value = '';
            removePhotoBtn.click();

            // Show success and redirect to home
            console.log('✓ Donation posted successfully!');
            navItems[0].click(); // Switch to home view
        });
    }

    function calculateTimeLeft(timeStr) {
        if (!timeStr) return '4 hours left';
        const now = new Date();
        const target = new Date();
        const [hours, minutes] = timeStr.split(':');
        target.setHours(parseInt(hours), parseInt(minutes));

        const diff = target - now;
        if (diff < 0) return 'Expired';

        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        return hoursLeft > 0 ? `${hoursLeft} hours left` : 'Less than 1 hour';
    }

    function generateRandomCoords() {
        // Random coords near Northshore Plaza
        const baseLat = 1.4090;
        const baseLng = 103.9035;
        const randomLat = baseLat + (Math.random() - 0.5) * 0.002;
        const randomLng = baseLng + (Math.random() - 0.5) * 0.002;
        return [randomLat, randomLng];
    }

    function addDonationToFeed(donation) {
        const donationList = document.querySelector('.donation-list');
        if (!donationList) return;

        const card = document.createElement('div');
        card.className = 'card donation-card';
        card.setAttribute('data-user-donation', donation.id);
        card.style.cursor = 'pointer';

        const cardHtml = document.createElement('div');
        cardHtml.innerHTML = `
            <div class="card-image" style="background-image: url('${donation.photo}'); position: relative;">
                <span class="badge-urgent" style="background: #28a745;">Your Post</span>
            </div>
            <div class="card-content">
                <h3>${donation.name}</h3>
                <p class="subtitle">${donation.subtitle}</p>
                <div class="card-meta">
                    <span><i class="material-icons-round">location_on</i> ${donation.distance} away</span>
                    <span><i class="material-icons-round">schedule</i> ${donation.timeLeft}</span>
                </div>
                <div class="card-meta">
                    <span>Quantity: ${donation.quantity}</span>
                </div>
            </div>
        `;

        // Move the HTML to the card
        while (cardHtml.firstChild) {
            card.appendChild(cardHtml.firstChild);
        }

        // Delete handler is now inline (window.deleteUserDonation)

        // Add click handler for viewing details
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking delete button
            if (!e.target.closest('.delete-donation-btn')) {
                showUserDonationDetails(donation);
            }
        });

        // Insert at the top of the list
        donationList.insertBefore(card, donationList.firstChild);
    }

    function addDonationToMap(donation) {
        if (!homeMap || !donation.coords) return;

        const marker = L.marker(donation.coords).addTo(homeMap);
        donation.marker = marker; // Store marker reference for deletion

        const popupContent = `
            <div style="text-align: center;">
                <strong>${donation.name}</strong><br>
                <small>${donation.location}</small><br>
                <button onclick="window.viewUserDonation('${donation.id}')" style="margin-top: 8px; padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    View Details
                </button>
            </div>
        `;
        marker.bindPopup(popupContent);
    }

    // Global function for user donation click
    window.viewUserDonation = function (donationId) {
        const donation = userDonations.find(d => d.id === donationId);
        if (donation) {
            showUserDonationDetails(donation);
        }
    };

    // Show user donation details
    function showUserDonationDetails(donation) {
        // Switch to Accept view but show donation info instead
        views.forEach(view => view.classList.remove('active'));
        document.getElementById('view-accept').classList.add('active');

        // Update location select to show donation location
        if (locationSelect) {
            locationSelect.value = '';
            locationSelect.disabled = true;
        }

        const uiInitial = document.getElementById('accept-ui-initial');
        const uiSuccess = document.getElementById('accept-ui-success');
        const mapContainer = document.getElementById('store-map-container');

        uiInitial.style.display = 'none';
        uiSuccess.style.display = 'block';
        mapContainer.style.display = 'block';

        uiSuccess.querySelector('h3').textContent = donation.name;
        uiSuccess.querySelector('p').innerHTML = `<strong>Location:</strong> ${donation.location}<br><strong>Quantity:</strong> ${donation.quantity}<br><strong>Time:</strong> ${donation.timeLeft}`;

        // Hide mark as collected button + Show Delete Button
        const btnMark = document.getElementById('btn-mark-collected-main');
        const btnDelete = document.getElementById('btn-delete-donation');

        if (btnMark) btnMark.style.display = 'none';

        if (btnDelete) {
            btnDelete.style.display = 'flex';
            btnDelete.style.alignItems = 'center';
            btnDelete.style.justifyContent = 'center';
            btnDelete.style.gap = '8px';

            // Bind delete action to open modal
            btnDelete.onclick = (e) => {
                if (e) e.preventDefault();
                const modal = document.getElementById('delete-modal');
                const confirmBtn = document.getElementById('btn-confirm-delete');
                if (modal && confirmBtn) {
                    confirmBtn.setAttribute('data-target-id', donation.id);
                    modal.style.display = 'flex';
                }
            };
        }

        // Update map to show user donation location
        if (donation.coords) {
            const mapUrl = `https://maps.google.com/maps?q=${donation.coords[0]},${donation.coords[1]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${donation.coords[0]},${donation.coords[1]}`;

            const frame = document.getElementById('store-map-frame');
            const btnDir = document.getElementById('btn-directions');
            if (frame) frame.src = mapUrl;
            if (btnDir) btnDir.href = dirUrl;
        }

        document.querySelector('main').scrollTop = 0;
    }

    // Custom Modal Event Listeners
    const deleteModal = document.getElementById('delete-modal');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    if (btnCancelDelete && deleteModal) {
        btnCancelDelete.onclick = () => {
            deleteModal.style.display = 'none';
        };
    }

    if (btnConfirmDelete && deleteModal) {
        btnConfirmDelete.onclick = () => {
            const donationId = btnConfirmDelete.getAttribute('data-target-id');
            if (donationId) {
                const index = userDonations.findIndex(d => d.id === donationId);
                if (index > -1) {
                    try {
                        const donation = userDonations[index];
                        if (donation.marker && homeMap) {
                            homeMap.removeLayer(donation.marker);
                        }
                        userDonations.splice(index, 1);

                        // Clean DOM
                        const cards = document.querySelectorAll('.donation-card');
                        cards.forEach(c => {
                            if (c.getAttribute('data-user-donation') === donationId) c.remove();
                        });

                        // Switch View
                        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                        document.getElementById('view-home').classList.add('active');

                        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                        const homeNav = document.querySelector('.nav-item[data-target="view-home"]');
                        if (homeNav) homeNav.classList.add('active');

                        const headerTitle = document.querySelector('.app-header h1');
                        if (headerTitle) headerTitle.textContent = 'RELIVIO';

                        alert('Donation Successfully Deleted!');
                    } catch (err) {
                        alert('Error: ' + err.message);
                    }
                } else {
                    alert('Error: Could not find donation to delete.');
                }
            }
            deleteModal.style.display = 'none';
        };
    }

});
