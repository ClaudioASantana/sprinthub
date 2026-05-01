#!/bin/bash
echo "🚀 Disparando Deploy do Backend no Coolify..."
curl -s --request GET "http://46.202.146.149:8000/api/v1/deploy?uuid=x11e3bwetmxnp45x13t4yeja&force=false" \
  --header "Authorization: Bearer 4|zZSFLN5UJHGdRpYthoZYWCmREzyUWK7xcaMSAKoc1465a718"
echo ""
echo "✅ Comando de deploy enviado com sucesso! Acompanhe o log pelo painel do Coolify."
