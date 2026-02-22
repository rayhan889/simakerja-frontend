import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FeatureBlockDialogProps = {
    reason: string,
    redirectTo?: string
}

export const FeatureBlockDialog = ({ reason, redirectTo }: FeatureBlockDialogProps) => {
  return (
    <Dialog open={true} onOpenChange={() => {
        if (redirectTo) {
            window.location.href = redirectTo;
        }  
    }}>
        <DialogContent showCloseButton={true}>
            <DialogHeader>
            <DialogTitle>Limitasi Hak Akses</DialogTitle>
            <DialogDescription>
                {reason}
            </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>
  )
}
