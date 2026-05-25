import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_STORAGE_KEY } from "@/lib/auth";
import { loginUser } from "@/lib/googleSheetApi";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAuthenticatedUser = (response: unknown) => {
    const record = typeof response === "object" && response !== null ? (response as Record<string, unknown>) : {};
    const data = record.data;

    if (Array.isArray(data)) {
      return data.length > 0;
    }

    if (typeof data === "boolean") {
      return data;
    }

    if (typeof data === "object" && data !== null) {
      return true;
    }

    if (typeof data === "string") {
      return data.trim().length > 0 && !/not found|invalid|does not exist/i.test(data);
    }

    return record.success === true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await loginUser(formData);

      if (!hasAuthenticatedUser(response)) {
        throw new Error("User not found. Please check your credentials.");
      }

      window.localStorage.setItem(AUTH_STORAGE_KEY, formData.userId);
      toast.success("Login successful.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#edf7f6_48%,_#fff7ed_100%)] px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <section className="mx-auto w-full max-w-[430px]">
          <Card>
            <CardHeader>
              <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <LockKeyhole className="size-5" />
              </div>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="username">User ID</Label>
                  <div className="mt-2">
                    <Input
                      id="username"
                      autoComplete="username"
                      placeholder="Enter user ID"
                      type="text"
                      value={formData.userId}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, userId: event.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password">Password</Label>
                    <button className="text-xs font-medium text-primary hover:underline" type="button">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <Input
                      className="pr-11"
                      id="password"
                      autoComplete="current-password"
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                    <Button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-0 top-0"
                      onClick={() => setShowPassword((value) => !value)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>

                <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
                  <LogIn />
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-5 rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Use authorized inventory credentials for purchase, manufacturing, and departure entries.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
