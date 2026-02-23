import { useGenerateFile } from '@/hooks/use-generate-file';
import { useEffect } from 'react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2, X } from 'lucide-react';
interface PDFViewerDialogProps {
    submissionId: string | null;
    partnerName?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PDFViewerDialog = ({
    submissionId,
    partnerName,
    open,
    onOpenChange
}: PDFViewerDialogProps) => { 

    const { pdfBlobUrl, isLoading, isError, error } = useGenerateFile(
        open ? submissionId : null
    )

    useEffect(() => {
        if (!open && pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
        }
    }, [open, pdfBlobUrl]);

  return (
    <Dialog
        open={open}
        onOpenChange={onOpenChange}
    >
        <DialogContent 
                showCloseButton={false}
                className="sm:max-w-7xl h-[94vh] flex flex-col p-0 gap-0"
            >

                <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                            <p className="text-sm text-gray-500">Memuat dokumen {partnerName}...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                            <div className="rounded-full bg-red-100 p-3">
                                <X className="h-6 w-6 text-red-600" />
                            </div>
                            <p className="text-sm text-red-600">
                                {error?.message || 'Gagal memuat dokumen'}
                            </p>
                        </div>
                    )}

                    {pdfBlobUrl && !isLoading && !isError && (
                        <iframe src={pdfBlobUrl} title="PDF Preview" className="w-full h-full rounded bg-white" />
                    )}
                </div>
            </DialogContent>
    </Dialog>
  )
}
