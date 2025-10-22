import { body, ValidationChain } from "express-validator";

export const signupValidation: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain uppercase, lowercase, number and special character"
    ),

  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),

  body("role")
    .isIn(["student", "provider"])
    .withMessage("Role must be either student or provider"),

  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
];

export const loginValidation: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  body("role")
    .isIn(["admin", "student", "provider"])
    .withMessage("Role must be admin, student, or provider"),
];

export const forgotPasswordValidation: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

export const resetPasswordValidation: ValidationChain[] = [
  body("token").notEmpty().withMessage("Reset token is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain uppercase, lowercase, number and special character"
    ),

  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];
