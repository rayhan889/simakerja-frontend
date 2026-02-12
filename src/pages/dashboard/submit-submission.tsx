import { Info, BookText, X, User, Trash2, Plus, Loader2 } from 'lucide-react'
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSubmission } from '@/hooks/use-submission';
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
import { activityLabels, documentTypeLabels, studyProgramOptions } from '@/types/submission.type';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const studentSnapshotSchema = z.object({
    studyProgram: z
        .string({ error: "Program studi harus dipilih" })
        .min(1, "Program studi harus dipilih"),
    
    students: z
        .array(z.string().min(1, "Nama mahasiswa tidak boleh kosong"))
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
        .min(1, "Minimal 1 grup mahasiswa harus ditambahkan"),
});

const submissionFormSchema = z.object({
    submissionType: z.literal('moa_ia'),
    
    notes: z
        .string()
        .max(500, "Catatan maksimal 500 karakter")
        .optional()
        .or(z.literal('')),
    
    faculty: z.literal('Teknik'),
    
    moaIa: moaIaDetailSchema,
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

const defaultValues: SubmissionFormValues = {
    submissionType: 'moa_ia',
    notes: '',
    faculty: 'Teknik',
    moaIa: {
        documentType: 'moa',
        partnerName: '',
        partnerNumber: '',
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

interface StudentTagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxItems?: number;
  error?: boolean;
}

function StudentTagInput({
    value = [],
    onChange,
    maxItems = 3,
}: StudentTagInputProps) {
    const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStudent();
    }
  };

  const addStudent = () => {
    const trimmed = inputValue.trim();
    if (trimmed && value.length < maxItems && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeStudent = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[38px] p-2 rounded-lg border border-gray-300 bg-white">
        {value.map((student, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-teal-100 text-teal-800 rounded-md"
          >
            {student}
            <button
              type="button"
              onClick={() => removeStudent(index)}
              className="hover:text-teal-950 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {/* Inline Input */}
        {value.length < maxItems && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addStudent}
            placeholder={value.length === 0 ? "Ketik nama lalu Enter..." : ""}
            className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
          />
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        {value.length}/{maxItems} mahasiswa (tekan Enter untuk menambah)
      </p>
    </div>
  )
}

export const DashboardSubmitSubmissionPage = () => {
    const form = useForm<SubmissionFormValues>({
        resolver: zodResolver(submissionFormSchema),
        defaultValues,
        mode: 'onChange'
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "moaIa.studentSnapshots"
    });

    const { mutate: createSubmission, isPending } = useCreateSubmission();

    const onSubmit = (data: SubmissionFormValues) => {
        // console.log(data)
        createSubmission(data);
    }

    const handleReset = () => {
        form.reset(defaultValues);
    }

    const addStudentGroup = () => {
        append({
            studyProgram: '',
            students: [],
            unit: '',
        })
    }

  return (
    <div className="w-full h-auto  flex flex-col items-start space-y-6">
        
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
                Pengajuan Dokumen
            </h1>
        </div>

        <div className="rounded-lg border border-teal-700 bg-teal-600/10 p-2 w-fit">
            <p className="font-secondary text-teal-950 text-sm text-start">
                <b>Perhatian:</b> Lengkapi informasi umum dibawah ini beserta informasi detail terkait tipe dokumen yang dipilih!
            </p>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col space-y-3.5"> 
                {/* general info */}
                <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 font-secondary">
                    <div className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h1 className="text-base font-bold text-gray-900">
                            Informasi Umum
                        </h1>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 w-full'>
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
                                                    <SelectItem value="Teknik">Teknik</SelectItem>
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
                            name='notes'
                            render={({ field }) => (
                                <FormItem className='text-start flex flex-col col-span-2 space-y-2'>
                                    <FormLabel>Catatan</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder='Masukkan Catatan'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* MoA IA detail info */}
                <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 gap-y-6 font-secondary">
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

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3 w-full'>
                        <FormField
                            control={form.control}
                            name='moaIa.documentType'
                            render={({field}) => (
                                <FormItem className='text-start flex flex-col space-y-2'>
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
                            <FormItem className='text-start flex flex-col space-y-2'>
                                <FormLabel required>Nama Mitra</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="PT Telkom Indonesia"
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
                                <FormLabel required>Nama Perwakilan Fakultas</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Prof. Dr. Tony Stark S.Pd M.Pd"
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

                    </div>
                </div>

                {/* student data */}
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
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Hapus
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
                                                    <SelectLabel>Program Studis</SelectLabel>
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

                            <FormField
                                control={form.control}
                                name={`moaIa.studentSnapshots.${index}.students`}
                                render={({ field, fieldState }) => (
                                <FormItem className='text-start flex flex-col space-y-2'>
                                    <FormLabel required>Daftar Mahasiswa</FormLabel>
                                    <FormControl>
                                    <StudentTagInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        maxItems={3}
                                        error={!!fieldState.error}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

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
  )
}
