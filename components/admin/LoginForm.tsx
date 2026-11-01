"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { buttonClass, Field, inputClass } from "./ui";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={formAction} className="space-y-5">
      <Field label="Password" htmlFor="password" error={state.error}>
        <input id="password" name="password" type="password" required autoComplete="current-password" autoFocus className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
