import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const EventFormBanner = () => {
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100">
      <Info className="h-4 w-4 text-blue-900 dark:text-blue-100" />
      <AlertTitle>Two-Step Process</AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        Step 1: Create your event here with basic information. <br />
        Step 2: After creation, you'll add detailed content, images, and rich
        descriptions in our Content Management System.
      </AlertDescription>
    </Alert>
  );
};
