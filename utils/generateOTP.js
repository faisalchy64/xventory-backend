import crypto from "crypto";

const generateOTP = () => {
  // Generate random integer between 0 (inclusive) and 1,000,000 (exclusive)
  const otpValue = crypto.randomInt(0, 1000000);

  // Convert to string and pad with leading zeros to ensure 6 digits
  return otpValue.toString().padStart(6, "0");
};

export default generateOTP;
