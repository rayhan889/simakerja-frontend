import { useLocation } from 'react-router'
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
import { CircleAlert, Eye, EyeClosed, Loader2, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import type { LoginErrorCodes } from '@/types/auth.types';

const emailPasswordSignInSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password harus minimal 6 karakter" }),
})

type EmailPasswordSignInData = z.infer<typeof emailPasswordSignInSchema>;

const defaultValues: EmailPasswordSignInData = {
  email: '',
  password: '',
}

function formatLockUntil(message: string): string {
    const isoMatch = message.match(/\d{4}-\d{2}-\d{2}T[\d:.]+Z?/);
    if (!isoMatch) return message;

    try {
        const date = new Date(isoMatch[0]);
        const formatted = date.toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
        return `Akun terkunci. Coba lagi setelah ${formatted}`;
    } catch {
        return message;
    }
}

function LoginErrorAlert({ error, errorCode }: { error: string; errorCode: LoginErrorCodes | null }) {
    if (errorCode === 'ACCOUNT_LOCKED') {
        return (
            <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formatLockUntil(error)}</span>
            </div>
        );
    }

    if (errorCode === 'INVALID_CREDENTIALS') {
        return (
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
            </div>
        );
    }

    if (errorCode === 'FORBIDDEN') {
        return (
            <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Akses ditolak. Anda tidak memiliki izin untuk login.</span>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
        </div>
    );
}

export const LoginPage = () => {
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const sessionExpired = params.get('session_expired') === 'true';

    const [showPassword, setShowPassword] = useState(false);
    const [backdoorLogin, setBackdoorLogin] = useState(false);

    const form = useForm<EmailPasswordSignInData>({
        resolver: zodResolver(emailPasswordSignInSchema),
        defaultValues,
        mode: 'onChange'
    })

    const { login, error, errorCode, isLoading, setError } = useAuth();

    useEffect(() => {
      const subs = form.watch(() => {
        if (error) setError(null);
      })

      return () => subs.unsubscribe();
    }, [form, error, setError])

    useEffect(() => {
      if (error && !errorCode && !backdoorLogin) {
        toast.error(error);
      }
    }, [error, errorCode, backdoorLogin])
    

    const handleSubmit = (data: EmailPasswordSignInData) => {
        login(data.email, data.password);
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

            {backdoorLogin && (
              <>

                {error && (
                  <LoginErrorAlert error={error} errorCode={errorCode} />
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className='w-full flex flex-col space-y-4'>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className='text-start flex flex-col space-y-2'>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder='youremail@example.com' type='email' {...field} />
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

                    <Button type="submit" size={'lg'} className='bg-teal-950 cursor-pointer' disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Masuk'
                      )}
                    </Button>
                </form>
                </Form>
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-500">Atau</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            )}

            {
              !backdoorLogin && <GoogleLoginButton className='max-w-md w-full' />
            }

            <Button 
              variant="link" 
              className='text-sm text-teal-950 hover:underline cursor-pointer'
              onClick={() => setBackdoorLogin((prev) => !prev)}
            >
                {
                  backdoorLogin ? <>
                  Masuk sebagai<span className='text-teal-700'>Mahasiswa</span>
                  </>
                  : <>
                  Masuk sebagai<span className='text-teal-700'>Dosen / Staff</span></>
                }
            </Button>
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
          
          <img src="/ft_unesa_bg.jpg" alt="Unesa Background Image" className="w-full h-full object-cover" />
          <div className='absolute inset-0 bg-linear-to-t from-teal-950/90 to-teal-700/20' />
        </div>

      </div>
    </div>
  )
}
