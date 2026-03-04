import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useCreateUser } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { userRoleOptions, type UserRole } from '@/types/user.type';
import { useState } from 'react';
import { studyProgramOptions } from '@/types/submission.type';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const createUserSchema = z.object({
    email: z.email({ message: "Email tidak valid" }),
    fullName: z.string().min(1, { message: "Nama lengkap harus diisi" }),
    password: z.string().min(6, { message: "Password harus minimal 6 karakter" }),
    role: z.enum(['superadmin', 'staff', 'lecturer'], { message: "Role harus dipilih" }),
    nip: z.string().optional(),
    nidn: z.string().optional(),
    studyProgram: z.string().optional(),
    phoneNumber: z.string().optional(),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

const createUserDefaultValues: CreateUserFormValues = {
    email: "",
    fullName: "",
    password: "",
    role: "staff",
    nip: "",
    nidn: "",
    studyProgram: "",
    phoneNumber: "",
}

export const CreateUserDialog = (
    { open, onOpenChange }: CreateUserDialogProps
) => {

    const form = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: createUserDefaultValues,
        mode: 'onChange'
    })

    const [roleSelected, setRoleSelected] = useState<UserRole | null>('staff');

    const { mutate: createUser, isPending } = useCreateUser()

    const onSubmit = (data: CreateUserFormValues) => {
        createUser(data, {
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
                toast.success("Pengguna berhasil dibuat");
            },

            onError: (error) => {
                console.error("Failed to create user:", error);
                toast.error("Gagal membuat pengguna");
            }
        });
    };

  return (
    <Dialog
        open={open}
        onOpenChange={onOpenChange}
    >
        <DialogContent 
            showCloseButton={true}
            className="sm:max-w-2xl h-auto flex flex-col p-8"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                            <FormLabel required className="text-gray-600">Email</FormLabel>
                            <FormControl>
                            <Input
                                {...field}
                                placeholder="example@example.com"
                                type="email"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                            <FormLabel required className="text-gray-600">Password</FormLabel>
                            <FormControl>
                            <Input
                                {...field}
                                placeholder="••••••••"
                                type="password"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                        <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                            <FormLabel required className="text-gray-600">Nama Lengkap</FormLabel>
                            <FormControl>
                            <Input
                                {...field}
                                placeholder="John Doe"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                        <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                            <FormLabel className="text-gray-600">Nomor Telepon</FormLabel>
                            <FormControl>
                            <Input
                                {...field}
                                placeholder="081234567890"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                        <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                            <FormLabel required className="text-gray-600">Role</FormLabel>
                            <Select 
                                key={field.value}
                                onValueChange={(value) => {
                                    console.log('role val', value)
                                    field.onChange(value);
                                    setRoleSelected(value as UserRole);
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Role</SelectLabel>
                                        {userRoleOptions.map((option) => (
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

                    {/* required fields for staff */}
                    {roleSelected === 'staff' && (
                        <FormField
                            control={form.control}
                            name="nip"
                            render={({ field }) => (
                            <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                                <FormLabel required className="text-gray-600">NIP</FormLabel>
                                <FormControl>
                                <Input
                                    {...field}
                                    placeholder="123456789"
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}

                    {/* required fields for lecturer */}
                    {roleSelected === 'lecturer' && (
                        <>
                            <FormField
                                control={form.control}
                                name="nidn"
                                render={({ field }) => (
                                <FormItem className='text-start flex flex-col space-y-2 col-span-1'>
                                    <FormLabel required className="text-gray-600">NIDN</FormLabel>
                                    <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="123456789"
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

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
                        </>
                    )}

                    <div className="w-full flex justify-end">
                        <Button 
                            type="submit"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isPending}
                            className="bg-teal-950 hover:bg-teal-800 text-white font-medium cursor-pointer"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Membuat User...
                                </>
                            ) : (
                                'Buat User'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  )
}
