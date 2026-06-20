/**
 * Application Entry Point: Kaaryakarni
 */

// 1. Import all required functions
import { triggerAppModalOpen, triggerAppModalsClose, switchActiveSpaRouteView } from './ui.js';
import { 
    fetchSmsOtpCodeNetwork, 
    executeMemberRegistrationForm, 
    executeMemberSignInVerificationForm, 
    executeGuestDonationProcessingForm,
    executeDashboardMemberPaymentProcessRoute,
    executeAdminIdentityPasswordVerification,
    executeAdminTwoFactorAuthenticationSubmit,
    compileAndDownloadPdfStatementReceipt
} from './api.js';

// 2. Grant Global Access (Exposes functions to HTML 'onclick' attributes)
window.triggerAppModalOpen = triggerAppModalOpen;
window.triggerAppModalsClose = triggerAppModalsClose;
window.switchActiveSpaRouteView = switchActiveSpaRouteView;
window.fetchSmsOtpCodeNetwork = fetchSmsOtpCodeNetwork;
window.executeMemberRegistrationForm = executeMemberRegistrationForm;
window.executeMemberSignInVerificationForm = executeMemberSignInVerificationForm;
window.executeGuestDonationProcessingForm = executeGuestDonationProcessingForm;
window.executeDashboardMemberPaymentProcessRoute = executeDashboardMemberPaymentProcessRoute;
window.executeAdminIdentityPasswordVerification = executeAdminIdentityPasswordVerification;
window.executeAdminTwoFactorAuthenticationSubmit = executeAdminTwoFactorAuthenticationSubmit;
window.compileAndDownloadPdfStatementReceipt = compileAndDownloadPdfStatementReceipt;

// 3. System Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("Kaaryakarni System Modularized and Initialized.");
    
    // Safety check: ensure modal mask is closed on load
    const mask = document.getElementById('app-modal-mask');
    if (mask) mask.classList.remove('active');
});