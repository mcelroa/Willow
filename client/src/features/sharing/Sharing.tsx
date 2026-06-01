import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSharing } from "@/lib/hooks/useSharing";
import { shareLinkSchema, type ShareLinkFormValues } from "@/lib/schemas/shareLinkSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Link2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const BASE_URL = window.location.origin;

function formatDate(iso: string) {
   return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
   });
}

function CopyButton({ token }: { token: string }) {
   const [copied, setCopied] = useState(false);
   const url = `${BASE_URL}/share/${token}`;

   const handleCopy = async () => {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   return (
      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
         {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
         {copied ? "Copied" : "Copy link"}
      </Button>
   );
}

export default function Sharing() {
   const { shareLinks, isLoading, createShareLink, revokeShareLink, deleteRevokedLinks } = useSharing();
   const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<ShareLinkFormValues>({
      resolver: zodResolver(shareLinkSchema),
   });

   const onSubmit = (values: ShareLinkFormValues) => {
      createShareLink.mutate(
         {
            label: values.label || undefined,
            expiresAt: values.expiresAt || undefined,
         },
         { onSuccess: () => reset() }
      );
   };

   const activeLinks = shareLinks.filter((l) => !l.isRevoked);
   const revokedLinks = shareLinks.filter((l) => l.isRevoked);

   return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
         <h1 className="text-xl font-semibold">Sharing</h1>
         <p className="text-sm text-muted-foreground -mt-4">
            Share a read-only link with caregivers or your care team — no account required.
         </p>

         <Card>
            <CardHeader>
               <CardTitle className="text-base">Create a link</CardTitle>
            </CardHeader>
            <CardContent>
               <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="label">Label (optional)</Label>
                     <Input
                        id="label"
                        placeholder="e.g. Dr Smith, Mum"
                        {...register("label")}
                     />
                     {errors.label && (
                        <p className="text-sm text-destructive">{errors.label.message}</p>
                     )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="expiresAt">Expires on (optional)</Label>
                     <Input
                        id="expiresAt"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        {...register("expiresAt")}
                     />
                     {errors.expiresAt && (
                        <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
                     )}
                  </div>

                  <Button
                     type="submit"
                     className="self-start gap-1.5"
                     disabled={createShareLink.isPending}
                  >
                     <Link2 className="h-4 w-4" />
                     {createShareLink.isPending ? "Creating..." : "Create link"}
                  </Button>

                  {createShareLink.isError && (
                     <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
                  )}
               </form>
            </CardContent>
         </Card>

         {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
         ) : (
            <>
               {activeLinks.length > 0 && (
                  <div className="flex flex-col gap-3">
                     <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Active links
                     </h2>
                     {activeLinks.map((link) => (
                        <Card key={link.id}>
                           <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                              <div className="flex flex-col gap-0.5">
                                 <p className="font-medium text-sm">
                                    {link.label ?? "Untitled link"}
                                 </p>
                                 <p className="text-xs text-muted-foreground">
                                    Created {formatDate(link.createdAt)}
                                    {link.expiresAt && ` · Expires ${formatDate(link.expiresAt)}`}
                                    {link.lastViewedAt && ` · Last viewed ${formatDate(link.lastViewedAt)}`}
                                 </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                 <CopyButton token={link.token} />
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive gap-1.5"
                                    onClick={() => setRevokeTargetId(link.id)}
                                 >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Revoke
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               )}

               {revokedLinks.length > 0 && (
                  <div className="flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                           Revoked links
                        </h2>
                        <Button
                           variant="ghost"
                           size="sm"
                           className="text-destructive hover:text-destructive text-xs"
                           onClick={() => deleteRevokedLinks.mutate()}
                           disabled={deleteRevokedLinks.isPending}
                        >
                           {deleteRevokedLinks.isPending ? "Clearing..." : "Clear all"}
                        </Button>
                     </div>
                     {revokedLinks.map((link) => (
                        <Card key={link.id} className="opacity-50">
                           <CardContent>
                              <p className="font-medium text-sm">
                                 {link.label ?? "Untitled link"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                 Created {formatDate(link.createdAt)} · Revoked
                              </p>
                           </CardContent>
                        </Card>
                     ))}
                  </div>
               )}

               {shareLinks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                     No links yet. Create one above to share your data.
                  </p>
               )}
            </>
         )}

         <AlertDialog
            open={revokeTargetId !== null}
            onOpenChange={(open) => { if (!open) setRevokeTargetId(null); }}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Revoke this link?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Anyone with the link will no longer be able to view your data. This cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     onClick={() => {
                        if (revokeTargetId) revokeShareLink.mutate(revokeTargetId);
                        setRevokeTargetId(null);
                     }}
                  >
                     Revoke
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
