import { createFileRoute } from "@tanstack/react-router";
import { LazyImage, EmptyState } from "@/components/kna/components";
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

  const handleDownload = (id: string, assetNumber: string) => {
    downloadLink.mutate(id, {
      onSuccess: async (link) => {
        // link.url is on a different origin than the app, so the <a download>
        // attribute is ignored by the browser (cross-origin downloads are
        // blocked for security) — fetching the bytes ourselves and handing
        // the browser a local blob: URL sidesteps that, forcing a real save
        // instead of the file just opening/rendering in a new tab. Falls
        // back to the old open-in-new-tab behavior if the fetch itself is
        // blocked (e.g. the file host doesn't send permissive CORS headers).
        try {
          const response = await fetch(link.url);
          if (!response.ok) throw new Error(`download fetch failed: ${response.status}`);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = assetNumber;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(blobUrl);
        } catch {
          window.open(link.url, "_blank", "noopener,noreferrer");
        }
      },
      onError: () => toast.error("Couldn't get a download link. Please try again."),
    });
  };

  return (
    <div>
      <p className="eyebrow">Purchased records</p>
      <h1 className="mt-2 font-display text-4xl">My downloads</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        All watermark-free files you've purchased.
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
            description="Once you buy a record, its watermark-free file will show up here."
          />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-paper-warm">
                <TableHead>Record</TableHead>
                <TableHead>Downloads left</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloads?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <LazyImage
                        src={d.thumbnail}
                        alt=""
                        containerClassName="h-12 w-16 shrink-0"
                        className="bw"
                      />
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{d.asset_title}</p>
                        <p className="text-xs text-muted-foreground">{d.order_number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {d.downloads_remaining ?? Math.max(0, d.max_downloads - d.download_count)} of{" "}
                    {d.max_downloads}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="rounded-none bg-ink text-paper hover:bg-ink/90"
                      onClick={() => handleDownload(d.id, d.asset_number)}
                      disabled={downloadLink.isPending || d.can_download === false}
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
