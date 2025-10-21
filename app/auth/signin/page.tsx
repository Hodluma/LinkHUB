import { SignInForm } from "@/components/auth/signin-form";

export const metadata = {
  title: "Sign in"
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16">
      <SignInForm />
    </main>
  );
}
