import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DetailField {
  label: string;
  value: React.ReactNode;
}

interface EntityViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: DetailField[];
}

export function EntityViewDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
}: EntityViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <dl className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {field.label}
              </dt>
              <dd className="mt-1 text-sm font-medium">{field.value}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
