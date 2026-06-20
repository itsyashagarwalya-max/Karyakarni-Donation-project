/**
 * UI Management Module for Kaaryakarni
 */

// Switch between SPA views (Landing, Dashboard, Success, Admin)
export function switchActiveSpaRouteView(routeTargetId) {
    document.querySelectorAll('.spa-page-route').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(routeTargetId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
}

// Open specific modals and reset their internal forms
export function triggerAppModalOpen(modalTypeKey) {
    const mask = document.getElementById('app-modal-mask');
    if (!mask) return;

    mask.classList.add('active');
    
    // Hide all modal windows first
    const modals = ['box-modal-signup', 'box-modal-signin', 'box-modal-donate', 'box-modal-admin'];
    modals.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // Show requested modal
    const modalMap = {
        'signup': 'box-modal-signup',
        'signin': 'box-modal-signin',
        'donate': 'box-modal-donate',
        'admin': 'box-modal-admin'
    };
    
    const targetModal = document.getElementById(modalMap[modalTypeKey]);
    if (targetModal) {
        targetModal.style.display = 'block';
    }

    // Reset Admin view state if admin modal opened
    if (modalTypeKey === 'admin') {
        const passForm = document.getElementById('admin-password-phase-form');
        const twoFaForm = document.getElementById('admin-2fa-phase-form');
        if (passForm) passForm.style.display = 'block';
        if (twoFaForm) twoFaForm.style.display = 'none';
    }
}

// Close modals and clear validation errors
export function triggerAppModalsClose() {
    const mask = document.getElementById('app-modal-mask');
    if (mask) mask.classList.remove('active');
    
    // Reset form states
    document.querySelectorAll('.error-alert-label').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.otp-display-enclosure-box').forEach(e => e.style.display = 'none');
}

// Helper to update dynamic labels in UI (like Dashboard name)
export function updateDisplayLabels(fullName) {
    const label = document.getElementById('label-user-display-fullname');
    if (label) {
        label.innerText = fullName;
    }
}