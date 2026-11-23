# Estoque Fácil

App mobile para pequenos comerciantes: gestão de produtos, controle de estoque, registro de vendas e relatórios.

**Stacks:** React Native (Expo) · Supabase (PostgreSQL + Auth + API) · React Native Paper · VS Code

## Funcionalidades
- **Produtos:** cadastro, edição, exclusão, categoria e estoque mínimo.
- **Estoque:** baixa automática a cada venda, alertas de estoque baixo (início e lista), filtro rápido.
- **Vendas:** lançamento com seletor de quantidade, total automático, validação de estoque e histórico por data.
- **Relatórios:** hoje / 7 dias / 30 dias, faturamento, ticket médio, gráfico por dia e produtos mais vendidos.
- **Login:** e-mail e senha (Supabase Auth). Cada usuário vê somente seus dados (RLS).

## Como rodar
1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, execute `supabase/schema.sql`.
3. (Opcional, para testar rápido) Em *Authentication > Providers > Email*, desative "Confirm email".
4. Copie `.env.example` para `.env` e preencha URL e anon key (*Project Settings > API*).
5. Instale e rode:
   ```bash
   npm install
   npx expo install --check   # alinha versões ao SDK do Expo instalado
   npx expo start -c
   ```
6. Abra no celular com o app **Expo Go** (QR code) ou no emulador (`a` / `i`).

## Estrutura
```
App.js
src/components/              componentes reutilizáveis
src/context/AuthContext.js   sessão e autenticação
src/lib/supabase.js          cliente Supabase
src/navigation/index.js      rotas (auth, abas e formulário)
src/screens/                 telas
src/services/                acesso a dados (produtos, vendas, relatórios)
src/utils/format.js          moeda, datas e conversões
src/theme.js                 cores e estilo geral
supabase/schema.sql          tabelas, RLS e função registrar_venda()
```

## Observações
- A venda usa a função SQL `registrar_venda`, que roda em uma única transação: valida estoque, baixa as quantidades e grava os itens. Se algo falhar, nada é salvo.
- Os itens da venda guardam nome e preço no momento da venda; relatórios antigos não mudam se o produto for editado ou excluído.
- Após alterar o `.env`, reinicie com `npx expo start -c`.
