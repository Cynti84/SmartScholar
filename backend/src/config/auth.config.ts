export const authConfig = {
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
    expiresIn: "7d",
    refreshExpiresIn: "30d",
  },
  bcrypt: {
    saltRounds: 12,
  },
  verification: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    baseUrl: process.env.BACKEND_URL || "http://localhost:5000",
    path: "/api/auth/verify-email",
  },
  passwordReset: {
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    baseUrl: process.env.BACKEND_URL || "http://localhost:5000",
    path: "/api/auth/reset-password",
  },
  email: {
    from: process.env.EMAIL_FROM || "noreply.smartscholar.com",
    // service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:4200",
};
