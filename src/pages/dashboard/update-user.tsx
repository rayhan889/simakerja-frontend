import { useAuth } from "@/hooks/use-auth"
import { Avatar } from 'radix-ui'
import { Badge } from '@/components/ui/badge'
import { Copy, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as z from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useUpdateStudent } from "@/hooks/use-user";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { studyProgramOptions } from "@/types/submission.type";
import { displayFullName } from "@/lib/display-fullname";

const updateStudentSchema = z.object({
    nim: z
        .string()
        .min(11, "NIM minimal 11 karakter")
        .regex(/^\d+$/, "NIM hanya boleh berisi angka"),
    studyProgram: z.string().min(1, "Program studi harus diisi"),
})

type StudentUpdateFormValues = z.infer<typeof updateStudentSchema>

const studentUpdateDefaultValues: StudentUpdateFormValues = {
    studyProgram: "",
    nim: "",
}

const DashboardUpdateUserPage = () => {
    const { user } = useAuth();

    const form = useForm<StudentUpdateFormValues>({
        resolver: zodResolver(updateStudentSchema),
        defaultValues: studentUpdateDefaultValues,
        mode: 'onChange'
    })
    
    const [isEditing, setIsEditing] = useState(false);

    const isStudenet = user?.role === 'student';
    const isStaff = user?.role === 'staff';

    const { mutate: updateStudent, isPending: isPendingUpdateStudent } = useUpdateStudent(user?.id || "")

    const onSubmit = (data: StudentUpdateFormValues) => {
        if (!user) return;
        updateStudent(data, {
            onSuccess: () => {
                toast.success("Informasi mahasiswa berhasil diperbarui");
                setIsEditing(false);
            },

            onError: (error) => {
                console.error("Failed to update student information: ", error);
                toast.error("Gagal memperbarui informasi mahasiswa");
            }
        })
    }

    async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        toast.success("Email berhasil disalin ke clipboard");
    } catch (err) {
        console.error('Failed to copy text: ', err);
        toast.error("Gagal menyalin email ke clipboard");
    }
    }

    const toggleEditMode = () => {
        setIsEditing((prev) => !prev);
        if (!isEditing) {
            form.reset({
                studyProgram: user?.studyProgram || "",
                nim: user?.nim || "",
            });
        }
    }

  return (
    <div className="w-full h-auto  flex flex-col items-start space-y-4">

        <div>
            <h1 className="text-2xl font-bold text-gray-900">
                Profil Pengguna
            </h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5 ">
            <div className="flex items-center gap-x-5 h-auto ">
                <Avatar.Root className="h-20 w-20 shrink-0">
                    <Avatar.Image
                    src={user?.profilePicture}
                    alt={user?.fullName}
                    className="rounded-full"
                    />
                    <Avatar.Fallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                    {user?.fullName.split(" ").map(name => name[0]).join("")}
                    </Avatar.Fallback>
                </Avatar.Root>

                <div className='flex flex-col items-start gap-y-1.5'>
                    <Badge variant={'outline'} className='border-gray-200'>
                    {
                        isStudenet ? 'Mahasiswa' : isStaff ? 'Staf' : 'Admin'
                    }
                    </Badge>

                    <h1 className='font-semibold capitalize'>{displayFullName(user?.fullName || "")}</h1>

                    <span className="text-sm text-gray-600 flex items-center gap-2">
                        {user?.email} 
                        <Copy className="w-4 h-4 cursor-pointer" onClick={() => copyToClipboard(user?.email || "")} />
                    </span>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 w-full flex flex-col items-start p-5  space-y-6">
            <div className=" flex items-center justify-between w-full">
                <h3 className="text-lg font-semibold text-gray-900">
                    Informasi Mahasiswa
                </h3>

                <Button variant="outline" size="sm" className="cursor-pointer flex items-center" onClick={toggleEditMode}>
                    <Pencil className="w-3 h-3 mr-2" />
                    Edit
                </Button>
            </div>

            <>
                {isEditing ? (
                    // Edit mode
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                            <div className="grid grid-cols-2 w-full gap-3">
                                <FormField
                                    control={form.control}
                                    name="studyProgram"
                                    render={({ field }) => (
                                    <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                                        <FormLabel required className="text-gray-600">Program Studi</FormLabel>
                                        <Select 
                                            key={field.value}
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Pilih Program Studi" />
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
                                    name="nim"
                                    render={({ field }) => (
                                    <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                                        <FormLabel required className="text-gray-600">NIM</FormLabel>
                                        <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="2309120390123"
                                        />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>

                            <div className="w-full flex justify-end">
                                <Button 
                                    type="submit"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isPendingUpdateStudent}
                                    className="bg-teal-950 hover:bg-teal-800 text-white font-medium cursor-pointer"
                                >
                                    {isPendingUpdateStudent ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Mengupdate...
                                        </>
                                    ) : (
                                        'Simpan'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                ) : (
                    // View Mode
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                        <div className='text-start flex flex-col space-y-2'>
                            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600">Program Studi</p>
                            <span>
                                {studyProgramOptions.find(option => option.value === user?.studyProgram)?.label || "-"}
                            </span>
                        </div>
                        <div className='text-start flex flex-col space-y-2'>
                            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600">NIM</p>
                            <span>{user?.nim}</span>
                        </div>
                        </div>
                )}
            </>

        </div>

    </div>
  )
}

export default DashboardUpdateUserPage