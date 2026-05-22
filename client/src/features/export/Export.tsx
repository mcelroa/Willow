import { Button } from "@/components/ui/button";
import agent from "@/lib/api/agent";
import { useState } from "react";

export default function Export() {
   const [isLoading, setIsLoading] = useState(false);

   const handleDownload = async () => {
      setIsLoading(true);
      try {
         const blob = await agent.Export.pdf();
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "willow-export.pdf";
         a.click();
         URL.revokeObjectURL(url);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-4">
         <h1 className="text-xl font-semibold">Export</h1>
         <p className="text-sm text-muted-foreground">
            Download a PDF summary of your check-in history and pending
            questions for your care team.
         </p>
         <div>
            <Button onClick={handleDownload} disabled={isLoading}>
               {isLoading ? "Generating..." : "Download PDF"}
            </Button>
         </div>
      </div>
   );
}
