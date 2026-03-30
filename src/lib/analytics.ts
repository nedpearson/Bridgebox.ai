/**
 * Phase 10: Enterprise Non-Blocking Analytics & Event Tracking Engine
 * Tracks GA4 Pageviews, Global Click CTAs, and Scroll Depths natively without blocking critical CSS/JS rendering paths.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const initAnalytics = (gaId: string = "G-BBXENTERPRISE") => {
  if (typeof window === 'undefined') return;

  // 1. Inject GA4 Non-blocking Script Asynchronously
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}', { send_page_view: false }); // Handled by React Router natively if needed
  `;
  document.head.appendChild(script2);

  // 2. Global Conversion & CTA Click Tracking (Delegated Event Pattern)
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const clickable = target.closest('a') || target.closest('button');
    
    if (clickable) {
      const ctaText = clickable.innerText?.trim().substring(0, 40) || 'Icon/Image Click';
      const ctaHref = clickable.getAttribute('href') || 'Button Action';
      
      // Emit strictly to GA4 DataLayer
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'click_cta', {
          event_category: 'engagement',
          event_label: ctaText,
          link_url: ctaHref
        });
      }
    }
  });

  // 3. Document Payload Scroll Depth Tracking (Passive)
  let maxScroll = 0;
  let milestones = { m25: false, m50: false, m75: false, m90: false };
  
  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) maxScroll = scrollPercent;

    const trackMilestone = (depth: number, key: keyof typeof milestones) => {
      if (maxScroll >= depth && !milestones[key]) {
        milestones[key] = true;
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: `Depth: ${depth}%`
          });
        }
      }
    };

    trackMilestone(25, 'm25');
    trackMilestone(50, 'm50');
    trackMilestone(75, 'm75');
    trackMilestone(90, 'm90');
  }, { passive: true });
};
