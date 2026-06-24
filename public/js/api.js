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

export async function loadMemberDashboard(mobile) {
    const res = await fetch(`/api/member/donations/${mobile}`);
    const data = await res.json();
    const tbody = document.getElementById('donation-list');
    
    data.donations.forEach(d => {
        tbody.innerHTML += `<tr>
            <td>${new Date(d.transaction_timestamp).toLocaleDateString()}</td>
            <td>${d.amount_inr}</td>
            <td><button onclick="downloadReceipt(${d.donation_id})">Download PDF</button></td>
        </tr>`;
    });
}


// 1. OTP Request
export async function fetchSmsOtpCodeNetwork(mobileInputId, otpBoxId, hintId, submitBtnId) {
    const mobileNumber = document.getElementById(mobileInputId).value;
    const hintElement = document.getElementById(hintId);
    const sendOtpBtn = event.target; // The button that was clicked
    const errorLabel = document.getElementById('err-si-otp'); // Adjust ID as needed

    // 1. Clear previous errors and set UI state
    errorLabel.style.display = 'none';
    sendOtpBtn.disabled = true; // Disable "Send OTP" button
    hintElement.textContent = "Sending OTP...";

    try {
        const response = await fetch('/api/otp/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetPhone: mobileNumber })
        });

        const data = await response.json();
        if (data.success) {
	       // 1. Make the OTP input box visible
	       document.getElementById(otpBoxId).style.display = 'block';

            // 2. NEW: Inject the code directly if it exists
	       if (data.providerResponse) {
	           // Assuming the OTP input has ID 'si-otp-code-input'
	           // You may need to pass the input ID to this function as well
	           const otpInput = document.getElementById('si-otp-code-input'); 
	           otpInput.value = data.providerResponse;
	        }

        // 3. Update the UI hint
        hintElement.style.color = "blue";
        hintElement.textContent = "OTP automatically filled.";            
            // 3. Enable the "Verify" button
            document.getElementById(submitBtnId).disabled = false;
        } else {
            throw new Error(data.error || "Failed to send OTP");
        }
    } catch (err) {
        hintElement.style.color = "red";
        hintElement.textContent = "Error: Could not send OTP.";
        sendOtpBtn.disabled = false; // Re-enable if failed
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
        // 1. Hide Login Modal
    	   triggerAppModalsClose();
    
    	   // 2. Load and Show Dashboard
    	   switchActiveSpaRouteView('route-dashboard');
        loadMemberDashboard(data.mobileNumber);
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