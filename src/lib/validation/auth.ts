import { z } from "zod";

/**
 * Client-side password rule mirrors Django's default MinimumLengthValidator
 * (min_length=8). Django also runs CommonPasswordValidator,
 * NumericPasswordValidator and UserAttributeSimilarityValidator, which
 * can't be replicated client-side — those surface as a server error on
 * submit (mapped onto the password field via ApiError.fieldErrors()).
 */
const password = z.string().min(8, "Password must be at least 8 characters.");

const phoneNumber = z
  .string()
  .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number, e.g. +254712345678.")
  .or(z.literal(""))
  .optional();

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required."),
    last_name: z.string().min(1, "Last name is required."),
    email: z.string().email("Enter a valid email address."),
    phone_number: phoneNumber,
    password,
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match.",
    path: ["password_confirm"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    new_password: password,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required."),
    new_password: password,
    new_password_confirm: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: "Passwords do not match.",
    path: ["new_password_confirm"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  phone_number: phoneNumber,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const roleValues = ["customer", "content_editor", "admin", "super_admin"] as const;
export const accountStatusValues = ["active", "suspended"] as const;

export const adminUserCreateSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Enter a valid email address."),
  phone_number: phoneNumber,
  role: z.enum(roleValues),
  password: z.union([password, z.literal("")]).optional(),
});

export type AdminUserCreateFormValues = z.infer<typeof adminUserCreateSchema>;

export const adminUserUpdateSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  phone_number: phoneNumber,
  role: z.enum(roleValues),
  account_status: z.enum(accountStatusValues),
});

export type AdminUserUpdateFormValues = z.infer<typeof adminUserUpdateSchema>;
