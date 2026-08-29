# Checklist · Pre-push

Passe por este checklist antes de enviar código para o remoto.

## 1. Qualidade básica
- [ ] Lint passou
- [ ] Typecheck passou, se aplicável
- [ ] Build passou, se aplicável
- [ ] Não há `console.log`, prints temporários ou debug acidental em produção
- [ ] Não há blocos comentados mortos sem motivo

## 2. Testes
- [ ] Testes relevantes passaram
- [ ] Não deixei testes pulados sem justificativa
- [ ] Features novas têm cobertura mínima adequada
- [ ] Não introduzi flaky tests conhecidos

## 3. Segurança
- [ ] Não há credenciais, tokens ou segredos no código
- [ ] `.env` ou arquivos sensíveis não estão staged
- [ ] Logs e mensagens de erro não vazam dado sensível
- [ ] Dependências novas não trouxeram risco óbvio alto/crítico

## 4. Git
- [ ] Sei exatamente o que estou enviando
- [ ] Os commits fazem sentido e têm mensagem legível
- [ ] Não há conflito pendente
- [ ] A branch está em condição segura para push/PR

## 5. Aderência à story
- [ ] A mudança entregue bate com os critérios de aceite
- [ ] Não houve scope creep desnecessário
- [ ] Story e evidências foram atualizadas

## 6. Documentação
- [ ] README ou docs foram atualizados, se necessário
- [ ] Changelog foi preparado, se fizer sentido

## Regra final
- [ ] Se eu abrir um PR agora, não vou surpreender negativamente quem revisar
