import type { AIProviderClient, AIRequest, AIResponse } from '../types';

export class MockProvider implements AIProviderClient {
  provider = 'mock' as const;

  isConfigured(): boolean {
    return true;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const lastMessage = request.messages[request.messages.length - 1];
    const content = this.generateMockResponse(lastMessage.content);

    return {
      content,
      model: 'mock',
      usage: {
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
      },
      finishReason: 'complete',
    };
  }

  private generateMockResponse(prompt: string): string {
    if (prompt.includes('summarize') && prompt.includes('lead')) {
      return JSON.stringify({
        overview: 'This lead represents a mid-sized company looking to modernize their legacy systems with a focus on cloud infrastructure and automation.',
        keyNeeds: [
          'Cloud migration strategy',
          'Process automation',
          'Legacy system modernization',
        ],
        suggestedServices: ['custom_software', 'system_integration'],
        estimatedValue: '$75,000 - $150,000',
        nextActions: [
          'Schedule discovery call to understand current infrastructure',
          'Prepare cloud migration assessment',
          'Create preliminary proposal for review',
        ],
        priority: 'high',
        confidence: 0.85,
      });
    }

    if (prompt.includes('summarize') && prompt.includes('project')) {
      return JSON.stringify({
        status: 'On track with minor concerns',
        progress: 'Project is 65% complete with 2 of 4 major milestones achieved. Current sprint is focused on API integration.',
        keyMilestones: [
          'Requirements gathering - Completed',
          'Core platform development - In Progress',
          'Integration testing - Upcoming',
          'Deployment - Scheduled',
        ],
        risks: [
          'Third-party API documentation is incomplete',
          'Client stakeholder availability has been inconsistent',
        ],
        recommendations: [
          'Schedule technical sync with third-party vendor',
          'Establish weekly client checkpoint meetings',
          'Consider adding buffer time for integration phase',
        ],
        healthScore: 0.75,
      });
    }

    if (prompt.includes('summarize') && prompt.includes('ticket')) {
      return JSON.stringify({
        issue: 'User authentication system experiencing intermittent timeout errors during peak hours',
        severity: 'high',
        category: 'technical',
        suggestedResolution: 'Increase connection pool size and implement request queuing to handle peak load',
        estimatedTime: '2-4 hours',
        escalationNeeded: false,
      });
    }

    if (prompt.includes('business insights')) {
      return JSON.stringify({
        summary: 'Strong growth in custom software and system integration services. Client retention is excellent but lead conversion could be improved.',
        opportunities: [
          {
            title: 'Expand Custom Software Services',
            description: 'High demand and 80% conversion rate indicates market fit',
            impact: 'high',
            effort: 'medium',
          },
          {
            title: 'Healthcare Vertical Focus',
            description: 'Growing interest from healthcare sector with premium pricing potential',
            impact: 'high',
            effort: 'medium',
          },
        ],
        risks: [
          {
            title: 'Lead Response Time',
            description: 'Average response time of 24+ hours may be losing opportunities',
            severity: 'medium',
            mitigation: 'Implement automated lead qualification and faster initial response',
          },
        ],
        recommendations: [
          'Develop healthcare-specific case studies and materials',
          'Implement lead routing automation',
          'Consider hiring additional sales development resources',
        ],
      });
    }

    if (prompt.includes('recommend') && prompt.includes('action')) {
      return JSON.stringify([
        {
          action: 'Follow up with high-value leads from last week',
          priority: 'high',
          reasoning: '3 leads valued over $100K have not been contacted in 5+ days',
          expectedOutcome: 'Move leads to qualification stage and schedule discovery calls',
          effort: 'quick',
        },
        {
          action: 'Review project timeline for Acme Corp implementation',
          priority: 'medium',
          reasoning: 'Project approaching milestone deadline with 15% remaining work',
          expectedOutcome: 'Identify if timeline adjustment is needed',
          effort: 'quick',
        },
      ]);
    }

    if (prompt.includes('proposal')) {
      return JSON.stringify({
        executiveSummary: 'This proposal outlines a comprehensive solution to modernize your legacy systems, improve operational efficiency, and enable data-driven decision making through cloud infrastructure and automation.',
        scopeHighlights: [
          'Assessment and planning of current infrastructure',
          'Cloud migration strategy and implementation',
          'Process automation for key workflows',
          'Staff training and documentation',
        ],
        valueProposition: 'By modernizing your systems, you will reduce operational costs by approximately 30%, improve system reliability, and enable your team to focus on strategic initiatives rather than maintenance.',
        recommendedApproach: 'Phased implementation over 4 months starting with infrastructure assessment, followed by pilot migration, full rollout, and optimization phase.',
        estimatedTimeline: '16-20 weeks from contract signing to full deployment',
      });
    }

    if (prompt.includes('priority') || prompt.includes('classify')) {
      return JSON.stringify({
        priority: 'high',
        category: 'technical_support',
        reasoning: 'Issue affects multiple users and impacts core functionality',
        confidence: 0.88,
      });
    }

    return 'This is a mock AI response. Configure a real AI provider (Anthropic or OpenAI) for production use.';
  }
}
