import { usePartners, useSubmissionDetails, useUpdateSubmission } from '@/hooks/use-submission';
import { BookText, Info, Loader2, Plus, Trash2, UploadCloud, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { activityLabels, studyProgramOptions } from '@/types/submission.type';
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
import { useGetPresignedUrlPartnerLogo, useUploadPartnerLogo } from '@/hooks/use-file-upload';
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
import { useGetAllRegisteredStudents } from '@/hooks/use-user';
import type { StudentInfo } from '@/types/user.type';
import { displayFullName } from '@/lib/display-fullname';

const studentInfoSchema = z.object({
    fullName: z.string({ error: "Nama lengkap mahasiswa harus diisi" })
        .min(1, "Nama lengkap mahasiswa harus diisi"),
    nim: z.string({ error: "NIM mahasiswa harus diisi" }).min(11, "NIM mahasiswa harus terdiri dari minimal 11 karakter"),
    email: z.email("Format email mahasiswa tidak valid"),
})

const studentSnapshotSchema = z.object({
    studyProgram: z
        .string({ error: "Program studi harus dipilih" })
        .min(1, "Program studi harus dipilih"),
    
    students: z
        .array(studentInfoSchema)
        .min(1, "Minimal 1 mahasiswa harus ditambahkan")
        .max(3, "Maksimal 3 mahasiswa per grup"),
    
    unit: z
        .string({ error: "Unit/Departemen harus diisi" })
        .min(1, "Unit/Departemen harus diisi"),
});

const updateMoaIaSchema = z.object({
    partnerName: z
        .string({ error: "Nama mitra harus diisi" })
        .min(1, "Nama mitra harus diisi")
        .max(255, "Nama mitra maksimal 255 karakter"),
    
    partnerNumber: z
        .string({ error: "Nomor mitra harus diisi" })
        .min(1, "Nomor mitra harus diisi")
        .max(50, "Nomor mitra maksimal 50 karakter"),

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
        ['internship', 'study_independent', 'kkn', 'research', 'community_service'],
        { error: "Tipe aktivitas harus dipilih" }
    ),
    
    studentSnapshots: z
        .array(studentSnapshotSchema)
        .min(1, "Minimal 1 grup mahasiswa harus ditambahkan")
        .superRefine((snapshots, ctx) => {
            const seenCombinations = new Set<string>();
            const duplicateIndices: number[] = [];
            
            for (let i = 0; i < snapshots.length; i++) {
                const snapshot = snapshots[i];
                if (!snapshot.studyProgram || !snapshot.unit) continue;
                
                const compositeKey = `${snapshot.studyProgram}|${snapshot.unit}`;
                if (seenCombinations.has(compositeKey)) {
                    duplicateIndices.push(i);
                } else {
                    seenCombinations.add(compositeKey);
                }
            }
            
            if (duplicateIndices.length > 0) {
                ctx.addIssue({
                    code: 'custom',
                    message: "Kombinasi Program Studi dan Unit/Departemen tidak boleh sama antar grup mahasiswa.",
                    path: [],
                });
            }
        }),
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

    const { 
        data: submissionResponse, 
        isLoading: isLoadingSubmission,
        isError: isSubmissionError,
        error: submissionError 
    } = useSubmissionDetails(submissionId || '');

    const { data: partnersResponse } = usePartners();

    const { 
        data: students, 
        isLoading: isLoadingStudents,
        error: errorStudents,
    }  = useGetAllRegisteredStudents()

    const submissionDetails = submissionResponse?.data;
    const moaIaDetails = submissionDetails?.moaIa ?? null;

    const { mutate: getPresignedUrlPartnerLogo, isPending: isLoadingGetPresignedUrlPartnerLogo } = useGetPresignedUrlPartnerLogo();

    const [partnerLogoPreviewUrl, setPartnerLogoPreviewUrl] = useState<string | null>(null);

    const { mutate: updateSubmission, isPending } = useUpdateSubmission(submissionId || '');

    const { mutate: uploadPartnerLogo, isPending: isUploadingPartnerLogo } = useUploadPartnerLogo();

     const form = useForm<UpdateSubmissionFormValues>({
        resolver: zodResolver(updateSubmissionFormSchema),
        mode: 'onChange',
        defaultValues: {
            moaIa: {
                studentSnapshots: [{ studyProgram: '', students: [], unit: '' }]
            }
        }
    });

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

    const isPartnerExisting = moaIaDetails && partnersResponse?.data?.some(
        p => p.partnerName === moaIaDetails.partnerName && 
             p.partnerNumber === moaIaDetails.partnerNumber
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
    
        const { getRootProps, getInputProps, isDragActive, fileRejections } = 
            useDropzone({ 
                onDrop: onDropPartnerLogo, 
                accept: { 'image/*': ['.jpg', '.png', '.jpeg'] },
                maxFiles: 1,
                maxSize: 5 * 1024 * 1024, // 5MB
            });
    
        const removePartnerLogo = () => {
            setPartnerLogoPreviewUrl(null);
            form.setValue('moaIa.partnerLogoKey', '', { shouldDirty: true });
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
                    studentSnapshots: moaIaDetails.studentSnapshots.map(s => ({
                        studyProgram: s.studyProgram,
                        students: s.students,
                        unit: s.unit,
                    })),
                }
            });
        }
    }, [submissionDetails, moaIaDetails, form]);

    const onSubmit = (data: UpdateSubmissionFormValues) => {
        updateSubmission({
            notes: data.notes,
            moaIa: data.moaIa
        });
    };

    function studentInfoToNims(students: StudentInfo[] | undefined): string[] {
        return students?.map((s) => s.nim) ?? [];
    }

    function nimsToStudentInfo(
        nims: string[],
        studentsList: StudentInfo[] | undefined
    ): StudentInfo[] {
        if (!studentsList) return [];
        const byNim = new Map(studentsList.map((s) => [s.nim, s]));
        return nims.map((nim) => byNim.get(nim)).filter((s): s is StudentInfo => s != null);
    }

    if (isLoadingSubmission) {
        return (
            <div className="flex items-center justify-center min-h-[400px] font-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">Memuat data pengajuan...</span>
            </div>
        );
    }

    if (isSubmissionError || !moaIaDetails) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 font-secondary w-full">
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
        <div className="w-full h-auto  flex flex-col items-start space-y-6 font-secondary">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-sans">
                    Edit Pengajuan Dokumen
                </h1>
            </div>

            {isPartnerFieldDisabled && (
                <div className="w-full p-4 bg-amber-50 border text-start border-amber-200 font-secondary rounded-lg flex items-start gap-3">
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
                    <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 font-secondary">
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                            <FormField
                                control={form.control}
                                name="moaIa.partnerName"
                                render={({ field }) => (
                                    <FormItem className='text-start flex flex-col space-y-2 col-span-3'>
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
                                                disabled={isPartnerFieldDisabled}
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
                                                placeholder="Nomor registrasi mitra"
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

                        {isPartnerFieldDisabled ? (
                            <div className="col-span-3 rounded-lg border border-teal-200 bg-teal-50 p-2">
                                <p className="text-sm text-teal-800">
                                    <span className="font-medium">Logo Mitra:</span> Menggunakan logo yang sudah tersimpan dari profil mitra "{moaIaDetails.partnerName}".
                                </p>
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="moaIa.partnerLogoKey"
                                render={() => (
                                <FormItem className='text-start flex flex-col space-y-2 col-span-3'>
                                    <FormLabel required>Logo Mitra</FormLabel>
                                    {isLoadingGetPresignedUrlPartnerLogo && (
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
                                        <>
                                        <FormControl>
                                            <div 
                                                {...getRootProps()}
                                                className={`flex max-h-80 
                                                    ${isPartnerFieldDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                                    ${isDragActive ? 'bg-blue-50 border-blue-500' : ''} 
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
                                                            isDragActive ? (
                                                                <p className="text-sm text-gray-500">Lepaskan file di sini</p>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">Tarik dan lepaskan file atau klik untuk memilih file</p>
                                                            )
                                                        }
                                                    </>
                                                )}
                                                <Input {...getInputProps()} type='file' />
                                            </div>
                                        </FormControl>
                                        </>
                                    )}
                                    <FormMessage>
                                        {fileRejections.length !== 0 && (
                                            <span className="text-sm text-red-500">
                                                {fileRejections[0].errors[0].code === 'file-too-large' && 'File terlalu besar. Maksimal 10MB.'}
                                                {fileRejections[0].errors[0].code === 'file-invalid-type' && 'Tipe file tidak valid. Hanya gambar (.jpg, .png, .jpeg) yang diperbolehkan.'}
                                            </span>
                                        )}
                                    </FormMessage>
                                </FormItem>
                                )}
                            />
                        )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 font-secondary">
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
                            {fields.map((field, index) => (
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
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder="Program studi" />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                            field.onChange(nimsToStudentInfo(nims, students?.data));
                                                        }}
                                                    >
                                                        <MultiSelectTrigger 
                                                            className="w-full"
                                                            disabled={isLoadingStudents}
                                                        >
                                                            <MultiSelectValue placeholder={isLoadingStudents ? "Memuat mahasiswa..." : "Pilih mahasiswa..."} />
                                                        </MultiSelectTrigger>
                                                        <MultiSelectContent>
                                                            <MultiSelectGroup>
                                                                {students?.data.map((student) => (
                                                                    <MultiSelectItem key={student.nim} value={student.nim}>
                                                                        [{student.nim}] - {displayFullName(student.fullName)} 
                                                                    </MultiSelectItem>
                                                                ))}
                                                            </MultiSelectGroup>
                                                        </MultiSelectContent>
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
                        ))}

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

                    <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 font-secondary">
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