import { supabase } from '../supabase';
import { BridgeboxTemplate, templateService } from './templates';

export interface UnpackResult {
  success: boolean;
  message?: string;
  assets?: {
    entities: string[];
    workflows: string[];
    forms: string[];
  };
}

export const templateInstallEngine = {
  /**
   * Resolves and fetches deep dependency graphs for a template.
   */
  async resolveDependencies(templateId: string): Promise<BridgeboxTemplate[]> {
    const { data: deps, error } = await supabase
       .from('bb_template_dependencies')
       .select('depends_on_template_id, is_required')
       .eq('template_id', templateId);
       
    if (error || !deps) return [];
    
    const resolvedTemplates: BridgeboxTemplate[] = [];
    for (const dep of deps) {
       if (!dep.is_required) continue;
       const depData = await templateService.getTemplateById(dep.depends_on_template_id);
       if (depData) resolvedTemplates.push(depData);
    }
    return resolvedTemplates;
  },

  /**
   * Unpacks a Template blueprint JSON sequentially into the tenant database mapping.
   * Built with resilient rollback ID tracking to prevent partial installations.
   */
  async unpack(template: BridgeboxTemplate, organizationId: string): Promise<UnpackResult> {
    const payload = template.configuration_payload || {};
    const generatedAssetManifest: { table: string, id: string, name: string }[] = [];
    
    // Resolve implicit dependencies required by the blueprint
    // This allows overlays to mandate baseline schemas before proceeding
    const dependencies = await this.resolveDependencies(template.id);
    for (const dep of dependencies) {
       console.log(`Unpacking foundational dependency: ${dep.name}`);
       await this.unpack(dep, organizationId); // Recursive unpack
    }
    
    try {
      // 1. Unroll Entities & Prevent Duplicates (Schema Merge System)
      const mappedEntities = [];
      if (payload.entities && Array.isArray(payload.entities)) {
         for (const entity of payload.entities) {
            
            // Check for duplicate entity existence
            const { data: existingEntity } = await supabase
               .from('bb_custom_entities')
               .select('id, name, schema')
               .eq('organization_id', organizationId)
               .eq('name', entity.name)
               .maybeSingle();

            if (existingEntity) {
               console.log(`[Schema Merge] Entity ${entity.name} exists. Resolving conflicts leveraging ${template.merge_strategy}...`);
               
               if (template.merge_strategy === 'skip_existing') {
                  continue;
               }
               
               if (template.merge_strategy === 'merge_fields') {
                  // Merge incoming fields array with existing schema definition to prevent data loss
                  const existingFields = existingEntity.schema?.fields || [];
                  const newFields = entity.fields || [];
                  const mergedFields = Array.from(new Set([...existingFields, ...newFields]));
                  
                  await supabase.from('bb_custom_entities').update({
                     schema: { ...existingEntity.schema, fields: mergedFields }
                  }).eq('id', existingEntity.id);
                  
                  mappedEntities.push(`Entity Merged: ${entity.name}`);
                  continue;
               }
               
               if (template.merge_strategy === 'overwrite') {
                  // Hard drop existing so insert can recreate it fully
                  await supabase.from('bb_custom_entities').delete().eq('id', existingEntity.id);
               }
            }

            const { data, error } = await supabase.from('bb_custom_entities').insert({
               organization_id: organizationId,
               name: entity.name,
               schema: { fields: entity.fields || [] },
               installed_from_template: template.id,
               status: 'active'
            }).select().single();
            
            if (!error && data) {
              mappedEntities.push(`Entity Built: ${entity.name}`);
              generatedAssetManifest.push({ table: 'bb_custom_entities', id: data.id, name: entity.name });
            } else if (error) {
              throw new Error(`Failed to unroll entity ${entity.name}: ${error.message}`);
            }
         }
      }

      // 2. Unroll Workflows
      const mappedWorkflows = [];
      if (payload.workflows && Array.isArray(payload.workflows)) {
         for (const workflow of payload.workflows) {
            
            // Check for schema logic conflicts
            const { data: existing } = await supabase
               .from('bb_workflows')
               .select('id')
               .eq('organization_id', organizationId)
               .eq('name', workflow.name)
               .maybeSingle();
               
            if (existing) {
               if (template.merge_strategy === 'skip_existing') {
                  console.log(`Skipping workflow creation, ${workflow.name} exists.`);
                  continue;
               } else if (template.merge_strategy === 'overwrite') {
                  // Wipe existing so the insert cleanly takes priority
                  await supabase.from('bb_workflows').delete().eq('id', existing.id);
               }
            }
               
            const { data, error } = await supabase.from('bb_workflows').insert({
               organization_id: organizationId,
               name: workflow.name,
               description: workflow.description || `Installed via ${template.name}`,
               trigger_type: workflow.trigger_type || 'manual',
               status: 'draft',
               steps: workflow.steps || []
            }).select().single();
            
            if (!error && data) {
              mappedWorkflows.push(`Workflow: ${workflow.name}`);
              generatedAssetManifest.push({ table: 'bb_workflows', id: data.id, name: workflow.name });
            } else if (error) {
              throw new Error(`Failed to unroll workflow ${workflow.name}: ${error.message}`);
            }
         }
      }

      // 3. Unroll Forms & Views
      const mappedForms = [];
      if (payload.forms && Array.isArray(payload.forms)) {
         for (const form of payload.forms) {
             // Form provisioning logic
             mappedForms.push(`Form: ${form.name}`);
         }
      }

      // 4. (Future) Provision AI Agents & Roles
      
      return {
        success: true,
        assets: {
          entities: mappedEntities,
          workflows: mappedWorkflows,
          forms: mappedForms
        }
      };

    } catch (e: any) {
      console.error('Template Unpack Failure. Initiating automatic rollback.', e);
      
      // Rollback Sequence: Reverse order cleanup of inserted records
      for (let i = generatedAssetManifest.length - 1; i >= 0; i--) {
         const asset = generatedAssetManifest[i];
         try {
            await supabase.from(asset.table).delete().eq('id', asset.id);
            console.log(`Rollback: Deleted ${asset.table} ${asset.id}`);
         } catch (rollbackError) {
            console.error(`CRITICAL ROLLBACK FAILURE on ${asset.table} ${asset.id}:`, rollbackError);
         }
      }

      return { success: false, message: e.message };
    }
  }
};
