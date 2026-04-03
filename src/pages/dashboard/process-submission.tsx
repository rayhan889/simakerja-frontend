import { useGenerateFile } from '@/hooks/use-generate-file';
import { ArrowLeft, CheckCheck, CircleX, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router';
import * as z from 'zod'

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submissionStatusLabels } from '@/types/submission.type';
import type { SubmissionStatus } from '@/types/submission.type';
import { Button } from '@/components/ui/button';
import { useSubmissionDetails, useProcessSubmission } from '@/hooks/use-submission';
import { displayFullName } from '@/lib/display-fullname';
import { displayDateId } from '@/lib/display-date-id';
import { useAuth } from '@/hooks/use-auth';
import {
  roleConfigMap,
  type ProcessRole,
} from '@/lib/process-submission-config';
import { useGetPresignedUrlPartnerLogo } from '@/hooks/use-file-upload';
import { Input } from '@/components/ui/input';

const ProcessSubmissionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role as ProcessRole || 'lecturer';
  const config = roleConfigMap[role] || roleConfigMap['lecturer'];

  const { submissionId } = useParams<{ submissionId: string }>();

  const { pdfBlobUrl, isLoading: isLoadingGenerateFile, isError, error } = useGenerateFile(submissionId ?? null);

  const { mutate: getPresignedUrl } = useGetPresignedUrlPartnerLogo();

  const [scannedDocumentPreviewUrl, setScannedDocumentPreviewUrl] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'preview' | 'scanned'>('preview');

  const { mutate: process, isPending } = useProcessSubmission(submissionId ?? '', role);

  const {
    data: submissionResponse,
    isLoading: isLoadingSubmission,
    isError: isSubmissionError,
  } = useSubmissionDetails(submissionId || '');
  const moaIa = submissionResponse?.data?.moaIa;
  const isBothVerified = !!(submissionResponse?.data?.lecturerVerifiedAt && submissionResponse?.data?.staffVerifiedAt);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  useEffect(() => {
    if (moaIa?.scannedDocumentKey) {
      const fetchUrl = () => {
        getPresignedUrl(moaIa.scannedDocumentKey as string, {
          onSuccess: (response) => {
            setScannedDocumentPreviewUrl(response);
          },
          onError: (error) => {
            console.log("error getting presigned URL for scanned document: " + error.message)
          }
        });
      };

      fetchUrl();

      const intervalId = setInterval(fetchUrl, 14 * 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [moaIa?.scannedDocumentKey, getPresignedUrl]);

  const informationItems = [
    {
      label: 'Pengaju',
      content: (
        <td className='flex flex-col'>
          {displayFullName(submissionResponse?.data?.user.fullName || 'N/A')}
          <span className='text-gray-500 text-sm'>
            {submissionResponse?.data?.user.phoneNumber || '-'}
          </span>
        </td>
      ),
    },
    {
      label: 'Nama Mitra',
      content: (
        <td>
          {submissionResponse?.data?.moaIa?.partnerName || 'N/A'}
        </td>
      ),
    },
    {
      label: 'Tanggal Pengajuan',
      content: (
        <td>
          {displayDateId(submissionResponse?.data?.submissionDate as string) || 'N/A'}
        </td>
      ),
    },
  ];

  const allowedStatuses = useMemo(() => {
    const currentStatus = submissionResponse?.data?.status;
    return (currentStatus && !config.selectableStatuses.includes(currentStatus)
      ? [...config.selectableStatuses, currentStatus]
      : config.selectableStatuses) as SubmissionStatus[];
  }, [config.selectableStatuses, submissionResponse?.data?.status]);

  const processSubmissionSchema = useMemo(() => {
    return z.object({
      submissionStatus: z.enum(
        allowedStatuses as [SubmissionStatus, ...SubmissionStatus[]],
        { error: "Status pengajuan harus dipilih" }
      ),
      notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
    }).refine(
      (data) => data.submissionStatus !== 'rejected_adhoc' && data.submissionStatus !== 'rejected_staff' || (data.notes && data.notes.trim().length > 0),
      {
        message: "Catatan harus diisi ketika status rejected",
        path: ["notes"],
      }
    );
  }, [allowedStatuses]);

  type ProcessSubmissionFormData = z.infer<typeof processSubmissionSchema>;

  const form = useForm<ProcessSubmissionFormData>({
    resolver: zodResolver(processSubmissionSchema),
    defaultValues: {
      submissionStatus: config.defaultStatus,
      notes: '',
    },
    mode: 'onChange',
  });

  const currentFormValues = useWatch({
    control: form.control,
    name: ['submissionStatus', 'notes']
  });

  const originalValues = useMemo(() => {
    if (submissionResponse?.data) {
      return {
        submissionStatus: submissionResponse.data.status,
        notes: submissionResponse.data.notes || '',
      };
    }
    return null;
  }, [submissionResponse]);


  const hasChanges = useMemo(() => {
    if (!originalValues || !currentFormValues) return false;

    const [currentStatus, currentNotes] = currentFormValues;
    return (
      currentStatus !== originalValues.submissionStatus ||
      (currentNotes || '') !== originalValues.notes
    );
  }, [originalValues, currentFormValues]);

  useEffect(() => {
    if (submissionResponse?.data) {
      const status = submissionResponse.data.status;
      form.reset({
        submissionStatus: status,
        notes: submissionResponse.data.notes || '',
      });
    }
  }, [submissionResponse, form, config]);

  const onSubmit = (data: ProcessSubmissionFormData) => {
    process(data);
  };

  const handleReset = () => {
    form.reset();
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full h-full flex flex-col items-start space-y-6">
      <Button
        variant={'link'}
        className='cursor-pointer'
        onClick={() => goBack()}
      >
        <span className='text-sm'>
          <ArrowLeft className="h-4 w-4 inline mr-1" /> Kembali ke Daftar Pengajuan
        </span>
      </Button>

      <div>
        <h1 className="text-lg font-semibold text-gray-900 font-sans">
          Verifikasi Pengajuan MoA & IA Mahasiswa
        </h1>
      </div>

      <div className='w-full flex items-start gap-4 h-[80vh]'>
        <div className='flex-2 flex flex-col items-start justify-start h-full gap-2 relative'>
          <Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val as 'preview' | 'scanned')} className="w-full h-full flex flex-col gap-2">
            <div className="w-full flex justify-start">
              <TabsList className="bg-white border border-gray-200">
                <TabsTrigger value="preview" className="cursor-pointer">Preview Dokumen</TabsTrigger>
                <TabsTrigger value="scanned" className="cursor-pointer">Hasil Scan Dokumen</TabsTrigger>
              </TabsList>
            </div>

            <div className="w-full flex-1 relative rounded border border-gray-200">
              <TabsContent value="preview" forceMount hidden={selectedTab !== 'preview'} className="w-full h-full m-0 data-[state=inactive]:hidden flex flex-col items-center justify-center bg-white rounded p-4 text-center">
                <div className="w-full h-full bg-white rounded">
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

                  {isLoadingGenerateFile && (
                    <div className="flex items-center h-full justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memuat dokumen...
                    </div>
                  )}

                  {pdfBlobUrl && !isLoadingGenerateFile && !isError && (
                    <iframe src={pdfBlobUrl} title="PDF Preview" className="w-full h-full rounded" />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="scanned" forceMount hidden={selectedTab !== 'scanned'} className="w-full h-full m-0 data-[state=inactive]:hidden flex flex-col items-center justify-center bg-white rounded p-4 text-center">
                {!isBothVerified ? (
                  <div className=" text-gray-500 flex flex-col space-y-5 items-center justify-center">
                    <CircleX className='h-5 w-5' />
                    <p className='text-sm'>Dokumen ini hanya dapat dilihat jika sudah diverifikasi oleh Dosen dan Staff.</p>
                  </div>
                ) : moaIa?.scannedDocumentKey ? (
                  scannedDocumentPreviewUrl ? (
                    <iframe src={scannedDocumentPreviewUrl} title="Scanned Document Preview" className="w-full h-full rounded" />
                  ) : (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memuat hasil scan...
                    </div>
                  )
                ) : (
                  <p className="text-sm text-gray-500 font-medium">Mahasiswa belum mengirimkan hasil scan dokumen</p>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <div className='flex-1 h-full flex items-start justify-center p-4 bg-white rounded-md border-gray-200'>
          <Accordion
            type="multiple"
            defaultValue={["doc_information"]}
            className='w-md'
          >
            <AccordionItem value="doc_information">
              <AccordionTrigger className='font-semibold'>Informasi Dokumen Pengajuan</AccordionTrigger>
              <AccordionContent className='w-full flex items-start flex-col space-y-2'>
                <div className='ml-0'>
                  <table className='w-full border-collapse text-left'>
                    {isSubmissionError && (
                      <tbody>
                        <tr>
                          <td className='py-2 px-4 font-medium text-gray-700 w-1/3'>Error</td>
                          <td className='py-2 px-4 text-red-600'>{'Gagal memuat dokumen'}</td>
                        </tr>
                      </tbody>
                    )}

                    {isLoadingSubmission ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memuat...
                      </div>
                    ) : (
                      <tbody>
                        {informationItems.map((content) => (
                          <tr key={content.label}>
                            <td className='py-2 px-4 font-medium text-gray-700 w-1/3'>{content.label}</td>
                            {content.content}
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
            {submissionResponse?.data?.status === 'completed' ? (
              <div className="w-full p-4 bg-teal-50 border text-start border-teal-200  rounded-lg flex items-start gap-3">
                <CheckCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-teal-800">
                    Dokumen terselesaikan
                  </p>
                  <p className="text-xs text-teal-700 mt-1">
                    Status dokumen pengajuan telah <b>Selesai</b> (terverifikasi baik oleh Dosen dan Staf).
                  </p>
                </div>
              </div>
            ) : (
              <AccordionItem value="action">
                <AccordionTrigger className='font-semibold'>Tindakan</AccordionTrigger>
                <AccordionContent className='w-full flex items-start flex-col space-y-2'>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col space-y-3.5'>
                      <div className='text-start flex flex-col space-y-2'>
                        <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-1'>
                          Status Verifikasi Saat Ini
                        </label>
                        <Input
                            disabled
                            className="w-full bg-gray-100 cursor-not-allowed"
                            value={submissionStatusLabels[submissionResponse?.data?.status as SubmissionStatus] || 'N/A'}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name='submissionStatus'
                        render={({ field }) => (
                          <FormItem className='text-start flex flex-col space-y-2'>
                            <FormLabel required>Terverifikasi Ke</FormLabel>
                            <FormControl>
                              <Select
                                name={field.name}
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="w-full" ref={field.ref}>
                                  <SelectValue placeholder="Terverifikasi Ke" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Terverifikasi Ke</SelectLabel>
                                    {allowedStatuses.map((status) => (
                                      <SelectItem
                                          key={status}
                                          value={status}
                                        >
                                          {submissionStatusLabels[status]}
                                        </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(currentFormValues?.[0] === 'rejected_adhoc' || currentFormValues?.[0] === 'rejected_staff') && (
                        <FormField
                          control={form.control}
                          name='notes'
                          render={({ field }) => (
                            <FormItem className='text-start flex flex-col space-y-2'>
                              <FormLabel>Catatan</FormLabel>
                              <FormControl>
                                <textarea
                                  {...field}
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  placeholder="Tambahkan catatan tambahan jika diperlukan..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size='lg'
                          onClick={handleReset}
                          disabled={isPending}
                          className='cursor-pointer border-gray-400'
                        >
                          Reset
                        </Button>

                        <Button
                          type="submit"
                          size='lg'
                          disabled={isPending || !hasChanges}
                          className="bg-teal-950 hover:bg-teal-800 text-white font-medium cursor-pointer"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Memverifikasi...
                            </>
                          ) : (
                            'Update Verifikasi'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProcessSubmissionPage;
