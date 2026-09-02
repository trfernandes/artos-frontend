# Origem: mattpocock/skills

- **Fonte**: https://github.com/mattpocock/skills
- **Licença**: MIT (ver `LICENSE-mattpocock-skills` nesta pasta)
- **Data da vendorização**: 2026-08-29
- **Pastas incluídas**: `skills/engineering/`, `skills/productivity/`, `skills/misc/` (achatadas — cada skill vira uma subpasta direta de `.claude/skills/`, sem o nível de categoria)
- **Pastas excluídas**: `skills/deprecated/` e `skills/in-progress/` (experimentais/obsoletas)

Antes de copiar, o conteúdo foi revisado: sem scripts `postinstall`/`preinstall` em `package.json`, sem `hooks`/`mcpServers` em `.claude-plugin/plugin.json`, e os únicos scripts `.sh`/`.js`/`.py` dentro de `skills/` (`git-guardrails-claude-code/scripts/block-dangerous-git.sh`, `wizard/template.sh`, `diagnosing-bugs/scripts/hitl-loop.template.sh`) são templates que só rodam se o usuário explicitmente os invocar — nenhum roda automaticamente nem faz chamadas de rede a terceiros.

Para atualizar: repita o processo (clone da fonte, revisão de segurança, cópia) e reveja o diff antes de commitar.
