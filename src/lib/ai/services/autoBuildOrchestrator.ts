import { supabase } from '../../supabase';
import { copilotEngine } from './copilotEngine';
import { globalTasksService } from '../../db/globalTasks';
import { projectsService } from '../../db/projects';

export interface ExtractedBuildTask {
    title: string;
    description: string;
    task_category: 'create_task' | 'create_workflow' | 'setup_dashboard' | 'prepare_integration' | 'antigravity_build';
    antigravity_prompt?: string;
    priority: number;
    is_platform_feature: boolean;
}

export const autoBuildOrchestrator = {
    
    /**
     * Parses the raw Onboarding Telemetry and structurally breaks it out into distinct Build Tasks.
     */
    async extractTasksFromSession(sessionId: string, organizationId: string, fullContext: string): Promise<void> {
        // Securely invoke Copilot to extract structured tasks
        const extractionPrompt = `
You are the Bridgebox Auto-Build Architect.
Read this context: ${fullContext}

You must extract EXACTLY the structural objects needed to build this company's OS.
Return a RAW JSON ARRAY (no markdown, no pleasantries) containing objects with these exact keys:
- title: string
- description: string
- task_category: must be one of: "create_task", "create_workflow", "setup_dashboard", "prepare_integration", "antigravity_build"
- antigravity_prompt: string (only required if category is antigravity_build)
- priority: 1 (High) to 3 (Low)
- is_platform_feature: boolean (false for tenant-specific, true for global structural deployments)

Create at least 1 "create_workflow" project, at least 2 "create_task", and detect any integrations.
        `.trim();

        try {
            const result = await copilotEngine.generateReasonedResponse(
                extractionPrompt,
                { role: 'admin', organizationId: null, userId: 'system' },
                { activeModule: 'build_orchestrator' }
            );

            // Strip any markdown blocks safely 
            let jsonString = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
            const extractedTasks: ExtractedBuildTask[] = JSON.parse(jsonString);

            // Persist into DB Queue
            for (const task of extractedTasks) {
                await supabase
                    .from('onboarding_build_tasks')
                    .insert({
                        organization_id: organizationId,
                        session_id: sessionId,
                        title: task.title,
                        description: task.description,
                        task_category: task.task_category,
                        antigravity_prompt: task.antigravity_prompt || null,
                        priority: task.priority,
                        is_platform_feature: task.is_platform_feature,
                        status: 'pending'
                    });
            }

        } catch (e) {
            console.error("Auto-Build Telemetry Extraction Failed", e);
        }
    },

    /**
     * Executes the queued tasks physically creating the target application state.
     */
    async executeBuildQueue(sessionId: string, organizationId: string, userId: string): Promise<void> {
        try {
            const { data: queuedTasks, error } = await supabase
                .from('onboarding_build_tasks')
                .select('*')
                .eq('session_id', sessionId)
                .eq('status', 'pending')
                .order('priority', { ascending: true });

            if (error || !queuedTasks) throw error;

            for (const task of queuedTasks) {
                 // Mark In Progress
                 await supabase.from('onboarding_build_tasks').update({ status: 'in_progress' }).eq('id', task.id);

                 try {
                     if (task.task_category === 'create_task') {
                         await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: task.title,
                             description: task.description,
                             priority: task.priority === 1 ? 'high' : task.priority === 2 ? 'medium' : 'low',
                             status: 'todo',
                             assignee_id: userId
                         });
                     } 
                     else if (task.task_category === 'create_workflow') {
                         await projectsService.createProject({
                             organization_id: organizationId,
                             name: task.title,
                             description: task.description,
                             type: 'internal_ops',
                             status: 'planning'
                         });
                     }
                     else if (task.task_category === 'prepare_integration') {
                         await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: `[IT INTEGRATION] ${task.title}`,
                             description: `System detected external integration requirement: ${task.description}`,
                             priority: 'high',
                             status: 'todo',
                             assignee_id: userId
                         });
                     }
                     else if (task.task_category === 'setup_dashboard') {
                         await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: `[DASHBOARD MAPPING] ${task.title}`,
                             description: `Configure Analytics views for this workspace natively: ${task.description}`,
                             priority: 'medium',
                             status: 'todo',
                             assignee_id: userId
                         });
                     }
                     else if (task.task_category === 'antigravity_build') {
                         await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: `[ANTIGRAVITY EXECUTION] ${task.title}`,
                             description: `Complex software engineering required natively.
                             
System Prompt Target:
${task.antigravity_prompt || 'No Prompt Provided'}`,
                             priority: 'high',
                             status: 'todo',
                             assignee_id: userId
                         });
                     }

                     // Mark Complete
                     await supabase.from('onboarding_build_tasks').update({ status: 'completed' }).eq('id', task.id);
                 } catch (execError) {
                     console.error(`Execution failed for task: ${task.id}`, execError);
                     await supabase.from('onboarding_build_tasks').update({ status: 'rejected' }).eq('id', task.id);
                 }
            }

        } catch (err) {
            console.error("Failed executing Build Queue", err);
        }
    }
};
