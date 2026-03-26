import { supabase } from '../../supabase';
import { globalTasksService } from '../../db/globalTasks';
import { projectsService } from '../../db/projects';
import { AIProviderFactory } from '../providers';
import { AgentRegistry, AgentPayload } from './AgentRegistry';
import { calculatePricing, savePricingModel, type PricingInputs } from '../../billing/pricingEngine';
import { logTokenUsage } from '../tokenTracker';

export interface ExtractedBuildTask {
    title: string;
    description: string;
    task_category: 'create_task' | 'create_workflow' | 'setup_dashboard' | 'prepare_integration' | 'antigravity_build';
    antigravity_prompt?: string;
    priority: number;
    is_platform_feature: boolean;
    cost_impact?: string;
    efficiency_rating?: 'low' | 'medium' | 'high';
}

export interface ExtractedPricingInputs {
    estimatedQueriesPerDay: number;
    documentProcessingVolume: number;
    workflowExecutionFrequency: 'low' | 'medium' | 'high' | 'enterprise';
    aiCopilotUsage: boolean;
    aiSearchUsage: boolean;
    aiGenerationUsage: boolean;
    integrationCount: number;
    integrationComplexity: 'simple' | 'moderate' | 'deep';
    integrationSyncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    workflowCount: number;
    automationDepth: 'basic' | 'moderate' | 'advanced' | 'fully_automated';
    userCount: number;
    concurrencyLevel: 'low' | 'medium' | 'high';
    estimatedStorageGb: number;
    customFeatureCount: number;
    supportAgentUsage: 'basic' | 'standard' | 'advanced' | 'enterprise';
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

