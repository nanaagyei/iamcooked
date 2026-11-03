"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { addPendingScan } from "@/components/scan/ScanClaimOnAuth";
import Link from "next/link";
import { Upload, FileCode, WarningCircle } from "@phosphor-icons/react";
import { CopyCommand } from "@/components/check/CopyCommand";
import { SkeletonBlock } from "@/components/feedback";

const ACCEPTED_FORMATS = [
  { name: "package-lock.json", description: "npm" },
  { name: "pnpm-lock.yaml", description: "pnpm" },
  { name: "yarn.lock", description: "Yarn" },
  { name: "bun.lock", description: "Bun" },
  { name: "requirements.txt", description: "pip" },
  { name: "poetry.lock", description: "Poetry" },
  { name: "uv.lock", description: "uv" },
  { name: "go.mod", description: "Go" },
  { name: "Cargo.lock", description: "Rust" },
  { name: "Gemfile.lock", description: "Ruby" },
  { name: "composer.lock", description: "PHP" },
];

const MCP_FILE = /(^|[./_-])mcp(_config)?\.json$|claude_desktop_config\.json$/i;

const MAX_FILE_SIZE_MB = 10;

export function ScanUploadDropzone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFile = useCallback(() => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const isMcp = !!file && MCP_FILE.test(file.name);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/scan/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.error?.message ?? "Upload failed. Please try again.";
        setError(msg);
        toast.error("Scan failed", msg);
        return;
      }
      toast.success("Scan complete", "Opening your risk report...");
      addPendingScan({ scanReportId: json.scanReportId, accessToken: json.accessToken });
      router.push(`/scan/report/${json.scanReportId}?token=${encodeURIComponent(json.accessToken)}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      toast.error("Network error", "Please check your connection and try again.");
    } finally {
      setIsUploading(false);
    }
  }, [file, router]);

  return (
    <div className="mx-auto max-w-xl">
      <motion.button
        type="button"
        layout
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "w-full rounded-2xl border-2 border-dashed p-10 sm:p-14 transition-colors cursor-pointer text-left",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-muted-foreground/50",
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files[0];
          if (dropped) { setFile(dropped); setError(null); }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yaml,.yml,.lock,.txt,.mod"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) { setFile(selected); setError(null); }
          }}
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" weight="bold" />
          </div>
          {file ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5">
                <FileCode className="h-4 w-4" weight="bold" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB · Click to change
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-medium">Drag and drop your lockfile here</p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
              <div className="flex flex-wrap justify-center gap-2">
                {ACCEPTED_FORMATS.map((fmt) => (
                  <span key={fmt.name} className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs">
                    {fmt.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {file && isMcp && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 text-sm">
                That&apos;s an MCP config. Use the{" "}
                <Link href="/mcp" className="font-medium underline underline-offset-4">
                  MCP checker
                </Link>{" "}
                instead. It runs in your browser, so any API keys in the file never leave your machine.
              </CardContent>
            </Card>
          </motion.div>
        )}
        {file && !isMcp && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex gap-3"
          >
            <Button className="h-12 flex-1" size="lg" onClick={handleUpload}>
              Scan dependencies
            </Button>
            <Button variant="secondary" className="h-12" size="lg" onClick={resetFile}>
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isUploading && (
        <div className="mt-6 space-y-3">
          <SkeletonBlock className="h-16 w-full rounded-2xl" />
          <SkeletonBlock className="h-4 w-2/3 mx-auto" />
          <p className="text-center text-sm text-muted-foreground">
            Parsing {file?.name} — querying OSV and incident database...
          </p>
        </div>
      )}

      {error && (
        <Card className="mt-6 border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <WarningCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" weight="bold" />
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Max file size: {MAX_FILE_SIZE_MB}MB. Your lockfile is not stored after processing.
      </p>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Monorepo or several services? Scan every lockfile at once.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The CLI finds every lockfile in your repo, plus your MCP configs, and runs locally. Only package names
          and versions leave your machine.
        </p>
        <CopyCommand command="npx iamcooked" className="mt-3" />
      </div>
    </div>
  );
}
