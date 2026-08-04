import { z } from "zod";

export const checkoutSchema = z
  .object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("Ingresa un correo electrónico válido"),
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    city: z.string().min(2, "Ingresa una ciudad válida"),
    postalCode: z.string().regex(/^\d{4,10}$/, "Ingresa un código postal válido"),
    country: z.string().min(2, "Ingresa un país válido"),
    phone: z.string().regex(/^\d{10}$/, "Ingresa un número telefónico de 10 dígitos"),
    paymentMethod: z.enum(["tarjeta", "paypal"]),
    cardNumber: z.string(),
    cardExpiry: z.string(),
    cardCvc: z.string(),
    paypalCountry: z.string(),
    paypalFirstName: z.string(),
    paypalLastName: z.string(),
    paypalEmail: z.string(),
    paypalPassword: z.string(),
    paypalPasswordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "paypal") {
      if (data.paypalCountry.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paypalCountry"], message: "Selecciona un país o región" });
      }

      if (data.paypalFirstName.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paypalFirstName"], message: "Ingresa tu nombre" });
      }

      if (data.paypalLastName.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paypalLastName"], message: "Ingresa tus apellidos" });
      }

      if (!z.string().email().safeParse(data.paypalEmail).success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paypalEmail"], message: "Ingresa un correo electrónico válido" });
      }

      if (data.paypalPassword.length < 6) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paypalPassword"], message: "La contraseña debe tener al menos 6 caracteres" });
      }

      if (data.paypalPasswordConfirm !== data.paypalPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paypalPasswordConfirm"], message: "Las contraseñas no coinciden" });
      }

      return;
    }

    if (data.cardNumber.replace(/\s/g, "").length !== 16) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cardNumber"], message: "Ingresa una tarjeta válida de 16 dígitos" });
    }

    if (!/^\d{2} \/ \d{2}$/.test(data.cardExpiry)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cardExpiry"], message: "Usa el formato MM / AA" });
    }

    if (!/^\d{3,4}$/.test(data.cardCvc)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cardCvc"], message: "Ingresa un CVC válido" });
    }
  });

export type CheckoutFormSchema = z.infer<typeof checkoutSchema>;
