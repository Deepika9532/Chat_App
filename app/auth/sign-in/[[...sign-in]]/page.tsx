import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "w-full max-w-md shadow-md",
          },
        }}
      />
    </div>
  );
}
