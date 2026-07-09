import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
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
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, "");
                    field.onChange(digits ? `+254${digits}` : "");
                  }}
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
