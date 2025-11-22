-- Créer un abonnement Premium de test pour l'éducateur
INSERT INTO subscriptions (
  educator_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  price_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
) VALUES (
  'd2542585-68bb-4f19-be96-f2be24319119',
  'sub_test_' || gen_random_uuid()::text,
  'cus_test_' || gen_random_uuid()::text,
  'active',
  'price_test_premium',
  NOW(),
  NOW() + INTERVAL '30 days',
  false,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Vérifier que l'abonnement a été créé
SELECT
  s.id,
  s.educator_id,
  s.status,
  s.current_period_start,
  s.current_period_end,
  ep.first_name,
  ep.last_name
FROM subscriptions s
JOIN educator_profiles ep ON ep.id = s.educator_id
WHERE s.educator_id = 'd2542585-68bb-4f19-be96-f2be24319119';
