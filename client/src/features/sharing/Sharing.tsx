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
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import TourGuide from "@/components/TourGuide";
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
   const { shareLinks, isLoading, createShareLink, revokeShareLink, deleteRevokedLinks } =
      useSharing();
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

   const tourSteps = [
      {
         target: "body",
         placement: "center" as const,
         content: "The Sharing page lets you share a read-only view of your data with caregivers or your care team — no account required on their end.",
         disableBeacon: true,
      },
      {
         target: "#sharing-create-card",
         content: "Create a shareable link here. Add a label so you remember who it's for (e.g. 'Dr Smith' or 'Mum'), and optionally set an expiry date.",
         disableBeacon: true,
      },
      {
         target: "body",
         placement: "center" as const,
         content: "Once created, copy the link and send it. You can revoke it at any time to cut off access — the link will stop working immediately.",
         disableBeacon: true,
      },
   ];

   return (
      <>
         <TourGuide pageName="sharing" steps={tourSteps} />
         <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-5">
            <PageHeader
               title="Sharing"
               description="Share a read-only link with caregivers or your care team — no account required."
            />

            <div id="sharing-create-card" className="rounded-2xl border bg-card overflow-hidden divide-y">
               <div className="px-5 py-3.5">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                     Create a link
                  </p>
               </div>
               <form noValidate onSubmit={handleSubmit(onSubmit)}>
                  <div className="px-5 py-5 flex flex-col gap-4">
                     <div>
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                           Label{" "}
                           <span className="normal-case font-normal tracking-normal">(optional)</span>
                        </p>
                        <Input
                           id="label"
                           placeholder="e.g. Dr Smith, Mum"
                           {...register("label")}
                        />
                        {errors.label && (
                           <p className="text-sm text-destructive mt-1.5">{errors.label.message}</p>
                        )}
                     </div>
                     <div>
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                           Expires on{" "}
                           <span className="normal-case font-normal tracking-normal">(optional)</span>
                        </p>
                        <Input
                           id="expiresAt"
                           type="date"
                           min={new Date().toISOString().split("T")[0]}
                           {...register("expiresAt")}
                        />
                        {errors.expiresAt && (
                           <p className="text-sm text-destructive mt-1.5">{errors.expiresAt.message}</p>
                        )}
                     </div>
                  </div>
                  <div className="border-t px-5 py-3.5 flex items-center justify-between">
                     {createShareLink.isError && (
                        <p className="text-sm text-destructive">Something went wrong.</p>
                     )}
                     <div className="ml-auto">
                        <Button
                           type="submit"
                           className="gap-1.5"
                           disabled={createShareLink.isPending}
                        >
                           <Link2 className="h-4 w-4" />
                           {createShareLink.isPending ? "Creating..." : "Create link"}
                        </Button>
                     </div>
                  </div>
               </form>
            </div>

            {isLoading ? (
               <LoadingSpinner />
            ) : (
               <>
                  {activeLinks.length > 0 && (
                     <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                           Active links
                        </p>
                        {activeLinks.map((link) => (
                           <div key={link.id} className="rounded-2xl border bg-card overflow-hidden">
                              <div className="px-5 py-3.5 border-b flex items-start justify-between gap-3">
                                 <div>
                                    <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                                       {link.label ?? "Untitled"}
                                    </p>
                                    <p className="font-semibold text-sm mt-0.5">
                                       Created {formatDate(link.createdAt)}
                                    </p>
                                 </div>
                              </div>
                              <div className="px-5 py-3.5 flex items-center justify-between gap-3">
                                 <p className="text-xs text-muted-foreground">
                                    {link.expiresAt && `Expires ${formatDate(link.expiresAt)} · `}
                                    {link.lastViewedAt
                                       ? `Last viewed ${formatDate(link.lastViewedAt)}`
                                       : "Not viewed yet"}
                                 </p>
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
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {revokedLinks.length > 0 && (
                     <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                           <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                              Revoked links
                           </p>
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
                           <div key={link.id} className="rounded-2xl border bg-card overflow-hidden opacity-50">
                              <div className="px-5 py-3.5">
                                 <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                                    {link.label ?? "Untitled"}
                                 </p>
                                 <p className="text-sm mt-0.5">
                                    Created {formatDate(link.createdAt)} · Revoked
                                 </p>
                              </div>
                           </div>
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
         </div>

         <AlertDialog
            open={revokeTargetId !== null}
            onOpenChange={(open) => {
               if (!open) setRevokeTargetId(null);
            }}
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
      </>
   );
}
