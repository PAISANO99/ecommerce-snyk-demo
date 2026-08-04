import { useCallback, useEffect, useState } from "react";
import { checkoutSchema, type CheckoutFormSchema } from "../schemas/checkoutSchema";

type FieldErrors = Partial<Record<keyof CheckoutFormSchema, string>>;

const emptyFormData: CheckoutFormSchema = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  phone: "",
  paymentMethod: "tarjeta",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  paypalCountry: "",
  paypalFirstName: "",
  paypalLastName: "",
  paypalEmail: "",
  paypalPassword: "",
  paypalPasswordConfirm: "",
};

type UseFormValidationProps = {
  onFormChange?: (data: CheckoutFormSchema, isValid: boolean) => void;
  initialData?: CheckoutFormSchema | null;
};

export function useFormValidation({ onFormChange, initialData }: UseFormValidationProps = {}) {
  const [formData, setFormData] = useState<CheckoutFormSchema>(initialData || emptyFormData);
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFormSchema, boolean>>>({});
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateField = useCallback(
    (name: keyof CheckoutFormSchema, value: string, nextData?: CheckoutFormSchema) => {
      const dataToValidate = nextData || { ...formData, [name]: value };
      const result = checkoutSchema.safeParse(dataToValidate);

      if (result.success) {
        return undefined;
      }

      const issue = result.error.issues.find((entry) => entry.path[0] === name);
      return issue?.message;
    },
    [formData]
  );

  const handleChange = useCallback(
    (name: keyof CheckoutFormSchema, value: string) => {
      const nextData = { ...formData, [name]: value };
      setFormData(nextData);

      if (touched[name]) {
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value, nextData) }));
      }

      onFormChange?.(nextData, checkoutSchema.safeParse(nextData).success);
    },
    [formData, onFormChange, touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof CheckoutFormSchema) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }));
    },
    [formData, validateField]
  );

  return {
    formData,
    errors,
    handleChange,
    handleBlur,
    isValid: checkoutSchema.safeParse(formData).success,
  };
}
