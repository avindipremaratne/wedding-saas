"use client";

import { useTransition } from "react";
import { setEnquiryHandled } from "@/app/admin/actions";
import { secondaryButtonClass } from "./ui";

export default function EnquiryHandledButton({ id, handled }: { id: string; handled: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button type="button" disabled={pending} className={secondaryButtonClass} onClick={() => startTransition(() => setEnquiryHandled(id, !handled))}>
      {handled ? "Mark as new" : "Mark as handled"}
    </button>
  );
}
