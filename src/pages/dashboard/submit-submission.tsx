import { Info, BookText, User, Trash2, Plus, Loader2, UploadCloud } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSubmission, usePartners } from '@/hooks/use-submission';
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
import { activityLabels, documentTypeLabels, studyProgramOptions, type PartnerAndFacultyProfile } from '@/types/submission.type';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUploadPartnerLogo } from '@/hooks/use-file-upload';
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"
import { SegmentedControl } from '@/components/ui/segmented-control';
import { trigramSimilarity } from '@/lib/trigram';
import { useGetAllRegisteredStudents } from '@/hooks/use-user';
import type { StudentInfo } from '@/types/user.type';
import { displayFullName } from '@/lib/display-fullname';
import { useAuth } from '@/hooks/use-auth';
import { FeatureGate } from '@/routes/guards/feature-gate';
import { canCreateSubmission } from '@/policies/studentPolicies';
import { FeatureBlockDialog } from '@/components/ui/feature-block-dialog';

const FACULTY_OF_TECHNOLOGY = 'Teknik';
const FACULTY_OF_TECHNOLOGY_ADDRESS = 'Gedung E1, Jl. Ketintang, unesa, Kec. Gayungan, Surabaya, Jawa Timur 60231';

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

const moaIaDetailSchema = z.object({
    documentType: z.enum(['moa', 'ia'], { error: "Tipe dokumen harus dipilih" }),
    
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
                
                if (!snapshot.studyProgram || !snapshot.unit) {
                    continue;
                }
                
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
                    message: "Kombinasi Program Studi dan Unit/Departemen tidak boleh sama antar grup mahasiswa. Setiap grup harus memiliki kombinasi yang unik.",
                    path: [],
                });
            }
        }),
});

