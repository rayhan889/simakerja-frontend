import { useGenerateFile } from '@/hooks/use-generate-file';
import { useCallback, useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Download, Loader2, X } from 'lucide-react';
import { Document, Page } from 'react-pdf';

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
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const { pdfBlobUrl, isLoading, isError, error } = useGenerateFile(
        open ? submissionId : null
    )

    useEffect(() => {
        function resetPageNumber() {
            setPageNumber(1);
        }

      resetPageNumber();
    }, [open, submissionId])
    

    useEffect(() => {
      return () => {
        if (pdfBlobUrl) {
          URL.revokeObjectURL(pdfBlobUrl);
        }
      }
    }, [pdfBlobUrl])

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }, []);

    const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
    
    const handleDownload = () => {
        if (!pdfBlobUrl) return;
        
        const link = document.createElement('a');
        link.href = pdfBlobUrl;
        link.download = `dokumen_moa_ia_${partnerName?.replace(/\s+/g, '_') || submissionId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  return (
    <Dialog
        open={open}
        onOpenChange={onOpenChange}
    >
        <DialogContent 
                className="sm:max-w-7xl h-[94vh] flex flex-col p-0 gap-0"
                showCloseButton={true}
            >
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-white">
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="text-lg font-semibold truncate">
                            Preview Dokumen
                        </DialogTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={!pdfBlobUrl || isLoading}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Download className="h-4 w-4" />
                            Unduh
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-4">
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
                        <Document
                            file={pdfBlobUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                                </div>
                            }
                            error={
                                <p className="text-red-500 text-sm">Gagal memuat PDF</p>
                            }
                            className="flex flex-col items-center"
                        >
                            <Page
                                pageNumber={pageNumber}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="shadow-lg"
                                scale={2}
                            />
                        </Document>
                    )}
                </div>

                {numPages > 1 && (
                    <div className="px-6 py-3 border-t flex items-center justify-center gap-4 flex-shrink-0 bg-white">
                        <Button
                            variant="outline"
                            size="icon"
                            className='cursor-pointer'
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                            Halaman {pageNumber} dari {numPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className='cursor-pointer'
                            onClick={goToNextPage}
                            disabled={pageNumber >= numPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </DialogContent>
    </Dialog>
  )
}
