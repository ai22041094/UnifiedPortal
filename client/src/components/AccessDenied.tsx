import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AccessDeniedProps {
  appName: string;
}

export default function AccessDenied({ appName }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-destructive/20 shadow-lg">
          <CardContent className="pt-12 pb-10 px-8 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-8"
            >
              <div className="h-24 w-24 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldX className="h-12 w-12 text-destructive" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Access Denied
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                You do not have permission to access
              </p>
              <p className="text-xl font-semibold text-foreground mb-6">
                {appName}
              </p>
              <div className="h-px w-16 mx-auto bg-border mb-6" />
              <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                Please contact your administrator if you believe you should have access to this application.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button variant="outline" asChild data-testid="button-go-back">
                <Link href="/portal">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Link>
              </Button>
              <Button asChild data-testid="button-go-home">
                <Link href="/portal">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Portal
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Error Code: 403 - Forbidden
        </motion.p>
      </motion.div>
    </div>
  );
}