const submissionFormSchema = z.object({
    submissionType: z.literal('moa_ia'),
    
    notes: z
        .string()
        .max(500, "Catatan maksimal 500 karakter")
        .optional()
        .or(z.literal('')),
    
    faculty: z.literal(FACULTY_OF_TECHNOLOGY),
    
    moaIa: moaIaDetailSchema,

    facultyAddress: z.literal(FACULTY_OF_TECHNOLOGY_ADDRESS),
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

const defaultValues: SubmissionFormValues = {
    submissionType: 'moa_ia',
    notes: '',
    faculty: FACULTY_OF_TECHNOLOGY,
    facultyAddress: FACULTY_OF_TECHNOLOGY_ADDRESS,
    moaIa: {
        documentType: 'moa',
        partnerName: '',
        partnerNumber: '',
        partnerAddress: '',
        partnerLogoKey: '',
        facultyRepresentativeName: '',
        partnerRepresentativeName: '',
        partnerRepresentativePosition: '',
        activityType: 'internship',
        studentSnapshots: [
        {
            studyProgram: '',
            students: [],
            unit: '',
        },
    ],
    },
};

export const DashboardSubmitSubmissionPage = () => {
    const form = useForm<SubmissionFormValues>({
        resolver: zodResolver(submissionFormSchema),
        defaultValues,
        mode: 'onChange'
    })

    const { user } = useAuth();
    const isValidStudent = user?.role === 'student' && user?.nim && user?.studyProgram;

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "moaIa.studentSnapshots"
    });

    const [partnerLogoPreviewUrl, setPartnerLogoPreviewUrl] = useState<string | null>(null);

    const [partnerMode, setPartnerMode] = useState<'existing' | 'new'>('existing');

    const [selectedPartner, setSelectedPartner] = useState<PartnerAndFacultyProfile | null>(null);

    const isPartnerFieldDisabled = partnerMode === 'existing' || selectedPartner !== null;

    const { mutate: createSubmission, isPending } = useCreateSubmission();

    const { mutate: uploadPartnerLogo, isPending: isUploadingPartnerLogo } = useUploadPartnerLogo();
    
    const {
        data: partners,
        isLoading: isLoadingPartners,
        error: errorPartners,
    } = usePartners();

    const { 
        data: students, 
        isLoading: isLoadingStudents,
        error: errorStudents,
    }  = useGetAllRegisteredStudents(isValidStudent ? user.nim : undefined);

    const isValidStudentAvaliable = students?.data && students?.data.length > 0;

    const formPartnerName = form.watch('moaIa.partnerName');
    const formPartnerNumber = form.watch('moaIa.partnerNumber');
    useEffect(() => {

        if (partnerMode !== 'new' || !formPartnerName || !formPartnerNumber) {
            return;
        }

        const timeoutId = setTimeout(() => {
             partners?.data.forEach(partner => {

                const partnerNameSimilaryPoint = trigramSimilarity(partner.partnerName, formPartnerName);
                console.log('similary point: ' + partnerNameSimilaryPoint)
                if (partnerNameSimilaryPoint > 0.6 && partner.partnerNumber === formPartnerNumber) {
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
    }, [partnerMode, formPartnerName, formPartnerNumber, partners])
    

    const handlePartnerSelect = useCallback((partnerName: string) => {
        const partner = partners?.data.find(p => p.partnerName === partnerName) || null;

        if (!partner) {
            setSelectedPartner(null);
            return;
        }

        setSelectedPartner(partner);

        form.setValue('moaIa.partnerName', partner.partnerName, { shouldDirty: true });
        form.setValue('moaIa.partnerAddress', partner.partnerAddress, { shouldDirty: true });
        form.setValue('moaIa.partnerNumber', partner.partnerNumber, { shouldDirty: true });
        form.setValue('moaIa.partnerRepresentativeName', partner.partnerRepresentativeName, { shouldDirty: true });
        form.setValue('moaIa.partnerRepresentativePosition', partner.partnerRepresentativePosition, { shouldDirty: true });
        form.setValue('moaIa.activityType', partner.activityType, { shouldDirty: true });
        form.setValue('moaIa.partnerLogoKey', partner.partnerLogoKey, { shouldDirty: true });
        form.setValue('moaIa.facultyRepresentativeName', partner.facultyRepresentativeName, { shouldDirty: true });

        setPartnerLogoPreviewUrl(null);
    }, [partners, form])

    const handlePartnerModeChange = useCallback((mode: 'existing' | 'new') => {
        setPartnerMode(mode);

        form.setValue('moaIa.partnerName', '', { shouldDirty: true });
        form.setValue('moaIa.partnerAddress', '', { shouldDirty: true });
        form.setValue('moaIa.partnerNumber', '', { shouldDirty: true });
        form.setValue('moaIa.partnerRepresentativeName', '', { shouldDirty: true });
        form.setValue('moaIa.partnerRepresentativePosition', '', { shouldDirty: true });
        form.setValue('moaIa.activityType', 'internship', { shouldDirty: true });
        form.setValue('moaIa.partnerLogoKey', '', { shouldDirty: true });
        form.setValue('moaIa.facultyRepresentativeName', '', { shouldDirty: true });

        setSelectedPartner(null);

        setPartnerLogoPreviewUrl(null);
    }, [form])

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
            maxSize: 10 * 1024 * 1024, // 10MB
        });

    const removePartnerLogo = () => {
        setPartnerLogoPreviewUrl(null);
        form.setValue('moaIa.partnerLogoKey', '', { shouldDirty: true });
    }

    const onSubmit = (data: SubmissionFormValues) => {
        createSubmission(data);
    }

    const handleReset = () => {
        form.reset(defaultValues);
        setPartnerLogoPreviewUrl(null);

        setPartnerMode('existing');
        setSelectedPartner(null);
    }

    const addStudentGroup = () => {
        append({
            studyProgram: '',
            students: [],
            unit: '',
        })
    }

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

  return (
    <FeatureGate
        check={canCreateSubmission}
        fallback={(reason) => (
            <FeatureBlockDialog reason={reason} redirectTo="/dashboard" />
        )}
    >
        <div className="w-full h-auto  flex flex-col items-start space-y-6">
        
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
                Pengajuan Dokumen
            </h1>
        </div>

        <div className="rounded-lg border border-teal-200 bg-teal-50 p-2 w-fit">
            <p className=" text-teal-800 text-sm text-start">
                <span className='font-medium'>Perhatian:</span> Lengkapi informasi umum dibawah ini beserta informasi detail terkait tipe dokumen yang dipilih!
            </p>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col space-y-3.5"> 
                {/* general info */}
                <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 ">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h1 className="text-base font-bold text-gray-900">
                            Informasi Umum
                        </h1>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3 w-full'>
                        <FormField
                            control={form.control}
                            name='submissionType'
                            render={({ field }) => (
                                <FormItem className='text-start flex flex-col space-y-2'>
                                    <FormLabel required>Tipe Pengajuan</FormLabel>
                                    <FormControl>
                                        <Select
                                            name={field.name}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled
                                        >
                                            <SelectTrigger className="w-full" ref={field.ref}>
                                                <SelectValue placeholder="MoA & IA" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Tipe Pengajuan</SelectLabel>
                                                    <SelectItem value="moa_ia">MoA & IA</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='faculty'
                            render={({ field }) => (
                                <FormItem className='text-start flex flex-col space-y-2'>
                                    <FormLabel required>Fakultas</FormLabel>
                                    <FormControl>
                                        <Select
                                            name={field.name}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled
                                        >
                                            <SelectTrigger className="w-full" ref={field.ref}>
                                                <SelectValue placeholder="Teknik" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Fakultas</SelectLabel>
                                                    <SelectItem value={FACULTY_OF_TECHNOLOGY}>{FACULTY_OF_TECHNOLOGY}</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="facultyAddress"
                            render={({ field }) => (
                            <FormItem className='text-start flex flex-col space-y-2'>
                                <FormLabel required>Alamat Fakultas</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    disabled
                                    placeholder={FACULTY_OF_TECHNOLOGY_ADDRESS}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='notes'
                            render={({ field }) => (
                                <FormItem className='text-start flex flex-col col-span-3 space-y-2'>
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
                    </div>
                </div>

                {/* MoA IA detail info */}
                <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 ">
                    <div className='flex items-center gap-x-3'>
                        <BookText className='h-5 w-5' />
                        <div className='flex items-start flex-col space-y-0.5'>
                            <h2 className="text-base font-bold text-gray-900">
                                Informasi Detail : Dokumen MoA / IA
                            </h2>
                            <span className="text-sm text-gray-500">
                                Informasi dokumen dan mitra kerja sama.
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <SegmentedControl
                            value={partnerMode}
                            onChange={handlePartnerModeChange}
                            options={[
                                { value: 'existing', label: 'Pilih Mitra Yang Ada' },
                                { value: 'new', label: 'Buat Mitra Baru' },
                            ]}
                        />
                        <p className="text-xs text-gray-500 ">
                            {partnerMode === 'existing' 
                                ? 'Pilih mitra dari daftar yang sudah tersedia. Data akan terisi otomatis.'
                                : 'Isi data mitra baru secara manual.'}
                        </p>
                    </div>

                    <div className='w-full flex flex-col gap-3'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-3 w-full'>
                                <FormField
                                    control={form.control}
                                    name='moaIa.documentType'
                                    render={({field}) => (
                                        <FormItem className='text-start flex flex-col space-y-2 col-span-4'>
                                            <FormLabel required>Jenis Dokumen</FormLabel>
                                            <FormControl>
                                                <Select
                                                    name={field.name}
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="w-full" ref={field.ref}>
                                                        <SelectValue placeholder="Pilih Jenis Dokumen" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Jenis Dokumen</SelectLabel>
                                                            {Object.entries(documentTypeLabels).map(([value, label]) => (
                                                                <SelectItem key={value} value={value}>
                                                                    {label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="moaIa.partnerName"
                                    render={({ field }) => (
                                    <FormItem className='text-start flex flex-col space-y-2 col-span-4'>
                                        <FormLabel required>Nama Mitra</FormLabel>
                                        <FormControl>
                                            {partnerMode === 'existing' ? (
                                                <Combobox
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        if (value) {
                                                            handlePartnerSelect(value);
                                                        } else {
                                                            setSelectedPartner(null);
                                                        }
                                                    }}
                                                    items={partners?.data.map(partner => partner.partnerName) ?? []}
                                                >
                                                    <ComboboxInput 
                                                        placeholder={isLoadingPartners ? "Memuat mitra..." : "Pilih Mitra"}
                                                        disabled={isLoadingPartners}
                                                        showClear
                                                    />
                                                    <ComboboxContent>
                                                        <ComboboxEmpty>
                                                            {errorPartners 
                                                                ? "Gagal memuat daftar mitra." 
                                                                : "Mitra tidak ditemukan."}
                                                        </ComboboxEmpty>
                                                        <ComboboxList>
                                                            {(item) => (
                                                                <ComboboxItem key={item} value={item}>
                                                                    {item}
                                                                </ComboboxItem>
                                                            )}
                                                        </ComboboxList>
                                                    </ComboboxContent>
                                                </Combobox>
                                            ) : (
                                                <Input
                                                    {...field}
                                                    placeholder="PT Telkom Indonesia"
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                        </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3 w-full'>

                        <FormField
                            control={form.control}
                            name="moaIa.facultyRepresentativeName"
                            render={({ field }) => (
                            <FormItem className='text-start flex flex-col space-y-2'>
                                <FormLabel required>Nama Perwakilan Fakultas</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Prof. Dr. Tony Stark S.Pd M.Pd"
                                    disabled={isPartnerFieldDisabled}
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
                                <FormLabel required>Alamat Mitra</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Jl. Jend. Gatot Subroto Kav. 52, Jakarta Selatan"
                                    disabled={isPartnerFieldDisabled}
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
                                <FormLabel required>Nomor Mitra</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="1234567890"
                                    disabled={isPartnerFieldDisabled}
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
                                <FormLabel required>Nama Perwakilan Mitra</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Steve Rogers"
                                    disabled={isPartnerFieldDisabled}
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
                                <FormLabel required>Posisi Perwakilan Mitra</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="CTO (Chief Technology Officer)"
                                    disabled={isPartnerFieldDisabled}
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
                                <FormLabel required>Tipe Aktivitas</FormLabel>
                                <FormControl>
                                    <Select
                                        name={field.name}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isPartnerFieldDisabled}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Tipe Aktivitas" />
                                        </SelectTrigger>
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
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        {partnerMode === 'new' && (
                            <FormField
                                control={form.control}
                                name="moaIa.partnerLogoKey"
                                render={() => (
                                <FormItem className='text-start flex flex-col space-y-2 col-span-3'>
                                    <FormLabel required>Logo Mitra</FormLabel>
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

                        {partnerMode === 'existing' && selectedPartner && (
                            <div className="col-span-3 rounded-lg border border-teal-200 bg-teal-50 p-2">
                                <p className="text-sm text-teal-800">
                                    <span className="font-medium">Logo Mitra:</span> Menggunakan logo yang sudah tersimpan dari profil mitra "{selectedPartner.partnerName}".
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                </div>

                {/* student data */}
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

                    <div className="w-full space-y-6">
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
                                    size="icon"
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
                                    <FormLabel required>Program Studi</FormLabel>
                                    <FormControl>
                                        <Select
                                            name={field.name}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Program Studi" />
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
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                                <FormField
                                control={form.control}
                                name={`moaIa.studentSnapshots.${index}.unit`}
                                render={({ field }) => (
                                    <FormItem className='text-start flex flex-col space-y-2'>
                                    <FormLabel required>Unit / Departemen</FormLabel>
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
                                                        disabled={isLoadingStudents || !isValidStudentAvaliable}
                                                    >
                                                        <MultiSelectValue 
                                                            placeholder={
                                                                isLoadingStudents ? "Memuat mahasiswa..." : 
                                                                isValidStudentAvaliable ? "Pilih mahasiswa" : "Tidak ada mahasiswa yang terdaftar"
                                                            } 
                                                        />
                                                    </MultiSelectTrigger>
                                                    {isValidStudentAvaliable && (
                                                        <MultiSelectContent>
                                                        <MultiSelectGroup>
                                                            {students?.data.map((student) => (
                                                                <MultiSelectItem key={student.nim} value={student.nim}>
                                                                    [{student.nim}] - {displayFullName(student.fullName)} 
                                                                </MultiSelectItem>
                                                            ))}
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
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addStudentGroup}
                            className="w-full border-dashed cursor-pointer"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Grup Mahasiswa
                        </Button>

                        {form.formState.errors.moaIa?.studentSnapshots?.root && (
                            <p className="text-sm font-medium text-red-500">
                            {form.formState.errors.moaIa.studentSnapshots.root.message}
                            </p>
                        )}
                        </div>
                </div>

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
                        disabled={isPending}
                        className="bg-teal-950 hover:bg-teal-800 text-white font-medium cursor-pointer"
                    >
                        {isPending ? (
                            <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Mengirim...
                            </>
                        ) : (
                            'Kirim Pengajuan'
                        )}
                    </Button>
                </div>
            </form>
        </Form>

    </div>
    </FeatureGate>
  )
}
