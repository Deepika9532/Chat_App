import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <SignUp 
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
