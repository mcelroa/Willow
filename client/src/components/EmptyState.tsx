interface EmptyStateProps {
   icon: React.ElementType;
   title: string;
   description?: string;
   action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
   return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
         <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
         </div>
         <div>
            <p className="font-medium text-sm">{title}</p>
            {description && (
               <p className="text-sm text-muted-foreground mt-0.5 max-w-xs">{description}</p>
            )}
         </div>
         {action}
      </div>
   );
}