        return AgentRegistry.execute<{tasks: ExtractedBuildTask[]; pricingModelId?: string}>('BuildOrchestratorAgent', payload, async () => {
            const extractionPrompt = `
You are the Bridgebox Auto-Build Architect AND Pricing Intelligence Engine.
Read this context: ${fullContext}

You must output a raw JSON object with TWO keys: "tasks" and "pricing".

--- TASKS ---
Extract the structural objects needed to build this company's OS.
Each task object MUST have:
- title: string
- description: string
- task_category: "create_task" | "create_workflow" | "setup_dashboard" | "prepare_integration" | "antigravity_build"
- antigravity_prompt: string (only if category is antigravity_build)
- priority: 1 (High) to 3 (Low)
- is_platform_feature: boolean
- cost_impact: "low" | "medium" | "high" (estimated cost impact of implementing this task)
- efficiency_rating: "low" | "medium" | "high" (how efficient/token-optimized this can be built)

Create at least 1 "create_workflow", at least 2 "create_task", and detect any integrations.

--- PRICING ---
Based on the business description, estimate AI usage parameters. Return a "pricing" key with:
- estimatedQueriesPerDay: number (AI queries this company will make per day)
- documentProcessingVolume: number (documents processed per month)
- workflowExecutionFrequency: "low" | "medium" | "high" | "enterprise"
- aiCopilotUsage: boolean
- aiSearchUsage: boolean
- aiGenerationUsage: boolean
- integrationCount: number
- integrationComplexity: "simple" | "moderate" | "deep"
- integrationSyncFrequency: "realtime" | "hourly" | "daily" | "weekly"
- workflowCount: number
- automationDepth: "basic" | "moderate" | "advanced" | "fully_automated"
- userCount: number (estimated team size)
- concurrencyLevel: "low" | "medium" | "high"
- estimatedStorageGb: number
- customFeatureCount: number (how many custom-built modules are needed)
- supportAgentUsage: "basic" | "standard" | "advanced" | "enterprise"
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
            const extractedPricing: ExtractedPricingInputs | null = parsedBlob.pricing || null;

            // Log the token usage from this AI call
            if (response.usage) {
                await logTokenUsage({
                    organizationId,
                    featureContext: 'onboarding',
                    agentName: 'BuildOrchestratorAgent',
                    promptTokens: response.usage.inputTokens,
                    completionTokens: response.usage.outputTokens,
                    aiModel: response.model,
                    aiProvider: 'auto',
                });
            }

            // Persist into DB Queue natively
            for (const task of extractedTasks) {
                const { error: insertError } = await supabase
                    .from('bb_onboarding_build_tasks')
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

            // Generate and persist pricing model
            let pricingModelId: string | undefined;
            if (extractedPricing) {
                try {
                    const fullPricingInputs: PricingInputs = {
                        organizationId,
                        sessionId,
                        ...extractedPricing,
                    };
                    const breakdown = calculatePricing(fullPricingInputs);
                    pricingModelId = await savePricingModel(fullPricingInputs, breakdown);

                    // Persist snapshot into onboarding session
                    await supabase
                        .from('bb_onboarding_sessions')
                        .update({ ai_intelligence: { pricing_model_id: pricingModelId, pricing_inputs: extractedPricing } })
                        .eq('id', sessionId);
                } catch (pricingErr) {
                    console.warn('[BuildOrchestrator] Pricing model generation failed (non-fatal):', pricingErr);
                }
            }

            return { tasks: extractedTasks, pricingModelId };
        });
    },

    /**
     * Executes the queued tasks physically creating the target application state independently from LLMs.
     */
    async executeBuildQueue(sessionId: string, organizationId: string, userId: string, projectId?: string): Promise<void> {
        try {
            const { data: queuedTasks, error } = await supabase
                .from('bb_onboarding_build_tasks')
                .select('*')
                .eq('session_id', sessionId)
                .eq('status', 'pending')
                .order('priority', { ascending: true });

            if (error || !queuedTasks) throw error;

            for (const task of queuedTasks) {
                 await supabase.from('bb_onboarding_build_tasks').update({ status: 'in_progress' }).eq('id', task.id);

                 try {
                     let createdTask: any = null;
                     if (task.task_category === 'create_task') {
                         createdTask = await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: task.title,
                             description: task.description,
                             priority: task.priority === 1 ? 'high' : task.priority === 2 ? 'medium' : 'low',
                             status: 'todo',
                             assignee_id: userId
                         });
                     } 
                     else if (task.task_category === 'create_workflow') {
                         const targetProject = await projectsService.createProject({
                             organization_id: organizationId,
                             name: task.title,
                             description: task.description,
                             type: 'internal_ops',
                             status: 'planning'
                         });
                         if (targetProject && projectId) {
                             await supabase.from('bb_entity_links').insert({
                                 tenant_id: organizationId,
                                 source_type: 'project',
                                 source_id: projectId,
                                 target_type: 'project',
                                 target_id: targetProject.id,
                                 relationship_type: 'blocks'
                             });
                         }
                     }
                     else if (task.task_category === 'prepare_integration') {
                         createdTask = await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: `[IT INTEGRATION] ${task.title}`,
                             description: `System detected external integration requirement: ${task.description}`,
                             priority: 'high',
                             status: 'todo',
                             assignee_id: userId
                         });
                     }
                     else if (task.task_category === 'setup_dashboard') {
                         createdTask = await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: `[DASHBOARD MAPPING] ${task.title}`,
                             description: `Configure Analytics views for this workspace natively: ${task.description}`,
                             priority: 'medium',
                             status: 'todo',
                             assignee_id: userId
                         });
                     }
                     else if (task.task_category === 'antigravity_build') {
                         createdTask = await globalTasksService.createTask({
                             tenant_id: organizationId,
                             title: `[ANTIGRAVITY EXECUTION] ${task.title}`,
                             description: `Complex software engineering required natively.\n\nSystem Prompt Target:\n${task.antigravity_prompt || 'No Prompt Provided'}`,
                             priority: 'high',
                             status: 'todo',
                             assignee_id: userId
                         });
                     }
                     
                     if (createdTask && projectId) {
                         await supabase.from('bb_entity_links').insert({
                             tenant_id: organizationId,
                             source_type: 'task',
                             source_id: createdTask.id,
                             target_type: 'project',
                             target_id: projectId,
                             relationship_type: 'attached_to'
                         });
                     }

                     await supabase.from('bb_onboarding_build_tasks').update({ status: 'completed' }).eq('id', task.id);
                 } catch (execError) {
                     console.error(`Execution failed for task: ${task.id}`, execError);
                     await supabase.from('bb_onboarding_build_tasks').update({ status: 'rejected' }).eq('id', task.id);
                 }
            }
        } catch (err) {
            console.error("Failed executing Build Queue", err);
            throw err;
        }
    }
};
