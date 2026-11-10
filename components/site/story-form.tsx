"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { fieldInput, fieldLabel, formMessage, primaryButton } from "@/components/site/form-styles";
import { SpamTrap } from "@/components/site/spam-trap";
import { submitTravelStory } from "@/lib/actions/stories";

export function StoryForm({ defaultAuthorName }: { defaultAuthorName?: string }) {
  const [state, formAction, pending] = useActionState(submitTravelStory, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-8 flex flex-col gap-4">
      <SpamTrap />
      <label className="block">
        <span className={fieldLabel}>Your Name</span>
        <input
          type="text"
          name="author_name"
          autoComplete="name"
          required
          defaultValue={defaultAuthorName}
          className={fieldInput}
        />
      </label>
      <label className="block">
        <span className={fieldLabel}>Story Title</span>
        <input
          type="text"
          name="title"
          required
          className={fieldInput}
        />
      </label>
      <label className="block">
        <span className={fieldLabel}>Cover photo link <span className="font-normal text-navy/50">(optional)</span></span>
        <input
          type="url"
          name="cover_image"
          placeholder="https://…"
          inputMode="url"
          className={fieldInput}
        />
      </label>
      <label className="block">
        <span className={fieldLabel}>Your Story</span>
        <textarea
          name="content"
          required
          rows={8}
          className={fieldInput}
        />
      </label>
      {state && (
        <p role="status" className={formMessage(state.success)}>
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`mt-2 ${primaryButton}`}
      >
        {pending ? "Submitting..." : "Submit Story"}
      </button>
    </form>
  );
}

export function NewStoryPageContent({
  defaultAuthorName,
  signedIn,
}: {
  defaultAuthorName?: string;
  signedIn: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:py-24">
      <p className="eyebrow">Traveller stories</p>
      <h1 className="mt-4 font-serif text-[40px] leading-[1.05] text-navy sm:text-5xl">Share your story</h1>
      <p className="mt-4 text-base leading-relaxed text-navy/70">
        Tell us about your journey in your own words. We read every story before it&apos;s published.
      </p>
      {signedIn ? (
        <StoryForm defaultAuthorName={defaultAuthorName} />
      ) : (
        <div className="mt-10 rounded-[24px] bg-cream-dark/60 p-8">
          <p className="font-serif text-2xl text-navy">Sign in to share a story</p>
          <p className="mt-2 text-sm text-navy/65">An account lets you come back and see when your story is live.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className={primaryButton}>Sign in</Link>
            <Link
              href="/signup"
              className="inline-flex min-h-13 items-center rounded-full px-7 text-[15px] font-semibold text-navy ring-1 ring-navy/20 hover:ring-navy"
            >
              Create an account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
