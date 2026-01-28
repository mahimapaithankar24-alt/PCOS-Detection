import { FIELD_MAP } from "@/lib/fieldMap";

export function mergeParsedData(
  parsed: Record<string, { value: any; confidence: number }>,
  setForm: Function
) {
  setForm((prev: any) => {
    const updated = { ...prev };

    for (const field in parsed) {
      const formKey = FIELD_MAP[field];
      if (!formKey) continue;

      updated[formKey] = String(parsed[field].value);
    }

    return updated;
  });
}
