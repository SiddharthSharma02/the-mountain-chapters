"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
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
      <div>
        <label className="text-sm font-medium text-navy">Your Name</label>
        <input
          type="text"
          name="author_name"
          required
          defaultValue={defaultAuthorName}
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-navy">Story Title</label>
        <input
          type="text"
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-navy">
          Cover Image URL
        </label>
        <input
          type="url"
          name="cover_image"
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-navy">Your Story</label>
        <textarea
          name="content"
          required
          rows={8}
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
        />
      </div>
      {state && (
        <p
          className={`text-sm ${
            state.success ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-cream hover:bg-navy-light disabled:opacity-60"
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
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-navy">
        Share Your Story
      </h1>
      <p className="mt-2 text-sm text-navy/60">
        Tell us about your journey. You must be signed in — stories are
        reviewed before publishing.{" "}
        {!signedIn && (
          <Link
            href="/login"
            className="font-semibold text-gold-dark hover:text-gold"
          >
            Sign in
          </Link>
        )}
      </p>
      <StoryForm defaultAuthorName={defaultAuthorName} />
    </div>
  );
}
