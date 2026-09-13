import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccessDenied() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Lock className="mx-auto h-12 w-12 text-foreground/30" />
        <h1 className="text-lg font-medium text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this project.
        </p>
        <Link href="/editor">
          <Button variant="outline">Go to Projects</Button>
        </Link>
      </div>
    </div>
  );
}
