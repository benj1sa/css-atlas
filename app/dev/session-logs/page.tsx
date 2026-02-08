import Link from "next/link";
import {
  getStudySessionCleanedAndErrored,
  getStudySessionScholarsInRoom,
  getStudySessionCompletedSessions,
  SESSION_TYPE_STUDY,
  SESSION_TYPE_FRONT_DESK,
} from "@/lib/session-logs";
import type { ScholarInRoom, ScholarWithCompletedSession } from "@/lib/session-logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Session Logs Test | Dev Tools",
  description: "Test session log utilities against study_session_logs",
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function SessionLogsTestPage() {
  const [cleanedAll, cleanedStudy, cleanedFd, inRoomAll, inRoomStudy, inRoomFd, completedAll, completedStudy, completedFd] =
    await Promise.all([
      getStudySessionCleanedAndErrored(),
      getStudySessionCleanedAndErrored({ sessionType: SESSION_TYPE_STUDY }),
      getStudySessionCleanedAndErrored({ sessionType: SESSION_TYPE_FRONT_DESK }),
      getStudySessionScholarsInRoom(),
      getStudySessionScholarsInRoom({ sessionType: SESSION_TYPE_STUDY }),
      getStudySessionScholarsInRoom({ sessionType: SESSION_TYPE_FRONT_DESK }),
      getStudySessionCompletedSessions(),
      getStudySessionCompletedSessions({ sessionType: SESSION_TYPE_STUDY }),
      getStudySessionCompletedSessions({ sessionType: SESSION_TYPE_FRONT_DESK }),
    ]);

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-12">
      <div className="flex items-center gap-4">
        <Link
          href="/dev"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Dev Tools
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Session Logs Test</h1>
        <p className="text-muted-foreground mt-1">
          Testing session log utilities against study_session_logs in Supabase.
        </p>
      </div>

      {/* Scholars Currently in Room */}
      <Card>
        <CardHeader>
          <CardTitle>Scholars Currently in Room</CardTitle>
          <CardDescription>
            Valid entry tickets without exit tickets, with time spent so far
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SessionTypeSection
            title="All"
            data={inRoomAll}
            formatDuration={formatDuration}
            formatDate={formatDate}
          />
          <SessionTypeSection
            title={SESSION_TYPE_STUDY}
            data={inRoomStudy}
            formatDuration={formatDuration}
            formatDate={formatDate}
          />
          <SessionTypeSection
            title={SESSION_TYPE_FRONT_DESK}
            data={inRoomFd}
            formatDuration={formatDuration}
            formatDate={formatDate}
          />
        </CardContent>
      </Card>

      {/* Completed Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Entry-Exit Sessions</CardTitle>
          <CardDescription>
            Scholars with valid entry-exit pairs and session duration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SessionTypeSection
            title="All"
            data={completedAll}
            formatDuration={formatDuration}
            formatDate={formatDate}
            showCompleted
          />
          <SessionTypeSection
            title={SESSION_TYPE_STUDY}
            data={completedStudy}
            formatDuration={formatDuration}
            formatDate={formatDate}
            showCompleted
          />
          <SessionTypeSection
            title={SESSION_TYPE_FRONT_DESK}
            data={completedFd}
            formatDuration={formatDuration}
            formatDate={formatDate}
            showCompleted
          />
        </CardContent>
      </Card>

      {/* Cleaned & Errored Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Cleaned & Errored Tickets</CardTitle>
          <CardDescription>
            Categorized by scholar UID. Errored: double exit/enter, exit before
            enter, entry without exit, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CleanedErroredSection result={cleanedAll} title="All" formatDate={formatDate} />
          <CleanedErroredSection
            result={cleanedStudy}
            title={SESSION_TYPE_STUDY}
            formatDate={formatDate}
          />
          <CleanedErroredSection
            result={cleanedFd}
            title={SESSION_TYPE_FRONT_DESK}
            formatDate={formatDate}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SessionTypeSection({
  title,
  data,
  formatDuration,
  formatDate,
  showCompleted,
}: {
  title: string;
  data: ScholarInRoom[] | ScholarWithCompletedSession[];
  formatDuration: (ms: number) => string;
  formatDate: (iso: string) => string;
  showCompleted?: boolean;
}) {
  return (
    <div>
      <h3 className="font-medium text-sm text-muted-foreground mb-2">
        {title} ({data.length})
      </h3>
      {data.length === 0 ? (
        <p className="text-muted-foreground text-sm">No records</p>
      ) : (
        <ul className="space-y-2 rounded-md border p-3 text-sm">
          {data.map((item, i) => {
            const durationMs = showCompleted
              ? "durationMs" in item
                ? item.durationMs
                : 0
              : "timeInRoomMs" in item
                ? item.timeInRoomMs
                : 0;
            return (
              <li
                key={`${item.scholarUid}-${i}`}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="font-medium">
                  {item.scholarName ?? item.scholarUid}
                </span>
                <span className="text-muted-foreground">({item.scholarUid})</span>
                <span className="text-muted-foreground">•</span>
                <span>Entered: {formatDate(item.entryAt)}</span>
                <span className="text-muted-foreground">•</span>
                <span>Duration: {formatDuration(durationMs)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CleanedErroredSection({
  result,
  title,
  formatDate,
}: {
  result: Awaited<ReturnType<typeof getStudySessionCleanedAndErrored>>;
  title: string;
  formatDate: (iso: string) => string;
}) {
  const scholars = Array.from(result.byScholarUid.entries());

  return (
    <div>
      <h3 className="font-medium text-sm text-muted-foreground mb-2">
        {title} — {result.allCleaned.length} cleaned, {result.allErrored.length}{" "}
        errored
      </h3>
      {scholars.length === 0 ? (
        <p className="text-muted-foreground text-sm">No records</p>
      ) : (
        <ul className="space-y-3">
          {scholars.map(([uid, { cleaned, errored, scholarName }]) => (
            <li
              key={uid}
              className={`rounded-md border p-3 text-sm ${
                errored.length > 0 ? "border-destructive/50" : ""
              }`}
            >
              <div className="font-medium">
                {scholarName ?? uid}
                <span className="text-muted-foreground font-normal ml-1">
                  ({uid})
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {cleaned.map((p) => (
                  <div key={p.ticket.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {p.ticket.action_type ?? "?"}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatDate(p.ticket.created_at)}
                    </span>
                    {p.pairedEntryAt && (
                      <span className="text-muted-foreground text-xs">
                        (paired w/ entry {formatDate(p.pairedEntryAt)})
                      </span>
                    )}
                  </div>
                ))}
                {errored.map((p) => (
                  <div key={p.ticket.id} className="flex items-center gap-2">
                    <Badge variant="destructive" className="shrink-0">
                      {p.ticket.action_type ?? "?"} — {p.error}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatDate(p.ticket.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
