# Bridgebox AI Integration Layer

## Overview

Bridgebox includes a production-ready AI integration layer that provides intelligent analysis, recommendations, and automation across the platform. The AI system is provider-agnostic, meaning you can use Anthropic Claude, OpenAI GPT, or run in mock mode without any AI provider.

## Architecture

### Clean Separation of Concerns

```
UI Components (Pages/Components)
        ↓
React Hooks (useAI, useLeadSummary, etc.)
        ↓
AI Service Layer (aiService)
        ↓
Prompt Templates (PromptBuilder)
        ↓
Provider Abstraction (AIProviderFactory)
        ↓
Provider Implementation (Anthropic/OpenAI/Mock)
```

### Key Principles

1. **Provider Agnostic**: Switch between AI providers without changing app code
2. **Graceful Degradation**: App works fully without AI configured
3. **No Vendor Lock-in**: Clean abstraction layer prevents dependency on specific APIs
4. **Production Ready**: Includes caching, error handling, retry logic, and loading states
5. **Type Safe**: Full TypeScript support throughout

## File Structure

```
src/lib/ai/
├── types.ts                    # Type definitions for AI system
├── providers/
│   ├── index.ts               # Provider factory and detection
│   ├── anthropic.ts           # Anthropic Claude integration
│   ├── openai.ts              # OpenAI GPT integration
│   └── mock.ts                # Mock provider for testing
├── prompts/
│   └── index.ts               # Prompt templates and system instructions
└── services/
    └── aiService.ts           # Main AI service with caching

src/hooks/
└── useAI.ts                   # React hooks for AI features

src/components/ai/
├── AIContent.tsx              # AI content display component
└── [other AI components]
```

## Configuration

### Environment Variables

Add one of these to your `.env` file:

```bash
# Option 1: Use Anthropic Claude (Recommended)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_AI_PROVIDER=anthropic

# Option 2: Use OpenAI GPT
VITE_OPENAI_API_KEY=sk-...
VITE_AI_PROVIDER=openai

# Option 3: Use Mock (No real AI, returns sample data)
VITE_AI_PROVIDER=mock
```

If no provider is configured, the system automatically uses mock mode.

### Auto-Detection

If you don't set `VITE_AI_PROVIDER`, the system automatically detects which provider to use based on available API keys:
1. Checks for Anthropic API key first
2. Falls back to OpenAI if available
3. Uses mock provider if neither is configured

## AI Capabilities

### 1. Lead Analysis

**What it does**: Analyzes leads to identify key needs, suggest services, estimate value, and recommend next actions.

**Where**: Lead detail pages (`/app/leads/:id`)

**Usage**:
```typescript
import { useLeadSummary } from '../hooks/useAI';

const { data, loading, error, summarize } = useLeadSummary();

// Generate summary
await summarize(leadData);

// Access results
console.log(data.overview);
console.log(data.keyNeeds);
console.log(data.suggestedServices);
console.log(data.nextActions);
```

### 2. Project Summaries

**What it does**: Provides project health assessments, identifies risks, and recommends actions.

**Where**: Project detail pages

**Usage**:
```typescript
import { useProjectSummary } from '../hooks/useAI';

const { data, loading, summarize } = useProjectSummary();
await summarize(projectData);
```

### 3. Support Ticket Analysis

**What it does**: Classifies tickets, assesses severity, suggests resolutions, and estimates resolution time.

**Where**: Support ticket pages

**Usage**:
```typescript
import { useTicketSummary } from '../hooks/useAI';

const { data, loading, summarize } = useTicketSummary();
await summarize(ticketData);
```

### 4. Business Insights

**What it does**: Analyzes business metrics to identify opportunities, risks, and strategic recommendations.

**Where**: Analytics dashboard (`/app/analytics`)

**Usage**:
```typescript
import { useBusinessInsights } from '../hooks/useAI';

const { data, loading, generate } = useBusinessInsights();
await generate(metricsData);
```

### 5. Action Recommendations

**What it does**: Provides prioritized action recommendations based on current business context.

**Usage**:
```typescript
import { useActionRecommendations } from '../hooks/useAI';

const { data, loading, recommend } = useActionRecommendations();
await recommend(contextData);
```

### 6. Proposal Drafts

**What it does**: Generates proposal summaries, value propositions, and timelines.

**Usage**:
```typescript
import { useProposalDraft } from '../hooks/useAI';

const { data, loading, draft } = useProposalDraft();
await draft(proposalData);
```

## Using AI in Components

### Basic Pattern

