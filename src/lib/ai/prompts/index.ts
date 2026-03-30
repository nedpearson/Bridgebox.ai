import type { AIMessage } from "../types";

export const systemPrompts = {
  businessAnalyst: `You are an expert business analyst for Bridgebox, a software development agency.
Your role is to analyze business data, identify opportunities and risks, and provide actionable recommendations.
You have deep expertise in software development services, client relationship management, and business operations.
Always provide structured, data-driven insights with clear reasoning.`,

  salesAssistant: `You are a sales strategy assistant for Bridgebox, a software development agency.
Your role is to analyze leads, assess conversion potential, and recommend optimal sales strategies.
You understand software development services, client needs, and effective sales processes.
Provide practical, actionable recommendations that help close deals.`,

  projectAdvisor: `You are a project management advisor for Bridgebox.
Your role is to analyze project health, identify risks, and recommend actions to ensure successful delivery.
You have expertise in software development methodologies, risk management, and client communication.
Provide clear, actionable guidance for project teams.`,

  supportSpecialist: `You are a technical support specialist for Bridgebox.
Your role is to analyze support tickets, classify issues, and recommend resolution strategies.
You understand software systems, common technical issues, and customer service best practices.
Provide efficient, accurate support guidance.`,
};

export class PromptBuilder {
  static summarizeLead(leadData: any): AIMessage[] {
    return [
      {
        role: "system",
        content: systemPrompts.salesAssistant,
      },
      {
        role: "user",
        content: `Analyze this lead and provide a structured summary in JSON format:

Lead Information:
- Name: ${leadData.name}
- Company: ${leadData.company || "Not provided"}
- Email: ${leadData.email}
- Status: ${leadData.status}
- Service Type: ${leadData.lead_type}
- Budget: ${leadData.budget || "Not specified"}
- Timeline: ${leadData.timeline || "Not specified"}
- Description: ${leadData.project_description || "No description provided"}

Respond with JSON only:
{
  "overview": "Brief 2-3 sentence summary of the lead",
  "keyNeeds": ["Need 1", "Need 2", "Need 3"],
  "suggestedServices": ["service1", "service2"],
  "estimatedValue": "Value range or assessment",
  "nextActions": ["Action 1", "Action 2"],
  "priority": "urgent|high|medium|low",
  "confidence": 0.0-1.0
}`,
      },
    ];
  }

  static summarizeProject(projectData: any): AIMessage[] {
    return [
      {
        role: "system",
        content: systemPrompts.projectAdvisor,
      },
      {
        role: "user",
        content: `Analyze this project and provide a structured summary in JSON format:

Project Information:
- Name: ${projectData.name}
- Status: ${projectData.status}
- Start Date: ${projectData.start_date || "Not set"}
- Target End: ${projectData.target_end_date || "Not set"}
- Description: ${projectData.description || "No description"}
- Budget: ${projectData.budget || "Not specified"}

Respond with JSON only:
{
  "status": "Brief status assessment",
  "progress": "Progress summary",
  "keyMilestones": ["Milestone 1", "Milestone 2"],
  "risks": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "healthScore": 0.0-1.0
}`,
      },
    ];
  }

  static summarizeTicket(ticketData: any): AIMessage[] {
    return [
      {
        role: "system",
        content: systemPrompts.supportSpecialist,
      },
      {
        role: "user",
        content: `Analyze this support ticket and provide a structured summary in JSON format:

Ticket Information:
- Title: ${ticketData.title}
- Description: ${ticketData.description}
- Category: ${ticketData.category || "Not categorized"}
- Priority: ${ticketData.priority || "Not set"}
- Status: ${ticketData.status}

Respond with JSON only:
{
  "issue": "Clear description of the issue",
  "severity": "critical|high|medium|low",
  "category": "Category classification",
  "suggestedResolution": "Resolution approach",
  "estimatedTime": "Time estimate",
  "escalationNeeded": true|false
}`,
      },
    ];
  }

  static generateBusinessInsights(metricsData: any): AIMessage[] {
    return [
      {
        role: "system",
        content:
          systemPrompts.businessAnalyst +
          "\\nCRITICAL: You MUST ONLY return a raw JSON object. Never include conversational text. Even if all metrics are 0, invent reasonable placeholder insights or provide a valid JSON skeleton acknowledging the lack of data.",
      },
      {
        role: "user",
        content: `Analyze these business metrics and provide strategic insights in JSON format:

Metrics Summary:
- Total Leads: ${metricsData.totalLeads}
- Conversion Rate: ${metricsData.conversionRate}%
- Active Projects: ${metricsData.activeProjects}
- Revenue (30d): $${metricsData.revenue}
- Client Count: ${metricsData.clientCount}

Respond with JSON only:
{
  "summary": "Brief executive summary",
  "opportunities": [
    {
      "title": "Opportunity title",
      "description": "Description",
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ],
  "risks": [
    {
      "title": "Risk title",
      "description": "Description",
      "severity": "high|medium|low",
      "mitigation": "Mitigation strategy"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
      },
    ];
  }

  static recommendActions(contextData: any): AIMessage[] {
    return [
      {
        role: "system",
        content: systemPrompts.businessAnalyst,
      },
      {
        role: "user",
        content: `Based on this business context, recommend the top priority actions in JSON format:

Context:
${JSON.stringify(contextData, null, 2)}

Respond with JSON array only:
[
  {
    "action": "Specific action to take",
    "priority": "critical|high|medium|low",
    "reasoning": "Why this action is important",
    "expectedOutcome": "Expected result",
    "effort": "quick|medium|complex"
  }
]`,
      },
    ];
  }

  static draftProposal(proposalData: any): AIMessage[] {
    return [
      {
        role: "system",
        content: systemPrompts.salesAssistant,
      },
      {
        role: "user",
        content: `Create a proposal draft based on this information in JSON format:

Lead Information:
- Company: ${proposalData.company}
- Service: ${proposalData.serviceType}
- Budget: ${proposalData.budget || "To be discussed"}
- Timeline: ${proposalData.timeline || "Flexible"}
- Requirements: ${proposalData.requirements || "Standard service delivery"}

Respond with JSON only:
{
  "executiveSummary": "Compelling 2-3 sentence summary",
  "scopeHighlights": ["Scope item 1", "Scope item 2"],
  "valueProposition": "Why choose us statement",
  "recommendedApproach": "High-level approach",
  "estimatedTimeline": "Timeline estimate"
}`,
      },
    ];
  }

  static detectPriority(itemData: any): AIMessage[] {
    return [
      {
        role: "system",
        content: systemPrompts.businessAnalyst,
      },
      {
        role: "user",
        content: `Analyze this item and determine its priority level in JSON format:

Item Data:
${JSON.stringify(itemData, null, 2)}

Respond with JSON only:
{
  "priority": "critical|high|medium|low",
  "category": "Category classification",
  "reasoning": "Brief explanation",
  "confidence": 0.0-1.0
}`,
      },
    ];
  }

  static classifyRequest(requestData: any): AIMessage[] {
    return [
      {
        role: "system",
        content: systemPrompts.businessAnalyst,
      },
      {
        role: "user",
        content: `Classify this request and provide structured analysis in JSON format:

Request:
${JSON.stringify(requestData, null, 2)}

Respond with JSON only:
{
  "category": "Primary category",
  "subcategory": "Specific subcategory",
  "urgency": "urgent|high|medium|low",
  "complexity": "complex|medium|simple",
  "suggestedAssignment": "Team or role",
  "confidence": 0.0-1.0
}`,
      },
    ];
  }
}
