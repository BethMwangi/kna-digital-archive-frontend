import { createFileRoute } from "@tanstack/react-router";
import { LicenseBadge, EmptyState } from "@/components/kna/components";
import { useDownloads, useDownloadLink } from "@/hooks/use-downloads";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/account/downloads")({
  head: () => ({ meta: [{ title: "My downloads — Urithi account" }] }),
  component: Downloads,
});

function Downloads() {
  const { data: downloads, isPending, isError } = useDownloads();
  const downloadLink = useDownloadLink();

  const handleDownload = (id: string) => {
    downloadLink.mutate(id, {
      onSuccess: (link) => {
        window.open(link.url, "_blank", "noopener,noreferrer");
      },
      onError: () => toast.error("Couldn't get a download link. Please try again."),
    });
  };

  return (
    <div>
      <p className="eyebrow">Licensed records</p>
      <h1 className="mt-2 font-display text-4xl">My downloads</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        All watermark-free files you're licensed to use.
      </p>

      {isPending ? (
        <div className="mt-8 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <p className="mt-8 text-sm text-destructive">
          Couldn't load your downloads. Please try again.
        </p>
      ) : downloads && downloads.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Download className="h-5 w-5" />}
            title="No downloads yet"
            description="Once you license a record, its watermark-free file will show up here."
          />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-paper-warm">
                <TableHead>Record</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Downloads left</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloads?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden bg-ink">
                        <img src={d.thumbnail} alt="" className="bw h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{d.asset_title}</p>
                        <p className="text-xs text-muted-foreground">{d.order_number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <LicenseBadge type={d.license_name as never} />
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {Math.max(0, d.max_downloads - d.download_count)} of {d.max_downloads}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="rounded-none bg-ink text-paper hover:bg-ink/90"
                      onClick={() => handleDownload(d.id)}
                      disabled={downloadLink.isPending || d.download_count >= d.max_downloads}
                    >
                      <Download className="mr-1.5 h-3 w-3" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
