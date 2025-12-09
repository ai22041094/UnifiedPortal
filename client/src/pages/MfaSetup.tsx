import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Shield, Smartphone, Key, Loader2, CheckCircle, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MfaStatus {
  enabled: boolean;
}

interface MfaSetupResponse {
  qrCode: string;
  secret: string;
}

export default function MfaSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  const { data: mfaStatus, isLoading: statusLoading } = useQuery<MfaStatus>({
    queryKey: ["/api/auth/mfa/status"],
  });

  const setupMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/auth/mfa/setup", { password });
      return res.json();
    },
    onSuccess: (data: MfaSetupResponse) => {
      setSetupData(data);
      setPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifySetupMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/mfa/verify-setup", { code });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/mfa/status"] });
      setSetupData(null);
      setVerifyCode("");
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been enabled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
      setVerifyCode("");
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/auth/mfa/disable", { password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/mfa/status"] });
      setDisableDialogOpen(false);
      setDisablePassword("");
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Disable",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setupMutation.mutate(password);
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode.length !== 6) return;
    verifySetupMutation.mutate(verifyCode);
  };

  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) return;
    disableMutation.mutate(disablePassword);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard",
    });
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderEnabledState = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-lg" data-testid="text-mfa-enabled">MFA is Enabled</CardTitle>
              <CardDescription>Your account is protected with two-factor authentication</CardDescription>
            </div>
          </div>
          <Badge variant="default" className="bg-green-500" data-testid="badge-mfa-status">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          variant="destructive" 
          onClick={() => setDisableDialogOpen(true)}
          data-testid="button-disable-mfa"
        >
          Disable MFA
        </Button>
      </CardContent>
    </Card>
  );

  const renderSetupForm = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Set up Two-Factor Authentication</CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleStartSetup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Confirm your password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-9 pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-setup-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={setupMutation.isPending || !password}
            data-testid="button-start-setup"
          >
            {setupMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            Start Setup
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderQRCodeStep = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Scan QR Code</CardTitle>
            <CardDescription>Use your authenticator app to scan the QR code below</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            <img 
              src={setupData?.qrCode} 
              alt="MFA QR Code" 
              className="w-48 h-48"
              data-testid="img-qr-code"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Or enter this secret key manually:</Label>
          <div className="flex gap-2">
            <Input
              value={setupData?.secret || ""}
              readOnly
              className="font-mono text-sm"
              data-testid="input-secret-key"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(setupData?.secret || "")}
              data-testid="button-copy-secret"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleCompleteSetup} className="space-y-4">
          <div className="space-y-2">
            <Label>Enter verification code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verifyCode}
                onChange={(value) => setVerifyCode(value)}
                data-testid="input-verify-code"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSetupData(null)}
              data-testid="button-cancel-setup"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={verifySetupMutation.isPending || verifyCode.length !== 6}
              data-testid="button-complete-setup"
            >
              {verifySetupMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Complete Setup
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/profile")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">Security Settings</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-page-title">Two-Factor Authentication</h1>
          <p className="text-muted-foreground">
            Add an extra layer of security to your account by requiring a verification code in addition to your password.
          </p>
        </div>

        <div className="space-y-6">
          {mfaStatus?.enabled ? (
            renderEnabledState()
          ) : setupData ? (
            renderQRCodeStep()
          ) : (
            renderSetupForm()
          )}
        </div>
      </main>

      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to confirm disabling MFA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDisable}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="disable-password">Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="disable-password"
                    type={showDisablePassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-9 pr-9"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    data-testid="input-disable-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowDisablePassword(!showDisablePassword)}
                  >
                    {showDisablePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDisableDialogOpen(false);
                  setDisablePassword("");
                }}
                data-testid="button-cancel-disable"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={disableMutation.isPending || !disablePassword}
                data-testid="button-confirm-disable"
              >
                {disableMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Disable MFA
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
