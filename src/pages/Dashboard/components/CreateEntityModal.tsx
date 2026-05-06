import { Button } from "@/src/components/ui/Button/Button";
import { Input } from "@/src/components/ui/Input/Input";
import { FormEvent } from "react";

interface CreateEntityModalProps {
  title: string;
  placeholder: string;
  value: string;
  submitLabel: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function CreateEntityModal({
  title,
  placeholder,
  value,
  submitLabel,
  onChange,
  onCancel,
  onSubmit,
}: CreateEntityModalProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-gray-900">{title}</h3>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mb-6"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!value.trim()}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
