# Dashboard MVX — Provisioning

Dashboard público no GitHub Pages que cruza as pendências do **Relatório Diário (Superset)** com a atividade **CONFIGURAÇÃO DE EQUIPAMENTO** no ERP.

**Acesso:** https://carloshsgandra.github.io/DashboardMVX/

## Regras implementadas

- Rio de Janeiro e São Paulo: somente serviços acima de 1 Gb ou contendo `MARD`.
- Outras filiais: qualquer banda, exceto serviços `L2L`.
- Itens já marcados como `REALIZADO` ou `CANCELADO` no campo “Equipamento Configurado?” não entram na fila.
- A extensão pesquisa o código no ERP e lê o estado da atividade “CONFIGURAÇÃO DE EQUIPAMENTO”.

## Componentes

- `docs/`: dashboard do GitHub Pages e banco colaborativo `data.json`.
- `.github/workflows/pages.yml`: publicação automática.
- `extension/`: extensão Brave/Chrome Manifest V3.
- `AutoHotkey/MVX_Provisioning.ahk`: atalhos para abrir e conferir os sistemas.

## Instalar a extensão

1. Baixe/clonar o repositório.
2. Abra `brave://extensions` ou `chrome://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta `extension`.
5. Mantenha Superset, ERP e dashboard autenticados.

## Atalhos AutoHotkey v2

- `Ctrl+Shift+D`: dashboard.
- `Ctrl+Shift+S`: Superset.
- `Ctrl+Shift+E`: ERP.
- `Ctrl+Shift+V`: verifica no ERP o código numérico selecionado.

> O repositório é público. Ao sincronizar, os registros presentes em `docs/data.json` também se tornam públicos. Para editar, cada usuário configura no painel um token Fine-grained limitado ao repositório, com `Contents: Read and write`; o token permanece somente no navegador desse usuário.
