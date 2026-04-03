import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
            <LogOut className="h-6 w-6" />
          </div>
          <DialogTitle>Konfirmasi Keluar</DialogTitle>
          <DialogDescription className="text-center">
            Apakah Anda yakin ingin keluar dari akun ini?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-3 pt-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            Keluar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
