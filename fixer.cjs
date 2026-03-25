const fs = require('fs');

const fixFile = (filePath) => {
    console.log(`Fixing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const pattern = /\(organizationId \? \(organizationId \? supabase\.from\('([^']+)'\)\.eq\('organization_id', organizationId\) : supabase\.from\('([^']+)'\)\)\.select\((.*?)\)\.eq\('organization_id', organizationId\) : \(organizationId \? supabase\.from\('([^']+)'\)\.eq\('organization_id', organizationId\) : supabase\.from\('([^']+)'\)\)\.select\((.*?)\)\)/g;

    let modified = content.replace(pattern, (match, t1, t2, selectArgs1, t4, t5, selectArgs2) => {
        return `(organizationId ? supabase.from('${t1}').select(${selectArgs1}).eq('organization_id', organizationId) : supabase.from('${t1}').select(${selectArgs1}))`;
    });
    
    const pattern2 = /\(organizationId \? supabase\.from\('([^']+)'\)\.eq\('organization_id', organizationId\) : supabase\.from\('([^']+)'\)\)\.select\((.*?)\)/g;
    
    modified = modified.replace(pattern2, (match, t1, t2, selectArgs) => {
        return `(organizationId ? supabase.from('${t1}').select(${selectArgs}).eq('organization_id', organizationId) : supabase.from('${t1}').select(${selectArgs}))`;
    });

    if (content !== modified) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`[SUCCESS] Patched syntax in ${filePath}`);
    } else {
        console.log(`[SKIPPED] No matches found in ${filePath}`);
    }
}

fixFile('c:\\\\dev\\\\github\\\\business\\\\Bridgebox-ai\\\\src\\\\lib\\\\db\\\\analytics.ts');
fixFile('c:\\\\dev\\\\github\\\\business\\\\Bridgebox-ai\\\\src\\\\lib\\\\db\\\\executive.ts');
