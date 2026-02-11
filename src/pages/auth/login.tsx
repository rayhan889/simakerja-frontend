import { useLocation } from 'react-router'
import { GoogleLoginButton } from '@/components/google-login-button';

export const LoginPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sessionExpired = params.get('session_expired') === 'true';
    
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className='flex flex-col max-w-4xl w-full items-center h-auto p-3 gap-y-6'>

        <div className='flex flex-col items-center gap-y-3'>
          <img src="/unesa_logo.png" alt="SIMAKerja" className='mx-auto h-20 w-auto' />
          <div className='flex flex-col'>
              <h3 className='text-xl font-semibold text-teal-950'>Selamat Datang di SIMAKerja</h3>
              <span className='text-gray-500 font-medium font-secondary'>
                Sistem Informasi manajemen dokumen kerja sama Universitas Negeri Surabaya
              </span>
          </div>
        </div>

        <p className='font-secondary text-gray-400 text-sm'>Masuk dengan</p>

        <GoogleLoginButton />

        {sessionExpired && (
          <p className='text-sm text-red-500 mt-4'>
            Sesi Anda telah berakhir. Silakan masuk kembali.
          </p>
        )}

      </div>
    </div>
  )
}
