"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { deleteRsvp, saveRsvpEmail, setShareLink, type RsvpEmailState } from "@/app/admin/actions";
import { buttonClass, dangerButtonClass, Field, inputClass, secondaryButtonClass } from "./ui";

/** Option 1: an email to the couple for every RSVP. */
export function RsvpEmailForm({ siteId, email, enabled }: { siteId: string; email: string; enabled: boolean }) {
  const action = useMemo(() => saveRsvpEmail.bind(null, siteId), [siteId]);
  const [state, formAction, pending] = useActionState<RsvpEmailState, FormData>(action, { status: "idle" });
  return (
    <form action={formAction} className="space-y-4">
      <label className="flex items-center gap-3">
        <input type="checkbox" name="rsvpEmailEnabled" defaultChecked={enabled} className="h-4 w-4 accent-navy" />
        <span className="text-sm font-medium">Email the couple each time someone replies</span>
      </label>
      <Field label="Couple's email address" htmlFor="notificationEmail" error={state.status === "error" ? state.message : undefined}>
        <input id="notificationEmail" name="notificationEmail" type="email" defaultValue={email} placeholder="couple@example.com" className={inputClass} />
      </Field>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Save email settings"}
        </button>
        {state.status === "saved" && <span className="text-sm text-emerald-700">Saved.</span>}
      </div>
    </form>
  );
}

/** Option 3: a private link that shows the couple their list. */
export function ShareLinkPanel({ siteId, url }: { siteId: string; url: string | null }) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const run = (enabled: boolean, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(() => setShareLink(siteId, enabled));
  };

  if (!url) {
    return (
      <button type="button" disabled={pending} className={buttonClass} onClick={() => run(true)}>
        {pending ? "Creating…" : "Create private link"}
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Private RSVP link" className={`${inputClass} font-mono text-sm`} />
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} className={secondaryButtonClass} onClick={() => run(true, "Make a new link? The old link will stop working.")}>
          New link
        </button>
        <button type="button" disabled={pending} className={secondaryButtonClass} onClick={() => run(false, "Turn off the link? It will stop working straight away.")}>
          Turn off
        </button>
      </div>
    </div>
  );
}

export function DeleteRsvpButton({ siteId, rsvpId }: { siteId: string; rsvpId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={dangerButtonClass}
      onClick={() => {
        if (window.confirm("Delete this RSVP? This can't be undone.")) startTransition(() => deleteRsvp(siteId, rsvpId));
      }}
    >
      Delete
    </button>
  );
}
