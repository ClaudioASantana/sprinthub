TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/dev-login -H "Content-Type: application/json" -d '{"email":"admin@sprinthub.com","role":"super_admin"}' | jq -r .access_token)
echo "Token: $TOKEN"
curl -s -v -X POST http://localhost:3000/api/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Empresa Teste","cnpj":"00.000.000/0001-00","responsible":"Fulano","email":"fulano@teste.com","ownerEmail":"fulano@teste.com","ownerName":"Fulano"}'
