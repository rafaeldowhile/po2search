import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ErrorBoundary() {
    const error = useRouteError();

    let errorMessage = "An unexpected error occurred.";
    let errorDetails = "";

    if (isRouteErrorResponse(error)) {
        errorMessage = error.data;
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || "";
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Error
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="font-medium">{errorMessage}</p>
                    {errorDetails && (
                        <pre className="p-4 bg-muted rounded-md text-sm overflow-auto">
                            {errorDetails}
                        </pre>
                    )}
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                    >
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
} 