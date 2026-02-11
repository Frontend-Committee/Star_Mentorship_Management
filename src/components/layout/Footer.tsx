export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-2xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <p className="text-center text-[10px] sm:text-xs text-muted-foreground font-medium">
            &copy; 2026 Star Union. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
