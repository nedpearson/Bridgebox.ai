import { AIProviderFactory } from '../providers';
import { supabase } from '../../supabase';
import { AgentRegistry, AgentPayload } from './AgentRegistry';

export const SupportDiagnosticAgent = {
  /**
   * Called autonomously when GlobalErrorBoundary catches a fatal rendering crash.
   * Feeds the stack trace to the LLM and instantly generates an actionable DevTask Ticket
   * preventing the need for manual bug triage.
   */
  async triageCrash(errorName: string, errorMessage: string, stackTrace: string, userId?: string) {
    const payload: AgentPayload = {
        intent: "Autonomous Error Diagnostics",
        context: { errorName, errorMessage, stackTrace, userId }
    };

    return AgentRegistry.execute<{title: string, description: string, complexity: string, files_affected: string[]}>('SupportDiagnosticAgent', payload, async () => {
      // 1. Physically log the fault to telemetry
      const { data: logRow, error: logError } = await supabase
        .from('internal_logs')
        .insert([{
          severity: 'critical',
          type: 'ReactErrorBoundary Crash',
          module: 'Client Runtime',
          message: `${errorName}: ${errorMessage}\n\n${stackTrace}`,
          metadata: { userId, unhandled_crash: true }
        }])
        .select()
        .single();

      if (logError) throw logError;

      // 2. Extract actionable task via AI
      const provider = AIProviderFactory.getProvider();
      if (!provider.isConfigured()) throw new Error("AI provider missing");

      const prompt = `
A critical React application crash just occurred.
Error Name: ${errorName}
Message: ${errorMessage}

Stack Trace:
${stackTrace}

As a Senior Staff Typescript Engineer, analyze this fault and determine exactly what file and lines are crashing.
Output ONLY a raw JSON strictly adhering to this schema:
{
  "title": "[AI Diagnosed] Fix Runtime Crash: <short description>",
  "description": "A detailed explanation of *why* it crashed, and exactly *what* code changes to make to fix it.",
  "complexity": "low|medium|high",
  "files_affected": ["src/components/...", "src/pages/..."]
}
      `.trim();

      const response = await provider.complete({
        messages: [
          { role: 'system', content: 'You are an autonomous Diagnostic Architect. You parse raw unhandled exception stack traces and generate precise software bugfix tickets in strict JSON format.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        maxTokens: 1000,
        ...({ responseFormat: "json_object" } as any)
      });

      if (!response.content) throw new Error("Empty AI Response");

      const parsed = JSON.parse(response.content.trim());

      // 3. Inject the explicit Fix directly into the DevTask Board for the Dev Team
      await supabase.from('internal_dev_tasks').insert([{
        title: parsed.title,
        description: parsed.description,
        status: 'todo',
        priority: 'high',
        category: 'bug',
        labels: ['ai_diagnosed', 'crash_report', ...(parsed.files_affected || [])]
      }]);

      return parsed;
    });
  }
};
