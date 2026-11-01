"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useMemo, useState, type FormEvent } from "react";
import { saveSite, type SaveSiteState } from "@/app/admin/actions";
import { THEME_COLOR_KEYS, type PaletteSwatch, type SiteFormValues } from "@/lib/admin/site-form";
import type { ScheduleItem, ThemeColors } from "@/lib/types";
import { GalleryPhotos, SinglePhoto } from "./PhotoFields";
import { buttonClass, Card, dangerButtonClass, Field, inputClass, secondaryButtonClass } from "./ui";

const textareaClass = `${inputClass} min-h-24`;

export default function SiteEditor({
  siteId,
  initial,
  timeZones,
  themes,
  defaultColors,
  previewHref,
  liveHref,
}: {
  siteId: string;
  initial: SiteFormValues;
  timeZones: string[];
  themes: { id: string; name: string }[];
  defaultColors: ThemeColors;
  previewHref: string;
  liveHref: string;
}) {
  const action = useMemo(() => saveSite.bind(null, siteId), [siteId]);
  const [state, formAction, pending] = useActionState<SaveSiteState, FormData>(action, { status: "idle" });
  const [dirty, setDirty] = useState(false);

  const [hero, setHero] = useState(initial.heroPhoto);
  const [logo, setLogo] = useState(initial.logo);
  const [gallery, setGallery] = useState(initial.gallery);
  const [attireEnabled, setAttireEnabled] = useState(initial.attireEnabled);
  const [palette, setPalette] = useState<PaletteSwatch[]>(initial.attirePalette);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initial.schedule);
  const [colors, setColors] = useState<ThemeColors>({ ...defaultColors, ...initial.colors });

  const errors = state.status === "error" ? state.errors ?? {} : {};
  const changed = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setDirty(true);
  };

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Submitting through onSubmit (not <form action>) keeps what was typed
  // on screen when the server reports a problem, instead of resetting it.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(data);
    });
  };

  const [lastSaved, setLastSaved] = useState(0);
  if (state.status === "saved" && state.savedAt !== lastSaved) {
    setLastSaved(state.savedAt);
    setDirty(false);
  }

  const v = initial;
  const input = (name: keyof SiteFormValues, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={name} name={name} defaultValue={String(v[name] ?? "")} aria-invalid={Boolean(errors[name])} className={inputClass} {...props} />
  );
  const textarea = (name: keyof SiteFormValues, rows = 3) => (
    <textarea id={name} name={name} rows={rows} defaultValue={String(v[name] ?? "")} aria-invalid={Boolean(errors[name])} className={textareaClass} />
  );

  return (
    <form onSubmit={onSubmit} onChange={() => setDirty(true)} className="space-y-6 pb-28" noValidate>
      <Card title="Status and address">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="published" defaultChecked={v.published} className="mt-1 h-4 w-4 accent-navy" />
          <span>
            <span className="block text-sm font-medium">Published</span>
            <span className="block text-xs text-stone-500">When on, guests can open the site and RSVP. Leave off while you&apos;re still preparing it.</span>
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Web address" htmlFor="slug" error={errors.slug} hint="Lowercase letters, numbers and hyphens. Changing it breaks links already sent to guests.">
            {input("slug", { required: true })}
          </Field>
          <Field label="Design" htmlFor="themeId">
            <select id="themeId" name="themeId" defaultValue={v.themeId} className={inputClass}>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Couple and date">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="coupleName1" error={errors.coupleName1}>
            {input("coupleName1", { required: true })}
          </Field>
          <Field label="Second name" htmlFor="coupleName2" error={errors.coupleName2}>
            {input("coupleName2", { required: true })}
          </Field>
          <Field label="Date and start time" htmlFor="weddingDate" error={errors.weddingDate} hint="Used for the countdown and calendar invites.">
            {input("weddingDate", { type: "datetime-local", required: true })}
          </Field>
          <Field label="End time (optional)" htmlFor="weddingEnd" error={errors.weddingEnd} hint="For calendar invites. Defaults to 5 hours after the start.">
            {input("weddingEnd", { type: "datetime-local" })}
          </Field>
          <Field label="Time zone of the wedding" htmlFor="timeZone" error={errors.timeZone}>
            {input("timeZone", { list: "time-zones", required: true })}
            <datalist id="time-zones">
              {timeZones.map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
          </Field>
          <Field label="Time as guests see it" htmlFor="ceremonyTime" error={errors.ceremonyTime} hint='e.g. "3:00 PM AST (2:00 PM EST)"'>
            {input("ceremonyTime", { required: true })}
          </Field>
          <Field label="RSVP by (optional)" htmlFor="rsvpDeadline" error={errors.rsvpDeadline}>
            {input("rsvpDeadline", { type: "date" })}
          </Field>
        </div>
      </Card>

      <Card title="Venue">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Venue name" htmlFor="venueName" error={errors.venueName}>
            {input("venueName", { required: true })}
          </Field>
          <Field label="City" htmlFor="venueCity">
            {input("venueCity")}
          </Field>
        </div>
        <Field label="Address" htmlFor="venueAddress" hint="One line per line of the address.">
          {textarea("venueAddress", 2)}
        </Field>
        <Field label="Google Maps link" htmlFor="venueMapsUrl" error={errors.venueMapsUrl} hint="In Google Maps, open the venue and use Share → Copy link.">
          {input("venueMapsUrl", { type: "url" })}
        </Field>
        <Field label="Description" htmlFor="venueDescription">
          {textarea("venueDescription")}
        </Field>
      </Card>

      <Card title="Photos" description="Photos upload straight away, but only appear on the site after you press Save.">
        <div className="grid gap-6 sm:grid-cols-2">
          <SinglePhoto siteId={siteId} name="heroPhoto" label="Main photo (top of the page)" value={hero} onChange={changed(setHero)} />
          <SinglePhoto siteId={siteId} name="logo" label="Monogram logo (also the browser-tab icon)" value={logo} onChange={changed(setLogo)} />
        </div>
        <GalleryPhotos siteId={siteId} value={gallery} onChange={changed(setGallery)} />
        <Field label="Text above the gallery" htmlFor="storyText">
          {input("storyText")}
        </Field>
      </Card>

      <Card title="Wording">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tagline" htmlFor="tagline" hint='Above the names, e.g. "Where We Become Us"'>
            {input("tagline")}
          </Field>
          <Field label="Line above the names" htmlFor="heroKicker" hint={`e.g. "We're getting married"`}>
            {input("heroKicker")}
          </Field>
        </div>
        <Field label="Verse or quote (optional)" htmlFor="verseText">
          {textarea("verseText", 2)}
        </Field>
        <Field label="Verse reference" htmlFor="verseReference" hint="e.g. 1 Corinthians 13:4–7">
          {input("verseReference")}
        </Field>
        <Field label="Invitation opening" htmlFor="invitationLead" hint='e.g. "With hearts full of love and joy,"'>
          {input("invitationLead")}
        </Field>
        <Field label="Hosts" htmlFor="invitationHosts" hint="One per line, e.g. Mr. & Mrs. Fernando">
          {textarea("invitationHosts", 2)}
        </Field>
        <Field label="Invitation line" htmlFor="inviteLine" hint='e.g. "invite you to celebrate the union of"'>
          {input("inviteLine")}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="RSVP message" htmlFor="rsvpPrompt">
            {input("rsvpPrompt")}
          </Field>
          <Field label="Footer tagline" htmlFor="footerTagline">
            {input("footerTagline")}
          </Field>
        </div>
      </Card>

      <Card title="Attire">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="attireEnabled" checked={attireEnabled} onChange={(e) => changed(setAttireEnabled)(e.target.checked)} className="h-4 w-4 accent-navy" />
          <span className="text-sm font-medium">Show the Attire section</span>
        </label>
        <div className={attireEnabled ? "space-y-5" : "hidden"}>
          <Field label="Dress code title" htmlFor="attireTitle" hint='e.g. "Modern Heirloom"'>
            {input("attireTitle")}
          </Field>
          <Field label="Introduction" htmlFor="attireIntro">
            {textarea("attireIntro", 2)}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ladies" htmlFor="attireLadies">
              {textarea("attireLadies")}
            </Field>
            <Field label="Gentlemen" htmlFor="attireGentlemen">
              {textarea("attireGentlemen")}
            </Field>
          </div>
          <PaletteEditor value={palette} onChange={changed(setPalette)} error={errors.attirePalette} />
          <Field label="Note under the colours (optional)" htmlFor="attireNote">
            {textarea("attireNote", 2)}
          </Field>
        </div>
      </Card>

      <Card title="Schedule" description="Leave empty to hide the Schedule section.">
        <ScheduleEditor value={schedule} onChange={changed(setSchedule)} error={errors.schedule} />
      </Card>

      <Card title="Music">
        <Field label="YouTube link for the background song" htmlFor="musicTrackUrl" error={errors.musicTrackUrl} hint="Plays after the guest opens the envelope. Leave empty for no music.">
          {input("musicTrackUrl", { type: "url" })}
        </Field>
      </Card>

      <Card title="Colours" description="Change the theme's colours for this couple. Reset puts back the original.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {THEME_COLOR_KEYS.map((key) => (
            <div key={key}>
              <label htmlFor={`color_${key}`} className="mb-1 block text-sm font-medium capitalize">
                {key}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`color_${key}`}
                  name={`color_${key}`}
                  type="color"
                  value={colors[key]}
                  onChange={(e) => changed(setColors)({ ...colors, [key]: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-stone-300"
                />
                {colors[key].toLowerCase() !== defaultColors[key].toLowerCase() && (
                  <button type="button" className="text-xs text-stone-500 underline" onClick={() => changed(setColors)({ ...colors, [key]: defaultColors[key] })}>
                    Reset
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.colors && <p className="text-xs text-red-600">{errors.colors}</p>}
      </Card>

      <Card title="Footer credit">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" htmlFor="creditName">
            {input("creditName")}
          </Field>
          <Field label="Email" htmlFor="creditEmail" error={errors.creditEmail}>
            {input("creditEmail", { type: "email" })}
          </Field>
          <Field label="Phone" htmlFor="creditPhone">
            {input("creditPhone", { type: "tel" })}
          </Field>
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <button type="submit" disabled={pending} className={buttonClass}>
            {pending ? "Saving…" : "Save"}
          </button>
          <Link href={previewHref} target="_blank" className={secondaryButtonClass}>
            Preview
          </Link>
          <Link href={liveHref} target="_blank" className="text-sm text-stone-600 underline">
            Open live site
          </Link>
          <p className="ml-auto text-sm" role="status">
            {state.status === "error" ? (
              <span className="text-red-600">{state.message}</span>
            ) : dirty ? (
              <span className="text-amber-700">Unsaved changes</span>
            ) : state.status === "saved" ? (
              <span className="text-emerald-700">Saved. The live site updates within a minute.</span>
            ) : null}
          </p>
        </div>
      </div>
    </form>
  );
}

function PaletteEditor({ value, onChange, error }: { value: PaletteSwatch[]; onChange: (v: PaletteSwatch[]) => void; error?: string }) {
  const update = (i: number, patch: Partial<PaletteSwatch>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-stone-800">Suggested colours</p>
      <input type="hidden" name="attirePalette" value={JSON.stringify(value)} />
      <ul className="space-y-2">
        {value.map((swatch, i) => (
          <li key={i} className="flex items-center gap-2">
            <input type="color" value={swatch.color || "#cccccc"} onChange={(e) => update(i, { color: e.target.value })} aria-label="Colour" className="h-9 w-12 cursor-pointer rounded border border-stone-300" />
            <input value={swatch.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Name, e.g. Sage" aria-label="Colour name" className={inputClass} />
            <button type="button" className={dangerButtonClass} onClick={() => onChange(value.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={`${secondaryButtonClass} mt-2`} onClick={() => onChange([...value, { name: "", color: "#cccccc" }])}>
        Add colour
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ScheduleEditor({ value, onChange, error }: { value: ScheduleItem[]; onChange: (v: ScheduleItem[]) => void; error?: string }) {
  const update = (i: number, patch: Partial<ScheduleItem>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div>
      <input type="hidden" name="schedule" value={JSON.stringify(value)} />
      <ul className="space-y-3">
        {value.map((item, i) => (
          <li key={i} className="grid gap-2 rounded-lg border border-stone-200 p-3 sm:grid-cols-4">
            <input value={item.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Event, e.g. Ceremony" aria-label="Event name" className={`${inputClass} sm:col-span-2`} />
            <input value={item.startTime} onChange={(e) => update(i, { startTime: e.target.value })} placeholder="Starts, e.g. 3:00 PM" aria-label="Start time" className={inputClass} />
            <input value={item.endTime ?? ""} onChange={(e) => update(i, { endTime: e.target.value })} placeholder="Ends (optional)" aria-label="End time" className={inputClass} />
            <input value={item.location ?? ""} onChange={(e) => update(i, { location: e.target.value })} placeholder="Location (optional)" aria-label="Location" className={`${inputClass} sm:col-span-2`} />
            <input value={item.description ?? ""} onChange={(e) => update(i, { description: e.target.value })} placeholder="Description (optional)" aria-label="Description" className={inputClass} />
            <button type="button" className={dangerButtonClass} onClick={() => onChange(value.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={`${secondaryButtonClass} mt-2`} onClick={() => onChange([...value, { name: "", startTime: "" }])}>
        Add event
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
