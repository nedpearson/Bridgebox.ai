import { useState, useEffect } from 'react';
import { Target, TrendingUp, Filter, Sparkles } from 'lucide-react';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { OpportunityScoreCard } from '../../components/opportunities/OpportunityScoreCard';
import { OpportunityLevelBadge } from '../../components/opportunities/OpportunityLevelBadge';
import { useAuth } from '../../contexts/AuthContext';
import { opportunityAnalyzer } from '../../lib/opportunities';
import type {
  ScoredOpportunity,
  HotOpportunitiesSummary,
  OpportunityLevel,
  OpportunityType,
} from '../../lib/opportunities/types';

export default function Opportunities() {
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<HotOpportunitiesSummary | null>(null);
  const [allOpportunities, setAllOpportunities] = useState<ScoredOpportunity[]>([]);
  const [filter, setFilter] = useState<{
    type?: OpportunityType;
    level?: OpportunityLevel;
  }>({});

  useEffect(() => {
    if (currentOrganization?.id) {
      loadOpportunities();
    }
  }, [currentOrganization?.id]);

  async function loadOpportunities() {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      const [summaryRes, rankedRes] = await Promise.all([
        opportunityAnalyzer.generateHotOpportunitiesSummary(currentOrganization.id),
        opportunityAnalyzer.getRankedOpportunities(currentOrganization.id),
      ]);

      if (summaryRes.summary) setSummary(summaryRes.summary);
      if (rankedRes.opportunities) setAllOpportunities(rankedRes.opportunities);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredOpportunities = allOpportunities.filter((opp) => {
    if (filter.type && opp.type !== filter.type) return false;
    if (filter.level && opp.opportunity_level !== filter.level) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Target className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Growth Opportunities</h1>
            <p className="text-gray-600">Identify where to focus next for strategic growth</p>
          </div>
        </div>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Opportunities</p>
                <Target className="text-blue-600" size={18} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{allOpportunities.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {allOpportunities.filter((o) => o.opportunity_level === 'high').length} high priority
              </p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Potential Revenue</p>
                <TrendingUp className="text-emerald-600" size={18} />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                ${(summary.total_potential_revenue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">From high opportunities</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Key Insights</p>
                <Sparkles className="text-purple-600" size={18} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.key_insights.length}</p>
              <p className="text-xs text-gray-500 mt-1">Strategic recommendations</p>
            </Card>
          </div>

          {summary.recommended_focus_areas.length > 0 && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Recommended Focus Areas</h3>
              <div className="space-y-3">
                {summary.recommended_focus_areas.map((area, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{area}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {summary.key_insights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Strategic Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {summary.key_insights.map((insight, index) => (
                  <Card key={index}>
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.priority === 'high'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {insight.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
                    {insight.action_items.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Action Items</p>
                        <ul className="space-y-1">
                          {insight.action_items.map((item, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {summary.top_industries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Industry Opportunities</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {summary.top_industries.map((opp) => (
                  <OpportunityScoreCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}

          {summary.top_services.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Service Opportunities</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {summary.top_services.map((opp) => (
                  <OpportunityScoreCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Opportunities</h2>
          <div className="flex items-center gap-2">
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as OpportunityType || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="industry">Industry</option>
              <option value="service">Service</option>
            </select>
            <select
              value={filter.level || ''}
              onChange={(e) => setFilter({ ...filter, level: e.target.value as OpportunityLevel || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <OpportunityScoreCard key={opp.id} opportunity={opp} />
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <Card>
            <p className="text-center text-gray-500 py-8">No opportunities match your filters</p>
          </Card>
        )}
      </div>
    </div>
  );
}
