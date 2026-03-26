import { supabase } from '../../supabase';
import { globalTasksService } from '../../db/globalTasks';
import { projectsService } from '../../db/projects';
import { AIProviderFactory } from '../providers';
import { AgentRegistry, AgentPayload } from './AgentRegistry';

export interface ExtractedBuildTask {
    title: string;
    description: string;
    task_category: 'create_task' | 'create_workflow' | 'setup_dashboard' | 'prepare_integration' | 'antigravity_build';
    antigravity_prompt?: string;
    priority: number;
    is_platform_feature: boolean;
}

export const BuildOrchestratorAgent = {
    
    /**
     * Parses the raw Onboarding Telemetry and structurally breaks it out into distinct Build Tasks natively through AgentRegistry.
     */
    async extractTasksFromSession(sessionId: string, organizationId: string, fullContext: string) {
        const payload: AgentPayload = {
            intent: "Extract Architectural Build Tasks",
            context: { sessionId, fullContext },
            organizationId
        };

        return AgentRegistry.execute<{tasks: ExtractedBuildTask[]}>('BuildOrchestratorAgent', payload, async () => {
            const extractionPrompt = `
You are the Bridgebox Auto-Build Architect.
Read this context: ${fullContext}

You must extract EXACTLY the structural objects needed to build this company's OS.
Return ONLY a raw JSON object containing a "tasks" array.
Each object in the array MUST have these exact keys:
- title: string
- description: string
- task_category: must be one of: "create_task", "create_workflow", "setup_dashboard", "prepare_integration", "antigravity_build"
- antigravity_prompt: string (only required if category is antigravity_build)
- priority: 1 (High) to 3 (Low)
- is_platform_feature: boolean (false for tenant-specific, true for global structural deployments)

Create at least 1 "create_workflow" project, at least 2 "create_task", and detect any integrations.
            `.trim();

            const provider = AIProviderFactory.getProvider();
            if (!provider.isConfigured()) throw new Error("AI provider is not actively configured.");

            const response = await provider.complete({
                messages: [
                    { role: 'system', content: 'You are an expert autonomous software integration engine. You must output exclusively in valid JSON object format containing a "tasks" array.' },
                    { role: 'user', content: extractionPrompt }
                ],
                temperature: 0.1,
                maxTokens: 2000,
                ...({ responseFormat: "json_object" } as any)
            });

            if (!response.content) throw new Error("AI failed to return any text content during extraction.");

            let rawOutput = response.content.trim();
            rawOutput = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedBlob = JSON.parse(rawOutput);
            const extractedTasks: ExtractedBuildTask[] = Array.isArray(parsedBlob) ? parsedBlob : (parsedBlob.tasks || []);

            // Persist into DB Queue natively
            for (const task of extractedTasks) {
                const { error: insertError } = await supabase
                    .from('onboarding_build_tasks')
                    .insert({
                        organization_id: organizationId,
                        session_id: sessionId,
                        title: task.title || 'Extracted Task',
                        description: task.description || '',
                        task_category: task.task_category || 'create_task',
                        antigravity_prompt: task.antigravity_prompt || null,
                        priority: typeof task.priority === 'number' ? task.priority : 2,
                        is_platform_feature: String(task.is_platform_feature) === 'true',
                        status: 'pending'
                    });
                if (insertError) throw insertError;
            }

            return { tasks: extractedTasks };
        });
    },

    /**
     * Executes the queued tasks physically creating the target application state independently from LLMs.
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
                             description: `Complex software engineering required natively.\n\nSystem Prompt Target:\n${task.antigravity_prompt || 'No Prompt Provided'}`,
                             priority: 'high',
                             status: 'todo',
                             assignee_id: userId
                         });
                     }
                     await supabase.from('onboarding_build_tasks').update({ status: 'completed' }).eq('id', task.id);
                 } catch (execError) {
                     console.error(`Execution failed for task: ${task.id}`, execError);
                     await supabase.from('onboarding_build_tasks').update({ status: 'rejected' }).eq('id', task.id);
                 }
            }
        } catch (err) {
            console.error("Failed executing Build Queue", err);
            throw err;
        }
    }
};
