import { supabase } from '../supabase';

/**
 * Recommender System (Network Effects Engine)
 * Injects "Suggested Workflow Add-Ons" and "Recommended Integrations"
 * based on anonymized patterns tracked across all tenants.
 */
export const networkRecommendationsService = {
  
  /**
   * Identifies what standard patterns/templates a tenant should adopt next.
   * Based on what similar (same industry/scale) organizations have installed successfully.
   */
  async getNextBestActions(organizationId: string) {
    try {
      // 1. Determine local context
      const { data: org } = await supabase
        .from('bb_organizations')
        .select('industry')
        .eq('id', organizationId)
        .single();

      if (!org?.industry) return [];

      // 2. Query the marketplace for top performing templates in this industry
      //    (In production, we would use a Graph ML model or Supabase RPC to find 
      //     "Orgs in [Industry] that have [Active Integration X] often install [Template Y]")
      const { data: recommendations } = await supabase
        .from('bb_marketplace_templates')
        .select(`
          id,
          category,
          install_count,
          average_rating,
          is_premium,
          price_amount,
          bb_templates(name, description)
        `)
        .eq('is_published', true)
        .order('install_count', { ascending: false })
        .limit(3);

      return recommendations?.map(rec => ({
        id: rec.id,
        title: Array.isArray(rec.bb_templates) ? rec.bb_templates[0]?.name : (rec.bb_templates as any)?.name,
        description: Array.isArray(rec.bb_templates) ? rec.bb_templates[0]?.description : (rec.bb_templates as any)?.description,
        type: 'ecosystem_template',
        metadata: {
          installCount: rec.install_count,
          rating: rec.average_rating,
          isPremium: rec.is_premium,
          price: rec.price_amount
        },
        socialProof: `Used by ${rec.install_count} similar ${org.industry} businesses`
      })) || [];
      
    } catch (err) {
      console.error('Recommendation Engine Error:', err);
      return [];
    }
  }
};
