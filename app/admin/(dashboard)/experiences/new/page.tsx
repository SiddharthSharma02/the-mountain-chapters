import { ExperienceForm } from "@/components/admin/experience-form";
import { createExperience } from "@/lib/actions/admin-experiences";

export default function NewExperiencePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy">New Experience</h1>
      <div className="mt-6">
        <ExperienceForm action={createExperience} />
      </div>
    </div>
  );
}
