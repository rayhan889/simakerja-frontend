import { Link, useLocation } from 'react-router'
import { GoogleLoginButton } from '@/components/google-login-button';
import { Input } from '@/components/ui/input';
import * as z from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Eye, EyeClosed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';

const emailPasswordSignInSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password harus minimal 6 karakter" }),
})

type EmailPasswordSignInData = z.infer<typeof emailPasswordSignInSchema>;

const defaultValues: EmailPasswordSignInData = {
  email: '',
  password: '',
}

export const LoginPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sessionExpired = params.get('session_expired') === 'true';

    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<EmailPasswordSignInData>({
        resolver: zodResolver(emailPasswordSignInSchema),
        defaultValues,
        mode: 'onChange'
    })

    const handleSubmit = (data: EmailPasswordSignInData) => {
        console.log("Form submitted with data:", data);
    }

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    }

    useEffect(() => {
        if (sessionExpired) {
            form.reset();
            toast.error("Sesi Anda telah berakhir. Silakan masuk kembali.");
        }
    }, [sessionExpired, form])
    
    
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className='grid w-full grid-cols-2 h-screen items-center overflow-y-hidden'>

        <div className='grid-cols-1 h-full p-10 items-center flex justify-center'>
          <div className='flex flex-col max-w-2xl gap-y-6 items-center'>
            <img src="/unesa_logo.png" alt="UNESA Logo" className='h-32 w-auto' />

            <div className='flex flex-col'>
              <h3 className='text-xl font-semibold text-teal-950'>Selamat Datang di SIMAKerja</h3>
              <span className='text-gray-500 font-medium'>
                Sistem Informasi manajemen dokumen kerja sama Universitas Negeri Surabaya
              </span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='w-full flex flex-col space-y-4'>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className='text-start flex flex-col space-y-2'>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='mahasiswa@unesa.ac.id' type='email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className='text-start flex flex-col space-y-2'>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input placeholder='*****' type={showPassword ? 'text' : 'password'} {...field} />
                          {
                            showPassword ? (
                              <EyeClosed
                                className='absolute right-3 top-[50%] -translate-y-[50%] cursor-pointer text-gray-500'
                                size={20}
                                onClick={handleTogglePasswordVisibility}
                              />
                            ) : (
                              <Eye
                                className='absolute right-3 top-[50%] -translate-y-[50%] cursor-pointer text-gray-500'
                                size={20}
                                onClick={handleTogglePasswordVisibility}
                              />
                            )
                          }
                        </div>
                      </FormControl>
                      <Button variant="link" className='text-sm text-teal-950 cursor-pointer self-end'>Lupa Password?</Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size={'lg'} className='bg-teal-950 cursor-pointer'>Masuk</Button>
             </form>
            </Form>

            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">Atau</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <GoogleLoginButton  />

            <Link to="/auth/register" className={buttonVariants({ variant: 'link', className: 'text-sm text-teal-950 hover:underline' })}>
                Belum punya akun? <span className='text-teal-700'>Daftar</span>
            </Link>
          </div>
        </div>

        <div className='grid-cols-1 h-full relative'>
          <div className="text-center text-white px-4 w-lg absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <p className="text-base leading-relaxed">
              "SIMAKerja memudahkan pengelolaan kerja sama di UNESA,
              meningkatkan efisiensi dan kolaborasi universitas dengan mitra."
            </p>
            <p className="mt-3 font-medium">- Tim Humas UNESA</p>
          </div>
          
          <img src="/unesa_bg_img.jpg" alt="Unesa Background Image" className="w-full h-full object-cover" />
          <div className='absolute inset-0 bg-linear-to-t from-teal-950/90 to-teal-700/20' />
        </div>

        {/* <div className='flex flex-col items-center gap-y-3'>
          <img src="/unesa_logo.png" alt="SIMAKerja" className='mx-auto h-20 w-auto' />
          <div className='flex flex-col'>
              <h3 className='text-xl font-semibold text-teal-950'>Selamat Datang di SIMAKerja</h3>
              <span className='text-gray-500 font-medium'>
                Sistem Informasi manajemen dokumen kerja sama Universitas Negeri Surabaya
              </span>
          </div>
        </div>

        <p className=' text-gray-400 text-sm'>Masuk dengan</p>

        <GoogleLoginButton />

        {sessionExpired && (
          <p className='text-sm text-red-500 mt-4'>
            Sesi Anda telah berakhir. Silakan masuk kembali.
          </p>
        )} */}

      </div>
    </div>
  )
}
