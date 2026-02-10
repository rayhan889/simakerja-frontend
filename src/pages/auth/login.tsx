import { useLocation } from 'react-router'
import { GoogleLoginButton } from '@/components/google-login-button';

export const LoginPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const sessionExpired = params.get('session_expired') === 'true';
    
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          {/* <img
            src="/logo.svg"
            alt="SIMAKerja"
            className="mx-auto h-16 w-auto"
          /> */}
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Selamat Datang
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk ke akun SIMAKerja Anda
          </p>
        </div>

        {sessionExpired && (
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Sesi Anda telah berakhir. Silakan masuk kembali.
          </div>
        )}

        <div className="mt-8">
          <GoogleLoginButton className="w-full" />
        </div>

        <p className="text-center text-xs text-gray-500">
          Dengan masuk, Anda menyetujui{' '}
          <a href="/terms" className="text-primary hover:underline">
            Syarat & Ketentuan
          </a>{' '}
          kami.
        </p>
      </div>
    </div>
  )
}
