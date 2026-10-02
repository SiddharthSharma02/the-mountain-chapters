import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ExperienceForm } from "@/components/admin/experience-form";
import { updateExperience } from "@/lib/actions/admin-experiences";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: experience } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (!experience) notFound();

  const action = updateExperience.bind(null, id);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">Edit Experience</h1>
      <div className="mt-6">
        <ExperienceForm experience={experience} action={action} />
      </div>
    </div>
  );
}
