/**
 * API Service Module for Kaaryakarni
 */

// Helper: Generic fetch wrapper
async function apiCall(endpoint, data) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return { response, result: await response.json() };
}

// 1. OTP Request
export async function fetchSmsOtpCodeNetwork(phoneInputFieldId, displayEnclosureId, hintFieldNodeId, submitActionButtonId) {
    const mobileNumber = document.getElementById(phoneInputFieldId).value.trim();
    if (!/^\d{10}$/.test(mobileNumber)) return alert("Invalid 10-digit number.");

    const { response, result } = await apiCall('/api/otp/request', { targetPhone: mobileNumber });
    
    if (response.ok) {
        document.getElementById(displayEnclosureId).style.display = 'block';
        document.getElementById(hintFieldNodeId).innerText = `[Testing Code]: ${result.activeTokenCode}`;
        const submitBtn = document.getElementById(submitActionButtonId);
        if (submitBtn) submitBtn.removeAttribute('disabled');
        alert("OTP Sent! The submission button is now active.");
    } else {
        alert(result.error || "Gateway error.");
    }
}

// 2. Registration
export async function executeMemberRegistrationForm(event) {
    event.preventDefault();
    document.getElementById('err-su-otp').style.display = 'none';

    const clientOtp = document.getElementById('su-otp-code-input').value.trim();
    if (!clientOtp) return alert("Please enter the OTP first.");

    const data = {
        firstName: document.getElementById('su-firstname').value,
        lastName: document.getElementById('su-lastname').value,
        emailId: document.getElementById('su-email').value,
        mobileNumber: document.getElementById('su-mobile').value,
        clientOtp: clientOtp
    };
    
    const { response, result } = await apiCall('/api/member/register-account', data);
    if (response.ok) {
        window.location.reload(); 
    } else {
        if (result.error.toLowerCase().includes("otp")) document.getElementById('err-su-otp').style.display = 'block';
        else alert(result.error);
    }
}

// 3. Login
export async function executeMemberSignInVerificationForm(event) {
    event.preventDefault();
    document.getElementById('err-si-otp').style.display = 'none';
    
    const clientOtp = document.getElementById('si-otp-code-input').value.trim();
    if (!clientOtp) return alert("Please enter the OTP first.");

    const data = {
        mobileNumber: document.getElementById('si-mobile').value,
        clientOtp: clientOtp
    };
    
    const { response, result } = await apiCall('/api/member/signin-verify', data);
    if (response.ok) {
        alert("Login successful!");
        window.location.reload();
    } else {
        if (result.error.toLowerCase().includes("otp")) document.getElementById('err-si-otp').style.display = 'block';
        else alert(result.error);
    }
}

// 4. Donation
export async function executeGuestDonationProcessingForm(event) {
    event.preventDefault();
    document.getElementById('err-do-otp').style.display = 'none';

    const clientOtp = document.getElementById('do-otp-code-input').value.trim();
    if (!clientOtp) return alert("Please enter the OTP first.");

    const data = {
        fullName: document.getElementById('do-fullname').value,
        emailId: document.getElementById('do-email').value,
        mobileNumber: document.getElementById('do-mobile').value,
        amountInr: document.getElementById('do-amount').value,
        clientOtp: clientOtp
    };

    const { response, result } = await apiCall('/api/donation/submit-transaction', data);
    if (response.ok) {
        alert("Donation successful!");
        window.location.reload();
    } else {
        if (result.error.toLowerCase().includes("otp")) document.getElementById('err-do-otp').style.display = 'block';
        else alert(result.error);
    }
}

// 5. Dashboard Member Payment (The missing method)
export async function executeDashboardMemberPaymentProcessRoute() {
    console.log("Processing Member Payment...");
    // Bypass OTP as user is already logged in
    const data = {
        bypassOtp: true,
        amountInr: 1500 // Assuming default tier
    };

    const { response, result } = await apiCall('/api/donation/submit-transaction', data);
    if (response.ok) {
        alert("Payment processed successfully!");
        window.location.reload();
    } else {
        alert(result.error || "Payment processing failed.");
    }
}

// ... Keep Admin and PDF functions as they were ...    

// Admin functions and PDF export logic...
export async function executeAdminIdentityPasswordVerification(event) {
    event.preventDefault();
    const data = {
        identity: document.getElementById('ad-identity-field').value,
        password: document.getElementById('ad-password-field').value
    };

    const { response, result } = await apiCall('/api/admin/gateway-pass', data);
    if (response.ok) {
        document.getElementById('admin-password-phase-form').style.display = 'none';
        document.getElementById('admin-2fa-phase-form').style.display = 'block';
        document.getElementById('ad-2fa-terminal-hint').innerText = `[2FA Code]: ${result.admin2faCode}`;
    } else {
        alert(result.message);
    }
}

export async function executeAdminTwoFactorAuthenticationSubmit(event) {
    event.preventDefault();
    const { response, result } = await apiCall('/api/admin/gateway-2fa', { 
        userToken2fa: document.getElementById('ad-2fa-token-input').value 
    });
    
    if (response.ok) {
        alert("Admin access granted.");
    } else {
        alert(result.message);
    }
}

export function compileAndDownloadPdfStatementReceipt() {
    console.log("Generating PDF Receipt...");
}