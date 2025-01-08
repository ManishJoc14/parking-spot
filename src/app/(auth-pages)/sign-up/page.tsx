import { signUpAction, signInWithGoogleAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {/* Email handler */}
      <form className="max-w-md  w-full flex flex-col">
        <Link href="/" className="mb-8 -mt-16">
          <Button variant="ghost">
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-mont-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Google handler */}
      <form className="w-full max-w-md">
        <button
          formAction={signInWithGoogleAction}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="https://www.google.com/favicon.ico"
            alt="Google"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          Continue with Google
        </button>
      </form>
    </div>
  );
}
