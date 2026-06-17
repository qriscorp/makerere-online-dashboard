import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors
      closeButton
      offset={16}
      gap={12}
      visibleToasts={4}
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        error: <CircleX className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-xl !border !border-border/80 !bg-background/95 !text-foreground !shadow-lg !backdrop-blur-sm !px-4 !py-3.5 !gap-3",
          title: "!text-sm !font-semibold !leading-snug",
          description: "!text-xs !text-muted-foreground !leading-relaxed",
          success: "!border-emerald-500/30 !bg-emerald-50/95 dark:!bg-emerald-950/40",
          error: "!border-destructive/30 !bg-red-50/95 dark:!bg-red-950/40",
          info: "!border-sky-500/30 !bg-sky-50/95 dark:!bg-sky-950/40",
          warning: "!border-amber-500/30 !bg-amber-50/95 dark:!bg-amber-950/40",
          closeButton:
            "!border-border/60 !bg-background/80 !text-muted-foreground hover:!text-foreground",
          actionButton:
            "!rounded-lg !bg-primary !text-primary-foreground !text-xs !font-medium",
          cancelButton:
            "!rounded-lg !bg-muted !text-muted-foreground !text-xs !font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
