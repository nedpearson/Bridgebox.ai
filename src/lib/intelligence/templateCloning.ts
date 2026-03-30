import { supabase } from "../supabase";

export const templateCloningService = {
  /**
   * Deep clones a marketplace template (which defines a standard workflow)
   * into a specific tenant workspace without mutating the original template
   * and assigning exact RLS ownership.
   */
  async cloneTemplateToTenant(
    sourceTemplateId: string,
    targetOrganizationId: string,
  ) {
    try {
      // 1. Fetch the master template definition
      const { data: masterTemplate, error: fetchError } = await supabase
        .from("bb_templates")
        .select("*")
        .eq("id", sourceTemplateId)
        .single();

      if (fetchError || !masterTemplate) {
        throw new Error("Master template not found");
      }

      // 2. Clone the template record itself into the tenant's workspace
      //    This makes it an active `workflow` pattern for them
      const { data: newWorkflow, error: cloneError } = await supabase
        .from("bb_workflows")
        .insert({
          organization_id: targetOrganizationId,
          name: masterTemplate.name,
          description: masterTemplate.description,
          status: "active",
          config: masterTemplate.config, // The JSON defining steps, forms, agent prompts
        })
        .select("id")
        .single();

      if (cloneError) {
        throw new Error(
          `Failed to instantiate workflow: ${cloneError.message}`,
        );
      }

      // 3. Mark the install in the ecosystem tracking architecture
      await supabase.from("bb_template_installs").insert({
        organization_id: targetOrganizationId,
        template_id: sourceTemplateId,
        status: "active",
      });

      return newWorkflow.id;
    } catch (error) {
      console.error("Deep cloning failure:", error);
      throw error;
    }
  },
};
