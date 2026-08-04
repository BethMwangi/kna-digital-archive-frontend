import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
}

/**
 * Kenyans naturally type their number with the leading 0 (e.g. "0727029973")
 * — normalize that away before prefixing +254, otherwise it becomes
 * "+2540727029973" (13 digits, one too many) instead of "+254727029973".
 * Also strips a redundant "254" if it's already there, so pasted E.164/local
 * numbers both land on the same canonical form. Pesaflow's clientMSISDN is
 * strict about this (BigInt, e.g. 25472222222) and 422s on the malformed shape.
 */
export function normalizeKenyanPhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("254")) digits = digits.slice(3);
  digits = digits.replace(/^0+/, "");
  return digits ? `+254${digits}` : "";
}

/** Kenyan phone input: user types the local number, field value is stored/submitted as full +254E.164. */
export function PhoneField<T extends FieldValues>({
  control,
  name,
  label = "Phone (optional)",
}: PhoneFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const local = String(field.value ?? "").replace(/^\+254/, "");
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="mt-1.5 flex">
              <span className="inline-flex items-center border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                +254
              </span>
              <FormControl>
                <Input
                  className="rounded-none"
                  placeholder="712 000 000"
                  value={local}
                  onChange={(e) => field.onChange(normalizeKenyanPhone(e.target.value))}
                  onBlur={field.onBlur}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
