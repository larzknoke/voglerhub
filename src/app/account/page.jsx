"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "./actions/change-password";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (!isPending && !session) {
    router.push("/signin");
    return null;
  }
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, startTransition] = useTransition();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  const handleChangePassword = () => {
    setPasswordError("");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate form
    if (!passwordForm.currentPassword) {
      setPasswordError("Aktuelles Passwort ist erforderlich");
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError("Neues Passwort ist erforderlich");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Neues Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwörter stimmen nicht überein");
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (result.success) {
        toast.success(result.message || "Passwort erfolgreich geändert");
        setIsPasswordDialogOpen(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(result.error || "Ein Fehler ist aufgetreten");
        toast.error(result.error || "Ein Fehler ist aufgetreten");
      }
    });
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    router.push("/signin");
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kontoeinstellungen</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Kontoinformationen und Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || "User"}
              />
              <AvatarFallback className="text-2xl">
                {getUserInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-2xl font-semibold">{session.user.name}</h3>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
              </p>
              {session.user.emailVerified && (
                <p className="text-xs text-green-600">✓ E-Mail verifiziert</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium mb-4">Sitzungsinformationen</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Benutzer-ID:</span>
                <span className="font-mono">{session.user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sitzungs-ID:</span>
                <span className="font-mono ">{session.session.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rolle:</span>
                <span>
                  {session.user.role.toLocaleUpperCase() || "Keine Rolle"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Erstellt:</span>
                <span>
                  {new Date(session.user.createdAt).toLocaleDateString("de-DE")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex justify-between">
            <Button variant="outline" onClick={handleChangePassword}>
              Passwort ändern
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Geben Sie Ihr aktuelles und neues Passwort ein
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              {passwordError && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {passwordError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  disabled={isChangingPassword}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Neues Passwort</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  disabled={isChangingPassword}
                  placeholder="••••••••"
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Mindestens 8 Zeichen erforderlich
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  disabled={isChangingPassword}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={isChangingPassword}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Wird geändert..." : "Passwort ändern"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
