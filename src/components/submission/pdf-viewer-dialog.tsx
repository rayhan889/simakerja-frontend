import { useGenerateFile } from '@/hooks/use-generate-file';
import {
    Dialog,
    DialogContent,
    DialogTitle
} from '@/components/ui/dialog';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2, X } from 'lucide-react';
interface PDFViewerDialogProps {
    submissionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allowDownload?: boolean;
}

export const PDFViewerDialog = ({
    submissionId,
    open,
    onOpenChange,
    allowDownload = true
}: PDFViewerDialogProps) => {

    const { pdfBlobUrl, isLoading, isError, error } = useGenerateFile(
        open ? submissionId : null
    )

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogTitle className='hidden'>
                MoA IA PDF
            </DialogTitle>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-7xl h-[94vh] flex flex-col p-0 gap-0"
            >

                <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-1 rounded-sm">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                            <p className="text-sm text-gray-500">Memuat dokumen...</p>
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
                        <div 
                            className="relative w-full h-full"
                            onContextMenu={(e) => {
                                if (!allowDownload) e.preventDefault();
                            }}
                        >
                            {!allowDownload && (
                                <>
                                    <div 
                                        className="absolute top-0 left-0 w-full h-[56px] bg-gray-100 z-10 flex items-center justify-center border-b border-gray-200 px-2"
                                        title="Fitur download dan print dinonaktifkan"
                                    >
                                        <span className="text-sm font-medium bg-white px-4 py-1.5 rounded-md shadow-sm">
                                            Fitur unduh dan cetak dinonaktifkan. Pengajuan harus terverifikasi oleh staf untuk dapat didownload.
                                        </span>
                                    </div>
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                                        @media print {
                                            body { display: none !important; }
                                            * { display: none !important; }
                                        }
                                        `
                                    }} />
                                </>
                            )}
                            <iframe
                                src={allowDownload ? pdfBlobUrl : `${pdfBlobUrl}#toolbar=0&navpanes=0`}
                                title="PDF Preview"
                                className="w-full h-full rounded-md bg-white"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
