import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <div className="container flex items-center justify-center h-screen">
      <form className="flex-1 flex flex-col gap-3 max-w-sm">
        <Link href="/" className="mb-8 -mt-16">
          <Button variant="ghost">
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-mont-medium">Reset password</h1>
        <p className="text-sm text-foreground/60 mb-4">
          Please enter your new password below.
        </p>
        <Label htmlFor="password">New password</Label>
        <Input
          type="password"
          name="password"
          placeholder="New password"
          required
          className="mb-4"
        />
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
        />
        <SubmitButton formAction={resetPasswordAction} className="mt-2">
          Reset password
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </div>
  );
}
