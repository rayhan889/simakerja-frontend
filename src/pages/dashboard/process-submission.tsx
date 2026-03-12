import { useGenerateFile } from '@/hooks/use-generate-file';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { useEffect, useMemo } from 'react'
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
  allVisibleStatuses,
  type ProcessRole,
} from '@/lib/process-submission-config';

const ProcessSubmissionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role as ProcessRole || 'lecturer';
  const config = roleConfigMap[role] || roleConfigMap['lecturer'];

  const { submissionId } = useParams<{ submissionId: string }>();

  const { pdfBlobUrl, isLoading, isError, error } = useGenerateFile(submissionId ?? null);

  useEffect(() => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
  }, [pdfBlobUrl]);

  const { mutate: process, isPending } = useProcessSubmission(submissionId ?? '', role);

  const {
    data: submissionResponse,
    isLoading: isLoadingSubmission,
    isError: isSubmissionError,
  } = useSubmissionDetails(submissionId || '');

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

  const processSubmissionSchema = useMemo(() => {
  const currentStatus = submissionResponse?.data?.status;
  const allowedStatuses = currentStatus && !config.selectableStatuses.includes(currentStatus)
    ? [...config.selectableStatuses, currentStatus]
    : config.selectableStatuses;

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
  }, [config.selectableStatuses, submissionResponse?.data?.status]);

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
    }, [submissionResponse?.data]);


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
  }, [submissionResponse?.data, form, config]);

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

      <div className='w-full flex items-center gap-4 h-[80vh]'>
        <div className='flex-2 items-center justify-center h-full'>
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
            <AccordionItem value="action">
              <AccordionTrigger className='font-semibold'>Tindakan</AccordionTrigger>
              <AccordionContent className='w-full flex items-start flex-col space-y-2'>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col space-y-3.5'>
                    <FormField
                      control={form.control}
                      name='submissionStatus'
                      render={({ field }) => (
                        <FormItem className='text-start flex flex-col space-y-2'>
                          <FormLabel required>Status Verifikasi</FormLabel>
                          <FormControl>
                            <Select
                              name={field.name}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full" ref={field.ref}>
                                <SelectValue placeholder="Verifikasi" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Status Verifikasi</SelectLabel>
                                  {allVisibleStatuses.map((status) => {
                                    const isSelectable = config.selectableStatuses.includes(status);
                                    return (
                                      <SelectItem
                                        key={status}
                                        value={status}
                                        disabled={!isSelectable}
                                        className={isSelectable ? '' : 'italic opacity-50'}
                                      >
                                        {submissionStatusLabels[status]}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(form.watch('submissionStatus') === 'rejected_adhoc' || form.watch('submissionStatus') === 'rejected_staff')  && (
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
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProcessSubmissionPage;
