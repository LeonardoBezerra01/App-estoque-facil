-- =====================================================================
-- Estoque Fácil - Esquema do banco (Supabase / PostgreSQL)
-- Execute no SQL Editor do Supabase.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Tabelas ----------
create table if not exists public.produtos (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome           text not null,
  categoria      text,
  preco          numeric(12,2) not null check (preco >= 0),
  quantidade     integer not null default 0 check (quantidade >= 0),
  estoque_minimo integer not null default 0 check (estoque_minimo >= 0),
  created_at     timestamptz not null default now()
);

create table if not exists public.vendas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  total      numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.itens_venda (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  venda_id       uuid not null references public.vendas(id) on delete cascade,
  produto_id     uuid references public.produtos(id) on delete set null,
  nome_produto   text not null,
  quantidade     integer not null check (quantidade > 0),
  preco_unitario numeric(12,2) not null check (preco_unitario >= 0)
);

create index if not exists idx_produtos_user  on public.produtos(user_id);
create index if not exists idx_vendas_user_dt on public.vendas(user_id, created_at desc);
create index if not exists idx_itens_venda    on public.itens_venda(venda_id);

-- ---------- Segurança (RLS): cada usuário só enxerga os próprios dados ----------
alter table public.produtos    enable row level security;
alter table public.vendas      enable row level security;
alter table public.itens_venda enable row level security;

drop policy if exists "produtos_proprios"    on public.produtos;
drop policy if exists "vendas_proprias"      on public.vendas;
drop policy if exists "itens_venda_proprios" on public.itens_venda;

create policy "produtos_proprios"    on public.produtos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "vendas_proprias"      on public.vendas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "itens_venda_proprios" on public.itens_venda
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Registro de venda (atômico) ----------
-- Recebe: [{"produto_id": "...", "quantidade": 2}, ...]
-- Valida estoque, baixa as quantidades, grava itens e calcula o total.
create or replace function public.registrar_venda(p_itens jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_venda_id uuid;
  v_total    numeric(12,2) := 0;
  v_item     jsonb;
  v_prod     public.produtos%rowtype;
  v_qtd      integer;
begin
  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'A venda precisa ter ao menos um item.';
  end if;

  insert into public.vendas (total) values (0) returning id into v_venda_id;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item->>'quantidade')::integer;
    if v_qtd is null or v_qtd <= 0 then
      raise exception 'Quantidade inválida.';
    end if;

    select * into v_prod
      from public.produtos
     where id = (v_item->>'produto_id')::uuid
       for update;

    if not found then
      raise exception 'Produto não encontrado.';
    end if;

    if v_prod.quantidade < v_qtd then
      raise exception 'Estoque insuficiente para "%" (disponível: %).', v_prod.nome, v_prod.quantidade;
    end if;

    update public.produtos
       set quantidade = quantidade - v_qtd
     where id = v_prod.id;

    insert into public.itens_venda (venda_id, produto_id, nome_produto, quantidade, preco_unitario)
    values (v_venda_id, v_prod.id, v_prod.nome, v_qtd, v_prod.preco);

    v_total := v_total + (v_prod.preco * v_qtd);
  end loop;

  update public.vendas set total = v_total where id = v_venda_id;
  return v_venda_id;
end;
$$;

grant execute on function public.registrar_venda(jsonb) to authenticated;