```tsx
import AIContent, { AIButton } from '../components/ai/AIContent';
import { useLeadSummary } from '../hooks/useAI';

function MyComponent({ lead }) {
  const ai = useLeadSummary();

  return (
    <div>
      {ai.isAvailable && (
        <AIButton onClick={() => ai.summarize(lead)}>
          Analyze with AI
        </AIButton>
      )}

      <AIContent
        loading={ai.loading}
        error={ai.error}
        isAIGenerated={ai.isAIGenerated}
        provider={ai.provider}
        onRetry={() => ai.summarize(lead, false)}
      >
        {ai.data && (
          <div>{ai.data.overview}</div>
        )}
      </AIContent>
    </div>
  );
}
```

### Caching

AI results are automatically cached for 5 minutes to:
- Reduce API costs
- Improve performance
- Provide instant results for repeated requests

Force fresh generation:
```typescript
await summarize(data, false); // Skip cache
```

## Provider Implementation Details

### Anthropic Claude

- Uses Claude 3.5 Sonnet by default
- Supports streaming (optional)
- Best for reasoning and analysis tasks
- API: `https://api.anthropic.com/v1`

### OpenAI GPT

- Uses GPT-4 Turbo by default
- Compatible with GPT-3.5 for cost optimization
- API: `https://api.openai.com/v1`

### Mock Provider

- Returns realistic sample data
- No API calls or costs
- Perfect for development and testing
- Simulates 500ms latency

## Error Handling

All AI operations include comprehensive error handling:

```typescript
{
  success: false,
  error: {
    code: 'API_ERROR',
    message: 'Descriptive error message',
    provider: 'anthropic',
    retryable: true
  }
}
```

Error types:
- `MISSING_API_KEY`: Provider not configured
- `API_ERROR`: API request failed
- `NETWORK_ERROR`: Network connectivity issue
- `INVALID_RESPONSE`: Malformed API response

## Cost Management

### Token Usage

All AI responses include usage statistics:
```typescript
{
  usage: {
    inputTokens: 120,
    outputTokens: 350,
    totalTokens: 470
  }
}
```

### Optimization Strategies

1. **Caching**: Results cached for 5 minutes by default
2. **Temperature**: Set to 0.3 for consistent, focused responses
3. **Max Tokens**: Limited to 2048 to control costs
4. **Lazy Loading**: AI only runs when user explicitly requests it

### Estimated Costs

Based on typical usage (with Anthropic Claude 3.5 Sonnet):

- Lead Summary: ~$0.01 per analysis
- Project Summary: ~$0.01 per analysis
- Business Insights: ~$0.02 per generation
- Support Ticket: ~$0.005 per ticket

With caching and typical usage patterns, expect $10-50/month for a moderate-sized agency.

## Security Considerations

1. **API Keys**: Stored in environment variables, never in code
2. **Client-Side**: All API calls made from browser (consider Edge Functions for production)
3. **Data Privacy**: Only business data is sent, no PII unless in lead/project descriptions
4. **Rate Limiting**: Implement rate limiting in production

## Future Enhancements

Planned features for AI system:

1. **Edge Function Integration**: Move AI calls server-side for better security
2. **Streaming Responses**: Real-time token streaming for better UX
3. **Fine-tuning**: Custom models trained on agency data
4. **Multi-step Workflows**: Complex AI workflows with tool use
5. **Voice Integration**: Voice-to-text for meeting notes and summaries
6. **Document Processing**: PDF/document analysis and extraction
7. **Image Analysis**: Screenshot analysis for design feedback

## Troubleshooting

### AI Not Available

Check:
1. Environment variable is set correctly
2. API key is valid
3. Network connectivity
4. Console for specific error messages

### Unexpected Results

- Try regenerating without cache
- Check that input data is complete
- Verify provider is responding correctly

### Performance Issues

- Check network latency
- Verify caching is working
- Consider using faster models (GPT-3.5, Claude Haiku)

## Testing

The mock provider is perfect for testing:

```typescript
// In your test setup
process.env.VITE_AI_PROVIDER = 'mock';

// Tests will use mock responses
const result = await aiService.summarizeLead(testLead);
expect(result.success).toBe(true);
```

## Migration Guide

If you're migrating from a hardcoded AI implementation:

1. Replace direct API calls with `aiService` methods
2. Update components to use `useAI` hooks
3. Replace custom loading/error states with `AIContent`
4. Remove provider-specific code
5. Test with mock provider first
6. Configure real provider and verify

## Support

For issues or questions about the AI integration:
1. Check this documentation
2. Review example implementations in codebase
3. Check provider-specific documentation
4. Review error messages and logs
