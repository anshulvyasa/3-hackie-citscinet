import { LoginForm } from '@/components/forms/login-form';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CitSciNet</h1>
              <p className="text-sm text-muted-foreground">
                Citizen Science Platform
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>

      <footer className="border-t bg-card py-6 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>
            Secure login powered by CitSciNet
          </p>
        </div>
      </footer>
    </div>
  );
}
