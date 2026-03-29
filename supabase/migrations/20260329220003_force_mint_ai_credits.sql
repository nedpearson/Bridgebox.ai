-- Force minting wallets for all organizations including those missing rows
INSERT INTO public.bb_credit_wallets (organization_id, balance)
SELECT id, 500000
FROM public.bb_organizations
ON CONFLICT (organization_id) 
DO UPDATE SET balance = bb_credit_wallets.balance + 500000;
