-- Vérifier l'abonnement de l'éducateur
SELECT
  ep.id,
  ep.first_name,
  ep.last_name,
  s.id as subscription_id,
  s.status,
  s.stripe_subscription_id,
  s.current_period_start,
  s.current_period_end
FROM educator_profiles ep
LEFT JOIN subscriptions s ON s.educator_id = ep.id
WHERE ep.id = 'd2542585-68bb-4f19-be96-f2be24319119';
