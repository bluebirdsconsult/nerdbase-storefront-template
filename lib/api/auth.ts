export interface LoginCustomerData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    business_profile_id: string;
    account_status: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  };
  issued_at: string;
}

export interface LoginOTPPendingResponse {
  success: true;
  type: "otp_required";
  temp_token: string;
  expires_in: number;
  email: string;
}

export interface LoginSuccessResponse {
  success: true;
  data: LoginCustomerData;
}

/**
 * Login a customer via BFF — throws error object on failure.
 * businessProfileId is read from env on the server side (BFF).
 */
export async function loginCustomer(
  email: string,
  password: string
): Promise<LoginSuccessResponse | LoginOTPPendingResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data; // { code, message }
  }

  return data;
}

/**
 * Verify OTP code after email+password login — throws error object on failure.
 */
export async function verifyLoginOTP(
  tempToken: string,
  otpCode: string
): Promise<LoginSuccessResponse> {
  const response = await fetch("/api/auth/verify-login-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({ otp_code: otpCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data; // { code, message }
  }

  return data;
}
