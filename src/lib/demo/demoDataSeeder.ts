import { supabase } from "../supabase";
import { Logger } from "../logger";

export const DemoDataSeeder = {
  /**
   * Generates extremely realistic, industry-optimized data for the ephemeral Demo Workspace.
   */
  async seedWorkspace(organizationId: string, industry: string) {
    Logger.info(
      `[DemoDataSeeder] Commencing isolated data injection for industry: ${industry}`,
    );

    try {
      // 1. Core Leads Pipeline
      const leadsPayload = this.buildLeads(organizationId, industry);
      if (leadsPayload.length > 0) {
        await supabase.from("bb_leads").insert(leadsPayload);
      }

      // 2. Clients Pipeline
      const clientsPayload = this.buildClients(organizationId, industry);
      if (clientsPayload.length > 0) {
        const { data: insertedClients } = await supabase
          .from("bb_clients")
          .insert(clientsPayload)
          .select("id, name");

        // 3. Projects tied to Clients
        if (insertedClients && insertedClients.length > 0) {
          const projectsPayload = this.buildProjects(
            organizationId,
            industry,
            insertedClients,
          );
          await supabase.from("bb_projects").insert(projectsPayload);
        }
      }

      Logger.info(
        `[DemoDataSeeder] Scaffold complete. Workspace successfully primed.`,
      );
      return { success: true };
    } catch (err: any) {
      Logger.error(`[DemoDataSeeder] Ingestion failure`, err);
      throw err;
    }
  },

  buildLeads(orgId: string, industry: string) {
    const templates: Record<string, any[]> = {
      legal: [
        {
          organization_id: orgId,
          title: "Smith Divorce Settlement",
          first_name: "John",
          last_name: "Smith",
          email: "jsmith@example.com",
          status: "new",
          value: 15000,
        },
        {
          organization_id: orgId,
          title: "Estate Planning - Davis",
          first_name: "Mary",
          last_name: "Davis",
          email: "maryd@example.com",
          status: "contacted",
          value: 4500,
        },
        {
          organization_id: orgId,
          title: "Corporate Formation - Tech LLC",
          first_name: "Alex",
          last_name: "Chen",
          email: "alex@techllc.example",
          status: "qualified",
          value: 8000,
        },
      ],
      accounting: [
        {
          organization_id: orgId,
          title: "Q3 Tax Preparation",
          first_name: "Robert",
          last_name: "Johnson",
          email: "robj@example.com",
          status: "new",
          value: 1200,
        },
        {
          organization_id: orgId,
          title: "Contractor Payroll Audit",
          first_name: "Sarah",
          last_name: "Williams",
          email: "swilliams@example.com",
          status: "proposal",
          value: 3500,
        },
      ],
      retail: [
        {
          organization_id: orgId,
          title: "Bulk Uniform Order",
          first_name: "David",
          last_name: "Brown",
          email: "dbrown@example.com",
          status: "contacted",
          value: 2400,
        },
        {
          organization_id: orgId,
          title: "Store Setup Consultation",
          first_name: "Emma",
          last_name: "Wilson",
          email: "emmaw@example.com",
          status: "negotiation",
          value: 5000,
        },
      ],
    };

    // Default fallback to legal if industry not mapped
    const fallback = templates[industry.toLowerCase()] || templates["legal"];
    return fallback.map((l) => ({
      ...l,
      created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }));
  },

  buildClients(orgId: string, industry: string) {
    const templates: Record<string, any[]> = {
      legal: [
        {
          organization_id: orgId,
          name: "Horizon Properties Corp",
          type: "company",
          email: "legal@horizon.example",
          status: "active",
        },
        {
          organization_id: orgId,
          name: "Michael Thompson",
          type: "individual",
          email: "mthompson@example.com",
          status: "active",
        },
      ],
      accounting: [
        {
          organization_id: orgId,
          name: "Summit Marketing LLC",
          type: "company",
          email: "finance@summit.example",
          status: "active",
        },
        {
          organization_id: orgId,
          name: "Jessica Taylor",
          type: "individual",
          email: "jtaylor@example.com",
          status: "active",
        },
      ],
      retail: [
        {
          organization_id: orgId,
          name: "Downtown Cafe",
          type: "company",
          email: "orders@downtowncafe.example",
          status: "active",
        },
      ],
    };

    const fallback = templates[industry.toLowerCase()] || templates["legal"];
    return fallback.map((c) => ({
      ...c,
      created_at: new Date(
        Date.now() - Math.random() * 864000000,
      ).toISOString(),
    }));
  },

  buildProjects(orgId: string, industry: string, clients: any[]) {
    // Map abstract projects to the newly inserted clients
    const projects = clients.map((client, index) => {
      let projectName = "General Service";
      let status = "active";

      if (industry.toLowerCase() === "legal") {
        projectName =
          index === 0
            ? "Commercial Lease Arbitration"
            : "Custody Modification v2";
      } else if (industry.toLowerCase() === "accounting") {
        projectName =
          index === 0 ? "2025 Corporate Tax Filing" : "Personal Q4 Audit";
      } else if (industry.toLowerCase() === "retail") {
        projectName = "Spring Inventory Refresh";
      }

      return {
        organization_id: orgId,
        client_id: client.id,
        name: projectName,
        status,
        start_date: new Date().toISOString(),
      };
    });

    return projects;
  },
};
