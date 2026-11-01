"use client";

import { useActionState, useState } from "react";
import { createSite, type NewSiteState } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { buttonClass, Card, Field, inputClass } from "./ui";

export default function NewSiteForm({ timeZones, copyFrom }: { timeZones: string[]; copyFrom: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState<NewSiteState, FormData>(createSite, {});
  const [names, setNames] = useState(["", ""]);
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const errors = state.errors ?? {};

  const setName = (index: number, value: string) => {
    const next = index === 0 ? [value, names[1]] : [names[0], value];
    setNames(next);
    if (!slugEdited) setSlug(slugify(next.filter(Boolean).join("-")));
  };

  return (
    <form action={formAction} className="space-y-6">
      <Card title="The couple">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="coupleName1" error={errors.coupleName1}>
            <input id="coupleName1" name="coupleName1" required value={names[0]} onChange={(e) => setName(0, e.target.value)} className={inputClass} />
          </Field>
          <Field label="Second name" htmlFor="coupleName2" error={errors.coupleName2}>
            <input id="coupleName2" name="coupleName2" required value={names[1]} onChange={(e) => setName(1, e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Web address" htmlFor="slug" error={errors.slug} hint={`The site will be at /${slug || "their-names"}`}>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase());
            }}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card title="The wedding">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date and start time" htmlFor="weddingDate" error={errors.weddingDate}>
            <input id="weddingDate" name="weddingDate" type="datetime-local" required className={inputClass} />
          </Field>
          <Field label="Time zone of the wedding" htmlFor="timeZone" error={errors.timeZone} hint="Start typing a city, e.g. Halifax">
            <input id="timeZone" name="timeZone" list="time-zones" required defaultValue="America/Halifax" className={inputClass} />
            <datalist id="time-zones">
              {timeZones.map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
          </Field>
        </div>
      </Card>

      <Card
        title="Start from"
        description="Copying a site brings over its wording, attire, schedule and colours. Photos, logo, venue, hosts and music start empty."
      >
        <Field label="Content" htmlFor="startFrom">
          <select id="startFrom" name="startFrom" defaultValue="blank" className={inputClass}>
            <option value="blank">A blank Heirloom site</option>
            {copyFrom.map((site) => (
              <option key={site.id} value={site.id}>
                Copy of {site.label}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {state.message && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Creating…" : "Create site"}
      </button>
    </form>
  );
}
