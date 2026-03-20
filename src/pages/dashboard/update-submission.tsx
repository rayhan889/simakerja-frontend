import { usePartners, useSubmissionDetails, useUpdateSubmission } from '@/hooks/use-submission';
import { ArrowLeft, BookText, FileText, Info, Loader2, Plus, Trash2, UploadCloud, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { activityLabels, partnerCooperationPeriodOptions, studyProgramOptions, type StudyProgram } from '@/types/submission.type';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetPresignedUrlPartnerLogo, useUploadPartnerLogo, useUploadScannedDocument } from '@/hooks/use-file-upload';
import { toast } from 'sonner';
import { trigramSimilarity } from '@/lib/trigram';
import { useDropzone } from 'react-dropzone';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from "@/components/ui/multi-select"
import { useGetAllRegisteredFilteredStudents } from '@/hooks/use-user';
import { displayFullName } from '@/lib/display-fullname';
import { useAuth } from '@/hooks/use-auth';
import {
    studentSnapshotSchema,
    studentSnapshotsSuperRefine,
    studentInfoToNims,
    nimsToStudentInfo,
    buildExcludedNimsPerGroup,
} from '@/lib/submission-form-utils';

const updateMoaIaSchema = z.object({
    partnerName: z
        .string({ error: "Nama mitra harus diisi" })
        .min(1, "Nama mitra harus diisi")
        .max(255, "Nama mitra maksimal 255 karakter"),

    partnerNumber: z
        .string()
        .min(3, "Nomor mitra minimal 3 karakter")
        .max(50, "Nomor mitra maksimal 50 karakter")
        .regex(/^\d+$/, "Nomor mitra hanya boleh berisi angka")
        .optional()
        .or(z.literal("")),

    partnerAddress: z.string({ error: "Alamat mitra harus diisi" })
        .min(1, "Alamat mitra harus diisi")
        .max(500, "Alamat mitra maksimal 500 karakter"),

    partnerLogoKey: z.string({ error: "Logo mitra harus diunggah" }).min(1, "Logo mitra harus diunggah"),

    facultyRepresentativeName: z
        .string({ error: "Nama perwakilan fakultas harus diisi" })
        .min(1, "Nama perwakilan fakultas harus diisi")
        .max(255, "Nama perwakilan fakultas maksimal 255 karakter"),

    partnerRepresentativeName: z
        .string({ error: "Nama perwakilan mitra harus diisi" })
        .min(1, "Nama perwakilan mitra harus diisi")
        .max(255, "Nama perwakilan mitra maksimal 255 karakter"),

    partnerRepresentativePosition: z
        .string({ error: "Posisi perwakilan mitra harus diisi" })
        .min(1, "Posisi perwakilan mitra harus diisi")
        .max(255, "Posisi perwakilan mitra maksimal 255 karakter"),

    activityType: z.enum(
        ['internship', 'study_independent', 'kkn'],
        { error: "Tipe aktivitas harus dipilih" }
    ),

    partnerCooperationPeriod: z.number({ error: "Periode kerja sama harus diisi" })
        .min(1, "Periode kerja sama minimal 1 tahun")
        .max(7, "Periode kerja sama maksimal 7 tahun"),

    studentSnapshots: z
        .array(studentSnapshotSchema)
        .min(1, "Minimal 1 grup mahasiswa harus ditambahkan")
        .superRefine(studentSnapshotsSuperRefine),

    scannedDocumentKey: z.string().nullish(),

    averageConfidence: z.number().nullish(),
});

const updateSubmissionFormSchema = z.object({
    notes: z
        .string()
        .max(500, "Catatan maksimal 500 karakter")
        .optional()
        .or(z.literal('')),

    moaIa: updateMoaIaSchema,
});

type UpdateSubmissionFormValues = z.infer<typeof updateSubmissionFormSchema>;

