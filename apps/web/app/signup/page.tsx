'use client';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { IoMdArrowBack } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignUpPage() {
  const { signup, isAuthenticated } = useAuth();
  const router = useRouter();
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
  if (isAuthenticated) {
    router.push('/dashboard');
  }
}, [isAuthenticated, router]);

if (isAuthenticated) {
  return null;
}

  const onSubmit = async (data: any) => {
    setGlobalError('');
    
    if (data.password !== data.confirmPassword) {
      setGlobalError('Passwords do not match');
      return;
    }

    const result = await signup(data.email, data.password, data.name || undefined);
    
    if (!result.success) {
      setGlobalError(result.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col gap-6 w-full max-w-md px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors w-fit">
          <IoMdArrowBack className="h-4 w-4" />
          <span>Go back</span>
        </Link>
        <Card className="w-full border-black/10 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold font-display tracking-tight text-center">Create account</CardTitle>
            <CardDescription className="text-center font-sans text-base">
              Enter your details below to create your account.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-5">
              {globalError && (
                <div className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  {globalError}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium">Name (optional)</Label>
                <Input
                  {...register("name")}
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="h-12 rounded-lg bg-background/50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-medium">Email</Label>
                <Input
                  {...register("email", { required: "Email is required" })}
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  className="h-12 rounded-lg bg-background/50"
                />
                {errors.email && (
                  <p className="text-sm font-medium text-red-500">{errors.email.message as string}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="font-medium">Password</Label>
                <Input
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="h-12 rounded-lg bg-background/50"
                />
                {errors.password && (
                  <p className="text-sm font-medium text-red-500">{errors.password.message as string}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="font-medium">Confirm Password</Label>
                <Input
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: (val: string) => {
                      if (watch('password') != val) {
                        return "Your passwords do not match";
                      }
                    }
                  })}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="h-12 rounded-lg bg-background/50"
                />
                {errors.confirmPassword && (
                  <p className="text-sm font-medium text-red-500">{errors.confirmPassword.message as string}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button type="submit" variant="primary" className="w-full text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40">
                Create account
              </Button>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Link href="/signin" className="w-full">
                <Button variant="outline" className="w-full text-base font-medium border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
                  Sign in to existing account
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
