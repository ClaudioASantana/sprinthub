# Padrão de Arquitetura: Symlinks para Submódulos Git

Este documento descreve a estratégia de utilizar **Symbolic Links (Symlinks ou "atalhos")** para resolver problemas de resolução de caminhos (o conceito de "De-Para") ao se trabalhar com repositórios e submódulos no Git, especialmente em contextos de IA e configuração unificada.

## O Cenário do Problema

1. Você possui um **Repositório Pai (Principal)**.
2. Dentro dele, está configurado um **Submódulo do Git** (um subprojeto independente injetado no repositório pai).
3. Esse submódulo carrega as próprias configurações, regras de IA e diretrizes (como as pastas `.codex` ou `.aios-core`).
4. **O Conflito:** As ferramentas de IA (como Codex CLI, Synkra AIOS) rodando na raiz do Repositório Pai esperam que as pastas de configuração (ex: `.codex`) estejam na **raiz** do repositório pai, e não embutidas dentro do caminho do submódulo.

## A Solução: O "De-Para" (Symlink)

A solução arquitetural mais elegante para resolver isso — sem necessidade de duplicar arquivos de configuração — é criar um link simbólico na raiz do seu Repositório Pai apontando diretamente para a pasta correspondente dentro do submódulo. 

O sistema operacional (e as ferramentas de desenvolvimento) enxergam esse atalho transparente como se fosse uma pasta real existindo na raiz.

### Como Implementar

O comando para criar esse "De-Para" no terminal Linux, macOS ou WSL é:

```bash
# Executado na raiz do repositório pai:
ln -s caminho/para/o/submodulo/.codex .codex
```

*(Lembre-se de substituir `caminho/para/o/submodulo` pelo caminho real da pasta do seu submódulo dentro do projeto)*.

### Vantagens dessa Abordagem

* **Fonte Única da Verdade:** As regras de IA (`.codex` ou `.aios-core`) continuam sendo mantidas, versionadas e atualizadas apenas no repositório independente do submódulo.
* **Transparência para o Git:** O Git do Repositório Pai reconhece apenas o atalho (que é salvo no commit de forma muito leve), não gerando conflitos de versionamento sobreposto.
* **Redirecionamento Silencioso:** Quando o AIOS ou o Codex CLI tentar ler `.codex/constitution.md` a partir da raiz do repositório pai, o atalho redirecionará a leitura silenciosamente para dentro da estrutura do submódulo, permitindo a execução perfeita das IAs.
