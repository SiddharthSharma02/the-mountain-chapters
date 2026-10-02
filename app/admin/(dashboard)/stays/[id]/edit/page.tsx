import { redirect } from "next/navigation";

/** The old single-form editor now lives in the Stay Builder. */
export default async function EditStayRedirect({ params }: PageProps<"/admin/stays/[id]/edit">) {
  const { id } = await params;
  redirect(`/admin/stays/${id}`);
}