const DashboardUpdateSubmissionPage = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();

    const { user } = useAuth();
    const isValidStudent = user?.role === 'student' && user?.nim && user?.studyProgram;
    const userStudyProgram = isValidStudent ? user.studyProgram : undefined;
    const userNim = isValidStudent ? user.nim : undefined;

    const {
        data: submissionResponse,
        isLoading: isLoadingSubmission,
        isError: isSubmissionError,
        error: submissionError
    } = useSubmissionDetails(submissionId || '');

    const { data: partnersResponse } = usePartners();

    const submissionDetails = submissionResponse?.data;
    const moaIaDetails = submissionDetails?.moaIa ?? null;

    const isFinalizationDocument = submissionDetails?.lecturerVerifiedAt && submissionDetails?.staffVerifiedAt;

    const { mutate: getPresignedUrlPartnerLogo, isPending: isLoadingGetPresignedUrl } = useGetPresignedUrlPartnerLogo();

    const [partnerLogoPreviewUrl, setPartnerLogoPreviewUrl] = useState<string | null>(null);

    const [scannedDocumentPreviewUrl, setScannedDocumentPreviewUrl] = useState<string | null>(null);

    const { mutate: updateSubmission, isPending } = useUpdateSubmission(submissionId || '');

    const { mutate: uploadPartnerLogo, isPending: isUploadingPartnerLogo } = useUploadPartnerLogo();

    const { mutate: uploadScannedDocument, isPending: isUploadingScannedDocument } = useUploadScannedDocument(submissionId || '');

    const form = useForm<UpdateSubmissionFormValues>({
        resolver: zodResolver(updateSubmissionFormSchema),
        mode: 'onChange',
        defaultValues: {
            moaIa: {
                studentSnapshots: [{ studyProgram: '', students: [], unit: '' }],
                averageConfidence: 0,
            }
        }
    });

    const studentSnapshots = useWatch({
        control: form.control,
        name: 'moaIa.studentSnapshots',
    });

    const filteredStudentsQueries = useGetAllRegisteredFilteredStudents(undefined, studentSnapshots);

    const excludedNimsPerGroup = useMemo(
        () => buildExcludedNimsPerGroup(studentSnapshots),
        [studentSnapshots]
    );

    useEffect(() => {
        if (moaIaDetails?.partnerLogoKey) {
            getPresignedUrlPartnerLogo(moaIaDetails.partnerLogoKey, {
                onSuccess: (response) => {
                    setPartnerLogoPreviewUrl(response);
                },
                onError: (error) => {
                    console.log("error getting presigned URL for partner logo: " + error.message)
                }
            })
        }
    }, [moaIaDetails?.partnerLogoKey, getPresignedUrlPartnerLogo])

    // TODO: should be fixed later. But right now, this method is used to also get document preview url
    useEffect(() => {
        if (moaIaDetails?.scannedDocumentKey) {
            getPresignedUrlPartnerLogo(moaIaDetails.scannedDocumentKey, {
                onSuccess: (response) => {
                    setScannedDocumentPreviewUrl(response);
                },
                onError: (error) => {
                    console.log("error getting presigned URL for scanned document: " + error.message)
                }
            })
        }
    }, [moaIaDetails?.scannedDocumentKey, getPresignedUrlPartnerLogo])

    const isPartnerExisting = moaIaDetails && partnersResponse?.data?.some(
        p => p.partnerName === moaIaDetails.partnerName && (
            p.partnerNumber ? p.partnerNumber === moaIaDetails.partnerNumber : true
        )
    );

    const isPartnerFieldDisabled = !!isPartnerExisting;

    const formPartnerName = form.watch('moaIa.partnerName');
    const formPartnerNumber = form.watch('moaIa.partnerNumber');
    useEffect(() => {

        const timeoutId = setTimeout(() => {
            partnersResponse?.data.forEach(partner => {

                const partnerNameSimilaryPoint = trigramSimilarity(partner.partnerName, formPartnerName);
                if (!isPartnerFieldDisabled && (partnerNameSimilaryPoint > 0.6 && partner.partnerNumber === formPartnerNumber)) {
                    toast.error(`
                        Profil mitra yang Anda masukkan mirip dengan mitra yang sudah ada: 
                        "${partner.partnerName}". Jika ini adalah mitra baru, 
                        silakan gunakan nama & nomor yang berbeda untuk menghindari duplikasi.
                    `, {
                        duration: 10000,
                    })
                    return;
                }
            });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formPartnerName, formPartnerNumber, partnersResponse, isPartnerFieldDisabled])

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "moaIa.studentSnapshots"
    });

    const onUploadPartnerLogo = useCallback(async (file: File) => {
        uploadPartnerLogo(file, {
            onSuccess: (response) => {
                if (response) {
                    setPartnerLogoPreviewUrl(response.previewUrl);
                    form.setValue('moaIa.partnerLogoKey', response.objectKey, { shouldDirty: true });
                }
            },
            onError: (error) => {
                setPartnerLogoPreviewUrl(null);
                form.setValue('moaIa.partnerLogoKey', '', { shouldDirty: true });
                toast.error("Gagal mengunggah logo")
                console.log("error uploading partner logo: " + error.message)
            }
        })
    }, [uploadPartnerLogo, form]);

    const onDropPartnerLogo = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            onUploadPartnerLogo(file);
        }
    }, [onUploadPartnerLogo]);

    const onUploadScannedDocument = useCallback((file: File) => {
        uploadScannedDocument(file, {
            onSuccess: (response) => {
                if (response) {
                    setScannedDocumentPreviewUrl(response.previewUrl);
                    form.setValue('moaIa.scannedDocumentKey', response.objectKey, { shouldDirty: true });
                    form.setValue('moaIa.averageConfidence', response.averageConfidence, { shouldDirty: true });
                    console.log("average confidence: " + response.averageConfidence)
                }
            },
            onError: (error) => {
                setScannedDocumentPreviewUrl(null);
                form.setValue('moaIa.scannedDocumentKey', '', { shouldDirty: true });
                form.setValue('moaIa.averageConfidence', 0, { shouldDirty: true });
                toast.error("Gagal mengunggah dokumen")
                console.log("error uploading scanned document: " + error.message)
            }
        })
    }, [uploadScannedDocument, form]);

    const onDropScannedDocument = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            onUploadScannedDocument(file);
        }
    }, [onUploadScannedDocument]);

    const { getRootProps: getRootPropsPartnerLogo, getInputProps: getInputPropsPartnerLogo, isDragActive: isPartnerLogoDragActive, fileRejections: partnerLogoFileRejections } =
        useDropzone({
            onDrop: onDropPartnerLogo,
            accept: { 'image/*': ['.jpg', '.png', '.jpeg'] },
            maxFiles: 1,
            maxSize: 1 * 1024 * 1024, // 1MB
        });

    const { getRootProps: getRootPropsScannedDocument, getInputProps: getInputPropsScannedDocument, isDragActive: isScannedDocumentDragActive, fileRejections: scannedDocumentFileRejections } =
        useDropzone({
            onDrop: onDropScannedDocument,
            accept: { 'application/pdf': ['.pdf'] },
            maxFiles: 1,
            maxSize: 1 * 1024 * 1024, // 1MB
        });

    const removePartnerLogo = () => {
        setPartnerLogoPreviewUrl(null);
        form.setValue('moaIa.partnerLogoKey', '', { shouldDirty: true });
    }

    const removeScannedDocument = () => {
        setScannedDocumentPreviewUrl(null);
        form.setValue('moaIa.scannedDocumentKey', '', { shouldDirty: true });
    }

    useEffect(() => {
        if (moaIaDetails) {
            form.reset({
                notes: submissionDetails?.notes || '',
                moaIa: {
                    partnerName: moaIaDetails.partnerName,
                    partnerNumber: moaIaDetails.partnerNumber,
                    partnerAddress: moaIaDetails.partnerAddress,
                    partnerLogoKey: moaIaDetails.partnerLogoKey,
                    facultyRepresentativeName: moaIaDetails.facultyRepresentativeName,
                    partnerRepresentativeName: moaIaDetails.partnerRepresentativeName,
                    partnerRepresentativePosition: moaIaDetails.partnerRepresentativePosition,
                    activityType: moaIaDetails.activityType,
                    partnerCooperationPeriod: moaIaDetails.partnerCooperationPeriod,
                    studentSnapshots: moaIaDetails.studentSnapshots.map(s => ({
                        studyProgram: s.studyProgram,
                        students: s.students,
                        unit: s.unit,
                    })),
                    scannedDocumentKey: moaIaDetails.scannedDocumentKey ?? undefined,
                    averageConfidence: moaIaDetails.averageConfidence ?? undefined,
                }
            });
        }
    }, [submissionDetails, moaIaDetails, form]);

    useEffect(() => {
        if (!isValidStudent) return;

        const firstQuery = filteredStudentsQueries[0];
        const studentsData = firstQuery?.data?.data;

        if (!studentsData) return;

        const authStudentInfo = studentsData.find(s => s.nim === userNim);

        if (!authStudentInfo) return;

        const currentStudents = form.getValues('moaIa.studentSnapshots.0.students') || [];
        if (currentStudents.some(s => s.nim === userNim)) return;

        form.setValue(
            'moaIa.studentSnapshots.0.students',
            [authStudentInfo, ...currentStudents],
            { shouldDirty: true }
        );
    }, [isValidStudent, userNim, filteredStudentsQueries, form]);

    const onSubmit = (data: UpdateSubmissionFormValues) => {
        updateSubmission({
            notes: data.notes,
            moaIa: data.moaIa
        });
    };

    if (isLoadingSubmission) {
        return (
            <div className="flex items-center justify-center min-h-[400px] ">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">Memuat data pengajuan...</span>
            </div>
        );
    }

    if (isSubmissionError || !moaIaDetails) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8  w-full">
                <div className="flex flex-col items-center text-center">
                    <h3 className="mt-4 text-lg font-medium text-red-800">
                        Gagal Memuat Data
                    </h3>
                    <p className="mt-2 text-sm text-red-600">
                        {submissionError?.message || 'Data pengajuan tidak ditemukan atau tipe tidak sesuai.'}
                    </p>
                    <Button
                        onClick={() => navigate('/dashboard/track-submission')}
                        variant="outline"
                        className="mt-4"
                    >
                        Kembali ke Daftar
                    </Button>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full h-auto  flex flex-col items-start space-y-6 ">
            <Button
                variant={'link'}
                className='cursor-pointer'
                onClick={() => navigate("/dashboard/track-submission")}
            >
                <span className='text-sm'>
                    <ArrowLeft className="h-4 w-4 inline mr-1" /> Kembali ke Daftar Pengajuan
                </span>
            </Button>

            <div>
                <h1 className="text-lg font-semibold text-gray-900 font-sans">
                    Edit Pengajuan Dokumen
                </h1>
            </div>

            {(isPartnerFieldDisabled && !isFinalizationDocument) && (
                <div className="w-full p-4 bg-amber-50 border text-start border-amber-200  rounded-lg flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">
                            Informasi mitra tidak dapat diubah
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                            Mitra ini sudah terdaftar dalam sistem. Anda hanya dapat mengubah data mahasiswa dan catatan.
                        </p>
                    </div>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col space-y-3.5">
                    {!isFinalizationDocument && (
                        <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 ">
                            <div className='flex items-center gap-x-3'>
                                <BookText className='h-5 w-5' />
                                <div className='flex items-start flex-col space-y-0.5'>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Informasi Mitra Kerjasama
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        Informasi ini akan digunakan untuk membuat MoA/MoU dengan mitra. Pastikan data yang dimasukkan sudah benar.
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                                <FormField
                                    control={form.control}
                                    name="moaIa.partnerName"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel>Nama Mitra <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPartnerFieldDisabled}
                                                    placeholder="Nama perusahaan/institusi mitra"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.facultyRepresentativeName"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel>Nama Perwakilan Fakultas <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled
                                                    placeholder="Nama perwakilan dari fakultas"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.partnerAddress"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel>Alamat Mitra <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPartnerFieldDisabled}
                                                    placeholder="Alamat mitra"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.partnerNumber"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel>Nomor Mitra <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPartnerFieldDisabled}
                                                    placeholder={
                                                        isPartnerFieldDisabled ?
                                                            (field.value || "(Tidak dicantumkan)") : "Nomor mitra"
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.partnerRepresentativeName"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel>Nama Perwakilan Mitra <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPartnerFieldDisabled}
                                                    placeholder="Nama perwakilan dari mitra"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.partnerRepresentativePosition"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel>Posisi Perwakilan Mitra <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPartnerFieldDisabled}
                                                    placeholder="CTO"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.activityType"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel>Tipe Aktivitas <span className="text-red-500">*</span></FormLabel>
                                            <Select
                                                key={field.value}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={isPartnerFieldDisabled}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder="Pilih Tipe Aktivitas" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Tipe Aktivitas</SelectLabel>
                                                        {Object.entries(activityLabels).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.partnerCooperationPeriod"
                                    render={({ field }) => (
                                        <FormItem className='text-start flex flex-col space-y-2'>
                                            <FormLabel required>Periode Kerja Sama</FormLabel>
                                            <FormControl>
                                                <Select
                                                    key={field.value}
                                                    name={field.name}
                                                    value={
                                                        field.value !== null && field.value !== undefined
                                                            ? String(field.value)
                                                            : undefined
                                                    }
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    disabled={isPartnerFieldDisabled}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih Periode Kerja Sama" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Periode Kerja Sama</SelectLabel>
                                                            {partnerCooperationPeriodOptions.map(({ label, value }) => (
                                                                <SelectItem
                                                                    key={`period-${value}`}
                                                                    value={String(value)}
                                                                >
                                                                    {label}
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

                                {isPartnerFieldDisabled ? (
                                    <div className="col-span-4 rounded-lg border border-teal-200 bg-teal-50 p-2">
                                        <p className="text-sm text-teal-800">
                                            <span className="font-medium">Logo Mitra:</span> Menggunakan logo yang sudah tersimpan dari profil mitra "{moaIaDetails.partnerName}".
                                        </p>
                                    </div>
                                ) : (
                                    <FormField
                                        control={form.control}
                                        name="moaIa.partnerLogoKey"
                                        render={() => (
                                            <FormItem className='text-start flex flex-col space-y-2 col-span-4'>
                                                <FormLabel required>Logo Mitra</FormLabel>
                                                {isLoadingGetPresignedUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                                        <span className="text-sm text-gray-500">Memuat logo...</span>
                                                    </div>
                                                )}
                                                {partnerLogoPreviewUrl ? (
                                                    <div className='w-full border border-gray-200 max-h-60 overflow-hidden relative rounded-md bg-transparent p-3'>

                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='absolute top-2 cursor-pointer right-2 z-50 text-red-500 hover:text-red-700 hover:bg-red-50'
                                                            onClick={() => { removePartnerLogo(); }}
                                                        >
                                                            <Trash2 />
                                                        </Button>

                                                        <img src={partnerLogoPreviewUrl} alt="Partner Logo Preview" className="w-full h-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <FormControl>
                                                        <div
                                                            {...getRootPropsPartnerLogo()}
                                                            className={`flex max-h-80 
                                                        ${isPartnerFieldDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                                        ${isPartnerLogoDragActive ? 'bg-blue-50 border-blue-500' : ''} 
                                                        ${partnerLogoPreviewUrl ? 'border-none' : 'border-gray-200 h-40'}
                                                        w-full cursor-pointer items-center justify-center space-x-2 overflow-y-hidden rounded-md border border-dashed bg-transparent text-sm`
                                                            }
                                                        >
                                                            {isUploadingPartnerLogo ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500" />
                                                                    <span>Mengunggah...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UploadCloud className='h-5 w-5 text-gray-500' />
                                                                    {
                                                                        isPartnerLogoDragActive ? (
                                                                            <p className="text-sm text-gray-500">Lepaskan file di sini</p>
                                                                        ) : (
                                                                            <p className="text-sm text-gray-500">Tarik dan lepaskan file atau klik untuk memilih file</p>
                                                                        )
                                                                    }
                                                                </>
                                                            )}
                                                            <Input {...getInputPropsPartnerLogo()} type='file' />
                                                        </div>
                                                    </FormControl>
                                                )}
                                                <FormMessage>
                                                    {partnerLogoFileRejections.length !== 0 && (
                                                        <span className="text-sm text-red-500">
                                                            {partnerLogoFileRejections[0].errors[0].code === 'file-too-large' && 'File terlalu besar. Maksimal 10MB.'}
                                                            {partnerLogoFileRejections[0].errors[0].code === 'file-invalid-type' && 'Tipe file tidak valid. Hanya gambar (.jpg, .png, .jpeg) yang diperbolehkan.'}
                                                        </span>
                                                    )}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {isFinalizationDocument && (
                        <>
                            <div className="w-full p-4 bg-amber-50 border text-start border-amber-200  rounded-lg flex items-start gap-3">
                                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">
                                        Mode finalisasi pengajuan
                                    </p>
                                    <p className="text-xs tracking-wide text-amber-700 mt-1">
                                        Pada mode finalisasi, informasi mengenai pengajuan(profil mitra, fakultas dan lampiran) telah final dan tidak dapat diubah kembali, karena pengajuan telah terverifikasi oleh Dosen & Staf. Mahasiswa dipersilahkan mengupload hasil scan dari dokumen pengajuan yang telah terverifikasi.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 ">
                                <div className='flex items-start gap-x-3'>
                                    <FileText className='h-5 w-5 mt-4' />
                                    <div className='flex items-start flex-col space-y-0.5'>
                                        <h2 className="text-base font-bold text-gray-900">
                                            Finalisasi Dokumen MoA IA
                                        </h2>
                                        <span className="text-sm text-gray-700">
                                            Unggah hasil scan dokumen MoA IA yang sudah final. Pastikan dokumen memenuhi syarat berikut,
                                        </span>
                                        <ol className='text-sm text-gray-700 list-decimal text-start list-inside mt-2 space-y-1'>
                                            <li>Scan dokumen yang diunggah adalah dokumen <span className='font-semibold'>MoA/IA Terintegrasi</span> yang sebelumnya diajukan dan telah diverifikasi baik oleh Dosen & Staf.</li>
                                            <li>Scan dokumen harus dalam format <span className='font-semibold'>PDF</span>.</li>
                                            <li>Scan dokumen harus sudah ditandatangani oleh kedua belah pihak.</li>
                                            <li>Ukuran file maksimal <span className='font-semibold'>1MB</span>.</li>
                                            <li>Pastikan kualitas scan cukup baik dan tidak terdapat blur pada tiap-tiap halaman.</li>
                                        </ol>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="moaIa.scannedDocumentKey"
                                    render={() => (
                                        <FormItem className='text-start flex flex-col space-y-2 w-full'>
                                            <FormLabel required>Hasil Scan Dokumen</FormLabel>
                                            {isLoadingGetPresignedUrl && (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                                    <span className="text-sm text-gray-500">Memuat dokumen...</span>
                                                </div>
                                            )}
                                            {scannedDocumentPreviewUrl ? (
                                                <div className='w-full border border-gray-200 h-screen overflow-hidden relative rounded-md bg-transparent p-3'>

                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='absolute top-2 cursor-pointer right-2 z-50 text-red-500 hover:text-red-700 hover:bg-red-50'
                                                        onClick={() => { removeScannedDocument(); }}
                                                    >
                                                        <Trash2 />
                                                    </Button>

                                                    <iframe
                                                        src={scannedDocumentPreviewUrl}
                                                        title="Scanned Document Preview"
                                                        className="w-full h-full object-contain pt-12"
                                                    />
                                                </div>
                                            ) : (
                                                <FormControl>
                                                    <div
                                                        {...getRootPropsScannedDocument()}
                                                        className={`flex max-h-80
                                                    ${isPartnerFieldDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                                    ${isScannedDocumentDragActive ? 'bg-blue-50 border-blue-500' : ''} 
                                                    ${scannedDocumentPreviewUrl ? 'border-none' : 'border-gray-400 h-40'}
                                                    w-full cursor-pointer items-center justify-center space-x-2 overflow-y-hidden rounded-md border border-dashed bg-transparent text-sm`
                                                        }
                                                    >
                                                        {isUploadingScannedDocument ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-gray-500" />
                                                                <span>Mengunggah...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UploadCloud className='h-5 w-5 text-gray-500' />
                                                                {
                                                                    isScannedDocumentDragActive ? (
                                                                        <p className="text-sm text-gray-500">Lepaskan file di sini</p>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500">Tarik dan lepaskan file atau klik untuk memilih file</p>
                                                                    )
                                                                }
                                                            </>
                                                        )}
                                                        <Input {...getInputPropsScannedDocument()} type='file' />
                                                    </div>
                                                </FormControl>
                                            )}
                                            <FormMessage>
                                                {scannedDocumentFileRejections.length !== 0 && (
                                                    <span className="text-sm text-red-500">
                                                        {scannedDocumentFileRejections[0].errors[0].code === 'file-too-large' && 'File terlalu besar. Maksimal 10MB.'}
                                                        {scannedDocumentFileRejections[0].errors[0].code === 'file-invalid-type' && 'Tipe file tidak valid. Hanya gambar (.jpg, .png, .jpeg) yang diperbolehkan.'}
                                                    </span>
                                                )}
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </>
                    )}

                    {!isFinalizationDocument && (
                        <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 ">
                            <div className='flex items-center gap-x-3'>
                                <User className='h-5 w-5' />
                                <div className='flex items-start flex-col space-y-0.5'>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Data Mahasiswa
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        Data mahasiswa yang terlibat. Tambahkan lebih dari satu grup jika terdapat beberapa program studi.
                                    </span>
                                </div>
                            </div>

                            <div className='w-full space-y-6'>
                                {fields.map((field, index) => {
                                    const queryForThisGroup = filteredStudentsQueries[index];
                                    const studentsData = queryForThisGroup?.data;
                                    const isLoadingStudents = queryForThisGroup?.isLoading;
                                    const errorStudents = queryForThisGroup?.error;
                                    const currentStudyProgram = studentSnapshots?.[index]?.studyProgram as
                                        | StudyProgram
                                        | undefined;

                                    const isValidStudentsAvailable =
                                        !!studentsData?.data && studentsData.data.length > 0;

                                    const excludedNims = excludedNimsPerGroup[index] ?? new Set<string>();
                                    return (
                                        <div
                                            key={field.id}
                                            className="relative border border-gray-200 rounded-lg p-4 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                    Group #{index + 1}
                                                </span>

                                                {fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => remove(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`moaIa.studentSnapshots.${index}.studyProgram`}
                                                    render={({ field }) => (
                                                        <FormItem className='text-start flex flex-col space-y-2'>
                                                            <FormLabel>Program Studi <span className="text-red-500">*</span></FormLabel>
                                                            <Select
                                                                name={field.name}
                                                                onValueChange={(val) => {
                                                                    field.onChange(val)
                                                                    form.setValue(`moaIa.studentSnapshots.${index}.students`, [], { shouldValidate: true });
                                                                }}
                                                                value={field.value}
                                                                disabled={index === 0 && !!userStudyProgram}
                                                            >
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder="Program studi" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Program Studi</SelectLabel>
                                                                        {studyProgramOptions.map((option) => (
                                                                            <SelectItem key={option.value} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`moaIa.studentSnapshots.${index}.unit`}
                                                    render={({ field }) => (
                                                        <FormItem className='text-start flex flex-col space-y-2'>
                                                            <FormLabel>Unit/Departemen <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Tech Department"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {errorStudents ? (
                                                <div className="text-red-500 text-sm">Gagal memuat daftar mahasiswa</div>
                                            ) : (
                                                <FormField
                                                    control={form.control}
                                                    name={`moaIa.studentSnapshots.${index}.students`}
                                                    render={({ field }) => (
                                                        <FormItem className='text-start flex flex-col space-y-2'>
                                                            <FormLabel required>Daftar Mahasiswa</FormLabel>
                                                            <FormControl>
                                                                <div className="space-y-2">
                                                                    <MultiSelect
                                                                        values={studentInfoToNims(field.value)}
                                                                        onValuesChange={(nims) => {
                                                                            let nextNims = nims;

                                                                            if (index === 0 && userNim) {
                                                                                if (!nextNims.includes(userNim)) {
                                                                                    nextNims = [...nextNims, userNim];
                                                                                }
                                                                            }

                                                                            const studentsList = filteredStudentsQueries[index]?.data?.data;

                                                                            field.onChange(nimsToStudentInfo(nextNims, studentsList));
                                                                        }}
                                                                    >
                                                                        <MultiSelectTrigger
                                                                            className="w-full"
                                                                            disabled={
                                                                                !currentStudyProgram ||
                                                                                isLoadingStudents ||
                                                                                !isValidStudentsAvailable
                                                                            }
                                                                        >
                                                                            <MultiSelectValue
                                                                                placeholder={
                                                                                    !currentStudyProgram
                                                                                        ? 'Pilih program studi terlebih dahulu'
                                                                                        : isLoadingStudents
                                                                                            ? 'Memuat mahasiswa...'
                                                                                            : isValidStudentsAvailable
                                                                                                ? 'Pilih mahasiswa'
                                                                                                : 'Tidak ada mahasiswa yang terdaftar untuk program studi ini'
                                                                                }
                                                                            />
                                                                        </MultiSelectTrigger>

                                                                        {isValidStudentsAvailable && (
                                                                            <MultiSelectContent>
                                                                                <MultiSelectGroup>
                                                                                    {studentsData?.data.map((student) => {
                                                                                        const isAuthUser = index === 0 && student.nim === userNim;
                                                                                        const isSelectedElsewhere = excludedNims.has(student.nim);
                                                                                        return (
                                                                                            <MultiSelectItem
                                                                                                key={student.nim}
                                                                                                value={student.nim}
                                                                                                disabled={isAuthUser || isSelectedElsewhere}
                                                                                            >
                                                                                                [{student.nim}] - {displayFullName(student.fullName)}
                                                                                                {isSelectedElsewhere && (
                                                                                                    <span className="ml-1 text-xs text-gray-400">(sudah dipilih di grup lain)</span>
                                                                                                )}
                                                                                            </MultiSelectItem>
                                                                                        )
                                                                                    })}
                                                                                </MultiSelectGroup>
                                                                            </MultiSelectContent>
                                                                        )}
                                                                    </MultiSelect>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            <div className="flex items-center gap-4">
                                                <Label className="text-sm text-gray-600">Total Mahasiswa:</Label>
                                                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-teal-100 text-teal-800">
                                                    {form.watch(`moaIa.studentSnapshots.${index}.students`)?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ studyProgram: '', students: [], unit: '' })}
                                    className="w-full border-dashed cursor-pointer"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Grup
                                </Button>

                                {form.formState.errors.moaIa?.studentSnapshots?.root && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.moaIa.studentSnapshots.root.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {!isFinalizationDocument && (
                        <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 ">
                            <div className='flex items-center gap-x-3'>
                                <BookText className='h-5 w-5' />
                                <div className='flex items-start flex-col space-y-0.5'>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Informasi Umum
                                    </h2>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className='text-start flex flex-col space-y-2 w-full'>
                                        <FormLabel>Catatan (Opsional)</FormLabel>
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
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            size='lg'
                            onClick={() => navigate('/dashboard/track-submission')}
                            className='cursor-pointer border-gray-400'
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size='lg'
                            disabled={isPending || !form.formState.isValid}
                            className="bg-teal-950 hover:bg-teal-800 text-white font-medium cursor-pointer"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default DashboardUpdateSubmissionPage