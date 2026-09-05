// @octokit/rest é ESM-only e quebra o parser do Jest assim que a AppModule
// inteira é carregada (GithubSyncModule -> GithubSyncService importa
// `Octokit` no topo do arquivo). Nenhum teste e2e atual exercita
// integração real com GitHub, então mapeamos para este stub só nos testes
// (ver `moduleNameMapper` em test/jest-e2e.json) — o código de produção
// continua usando o pacote real.
class Octokit {
  constructor() {}
}

module.exports = { Octokit };
