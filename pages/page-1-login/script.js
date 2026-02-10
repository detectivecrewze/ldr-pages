// Simple Login Script
(function () {
    'use strict';

    // Get config from parent, window, or use defaults
    function getConfig() {
        if (window.parent && window.parent !== window && window.parent.CONFIG) {
            console.log('Using parent CONFIG');
            return window.parent.CONFIG;
        }
        if (window.CONFIG) {
            console.log('Using window CONFIG');
            return window.CONFIG;
        }
        console.log('Using default config');
        return {
            login: { password: 'forever', quote: 'Distance means so little when someone means so much' }
        };
    }

    // Wait for DOM to be ready
    function init() {
        console.log('Initializing login...');

        const passwordInput = document.getElementById('passwordInput');
        const loginButton = document.getElementById('loginButton');
        const cancelButton = document.getElementById('cancelButton');
        const errorDialog = document.getElementById('errorDialog');

        if (!passwordInput || !loginButton) {
            console.error('Required elements not found!');
            return;
        }

        console.log('Elements found, attaching listeners');

        // Login button click
        loginButton.addEventListener('click', function () {
            console.log('OK button clicked!');
            handleLogin();
        });

        // Cancel button
        cancelButton.addEventListener('click', function () {
            console.log('Cancel clicked');
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: 'NAVIGATE', direction: 'close' }, '*');
            }
        });

        // Enter key
        passwordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });

        // Hide error on input
        passwordInput.addEventListener('input', function () {
            passwordInput.classList.remove('error');
            errorDialog.classList.remove('show');
        });

        // Focus input
        passwordInput.focus();

        console.log('Login initialized successfully');
    }

    function handleLogin() {
        console.log('handleLogin called');

        var passwordInput = document.getElementById('passwordInput');
        var loginButton = document.getElementById('loginButton');
        var errorDialog = document.getElementById('errorDialog');
        var errorMessageEl = document.getElementById('errorMessage');
        var distanceFill = document.getElementById('distanceFill');
        var heart = document.getElementById('pixelHeart');

        var enteredPassword = passwordInput.value.trim();
        console.log('Entered:', enteredPassword, 'Expected:', correctPassword);

        if (enteredPassword.toLowerCase() === correctPassword.toLowerCase()) {
            // SUCCESS
            console.log('PASSWORD CORRECT!');

            // Visual feedback
            loginButton.disabled = true;
            loginButton.style.background = '#008000';
            loginButton.style.color = '#fff';
            loginButton.querySelector('.button-text').textContent = '✓ Access Granted';
            errorDialog.classList.remove('show');

            // CONNECTION ANIMATION
            if (distanceFill) {
                distanceFill.style.width = '100%';
                distanceFill.style.background = 'linear-gradient(180deg, #00ff00 0%, #008000 100%)';
            }

            if (heart) {
                heart.style.animation = 'heartbeat 0.4s infinite';
                heart.classList.add('connected');
            }

            // Status message
            const distanceText = document.getElementById('distanceText');
            if (distanceText) {
                distanceText.textContent = 'Connection established! Opening hub...';
                distanceText.style.color = '#008000';
                distanceText.style.fontWeight = 'bold';
            }

            // Send message to parent after animation
            console.log('Sending APP_COMPLETE message after delay...');
            setTimeout(() => {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'APP_COMPLETE',
                        appId: 'login',
                        nextApp: 'shared'
                    }, '*');
                    console.log('Message sent!');
                } else {
                    console.log('No parent window - this is standalone mode');
                }
            }, 1500);

        } else {
            // ERROR
            console.log('PASSWORD INCORRECT');
            passwordInput.classList.add('error');
            errorMessageEl.textContent = config.login?.errorMessage || 'Incorrect password. Please try again.';
            errorDialog.classList.add('show');
            passwordInput.focus();
        }
    }

    // Update stats on login page
    function updateStats() {
        // Update relationship counter
        const startDate = config.login?.relationshipStartDate || '2023-01-15';
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const counterEl = document.getElementById('daysCounter');
        if (counterEl) {
            counterEl.textContent = String(diffDays).padStart(3, '0');
        }

        // Update labels
        const youLabel = document.getElementById('youLabel');
        const themLabel = document.getElementById('themLabel');
        if (youLabel) youLabel.textContent = config.login?.youLabel || 'You';
        if (themLabel) themLabel.textContent = config.login?.themLabel || 'Them';

        // Update last login
        const lastLoginEl = document.getElementById('lastLogin');
        if (lastLoginEl) {
            lastLoginEl.textContent = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }

        // Update distance
        const dashboard = config.dashboard || {};
        if (dashboard.yourLocation?.coordinates && dashboard.theirLocation?.coordinates) {
            const distance = calculateDistance(
                dashboard.yourLocation.coordinates,
                dashboard.theirLocation.coordinates
            );
            const distanceEl = document.getElementById('distanceText');
            const distanceFill = document.getElementById('distanceFill');

            if (distanceEl) {
                distanceEl.textContent = `${Math.round(distance).toLocaleString()} km apart`;
            }

            if (distanceFill) {
                // Set initial filled state (e.g. 15% to show active link)
                distanceFill.style.width = '15%';
            }
        }

        // Update quote
        const quoteText = config.login?.quote || 'Distance means so little when someone means so much';
        const quoteEl = document.getElementById('quoteText');
        const quoteEl2 = document.getElementById('quoteText2');
        if (quoteEl && quoteEl2) {
            const words = quoteText.split(' ');
            const mid = Math.ceil(words.length / 2);
            quoteEl.textContent = '"' + words.slice(0, mid).join(' ') + '"';
            quoteEl2.textContent = '"' + words.slice(mid).join(' ') + '"';
        }
    }

    function calculateDistance(coord1, coord2) {
        const R = 6371;
        const lat1 = coord1[0] * Math.PI / 180;
        const lat2 = coord2[0] * Math.PI / 180;
        const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180;
        const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180;
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init();
            updateStats();
        });
    } else {
        init();
        updateStats();
    }

    function getConfig() {
        if (window.CONFIG) return window.CONFIG;
        if (typeof CONFIG !== 'undefined') return CONFIG;
        if (window.parent && window.parent !== window && window.parent.CONFIG) return window.parent.CONFIG;
        return {
            login: { password: 'forever', quote: 'Distance means so little when someone means so much' }
        };
    }

    let config = getConfig();
    let correctPassword = config.login?.password || 'forever';

    // Listen for config updates from parent
    window.addEventListener('message', (e) => {
        if (e.data?.type === 'CONFIG_UPDATE') {
            console.log('Login: Received CONFIG_UPDATE');
            window.CONFIG = e.data.config;
            config = e.data.config;
            correctPassword = config.login?.password || 'forever';

            // Update UI
            updateStats();

            // Update cover photo if target exists
            const coverEl = document.querySelector('.login-cover img');
            if (coverEl && config.login?.photoSrc) {
                coverEl.src = config.login.photoSrc;
            }
        }
    });

})();
