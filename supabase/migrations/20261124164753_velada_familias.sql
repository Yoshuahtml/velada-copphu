-- Aplicar una vez en un proyecto Supabase dedicado. Sin borrado de datos existentes.
begin;
create schema velada_privada;
revoke all on schema velada_privada from public;
grant usage on schema velada_privada to anon,authenticated;
create table velada_privada.coordinador (
 unico boolean primary key default true check(unico),
 usuario_id uuid not null unique references auth.users(id) on delete cascade
);
alter table velada_privada.coordinador enable row level security;
revoke all on velada_privada.coordinador from public,anon,authenticated;
create function velada_privada.es_coordinador() returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from velada_privada.coordinador where usuario_id=auth.uid())
$$;
revoke all on function velada_privada.es_coordinador() from public,anon;
grant execute on function velada_privada.es_coordinador() to authenticated;
create function public.es_coordinador() returns boolean language sql stable security invoker set search_path='' as $$select velada_privada.es_coordinador()$$;
revoke all on function public.es_coordinador() from public,anon;
grant execute on function public.es_coordinador() to authenticated;
create table public.familias (
 id uuid primary key default gen_random_uuid(),
 apellidos text not null check(char_length(btrim(apellidos)) between 1 and 120),
 representante text check(representante is null or char_length(representante)<=120),
 creado_en timestamptz not null default clock_timestamp(),
 firma text not null check(char_length(firma)=32)
);
create table public.hijos (
 id uuid primary key default gen_random_uuid(),
 familia_id uuid not null references public.familias(id) on delete cascade,
 nombre text not null check(char_length(btrim(nombre)) between 1 and 100),
 grado text check(grado is null or char_length(grado)<=60)
);
create index familias_deduplicacion on public.familias(firma,creado_en desc);
create index hijos_familia on public.hijos(familia_id);
alter table public.familias enable row level security;
alter table public.hijos enable row level security;
revoke all on public.familias,public.hijos from public,anon,authenticated;
grant select,delete on public.familias,public.hijos to authenticated;
create policy coordinador_lee_familias on public.familias for select to authenticated using((select velada_privada.es_coordinador()));
create policy coordinador_borra_familias on public.familias for delete to authenticated using((select velada_privada.es_coordinador()));
create policy coordinador_lee_hijos on public.hijos for select to authenticated using((select velada_privada.es_coordinador()));
create policy coordinador_borra_hijos on public.hijos for delete to authenticated using((select velada_privada.es_coordinador()));
-- Excepción intencional: la operación pública de alta es anónima y atómica.
-- El definidor privado puede insertar y comprobar duplicados. Nunca devuelve filas ni IDs.
-- No se concede INSERT directo: evita familias incompletas, spam sin límites y bypass de deduplicación.
create function velada_privada.registrar_familia(p_apellidos text,p_representante text,p_hijos jsonb,p_web text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_firma text;v_apellidos text;v_hijo jsonb;v_nombres jsonb;
begin
 if coalesce(p_web,'')<>'' then return '{"registrado":true}'::jsonb;end if;
 v_apellidos:=regexp_replace(btrim(p_apellidos),'\s+',' ','g');
 if v_apellidos is null or char_length(v_apellidos) not between 1 and 120
 or char_length(coalesce(p_representante,''))>120
 or jsonb_typeof(p_hijos) is distinct from 'array' then raise exception 'Revisa los datos de la familia.' using errcode='22023';end if;
 if jsonb_array_length(p_hijos) not between 1 and 12 or octet_length(p_hijos::text)>20000 then raise exception 'Registra entre 1 y 12 hijos.' using errcode='22023';end if;
 for v_hijo in select value from jsonb_array_elements(p_hijos) loop
  if jsonb_typeof(v_hijo) is distinct from 'object' or jsonb_typeof(v_hijo->'nombre') is distinct from 'string'
   or char_length(btrim(v_hijo->>'nombre')) not between 1 and 100
   or (v_hijo ? 'grado' and jsonb_typeof(v_hijo->'grado') not in ('string','null'))
   or char_length(coalesce(v_hijo->>'grado',''))>60 then raise exception 'Revisa el nombre y curso de cada hijo.' using errcode='22023';end if;
 end loop;
 select jsonb_agg(n order by n) into v_nombres from (select lower(regexp_replace(btrim(value->>'nombre'),'\s+',' ','g')) n from jsonb_array_elements(p_hijos)) t;
 -- Orden de hijos, mayúsculas y espacios no generan un registro nuevo. Grado y representante no forman parte de la identidad.
 v_firma:=md5(jsonb_build_array(lower(v_apellidos),v_nombres)::text);
 perform pg_advisory_xact_lock(hashtextextended(v_firma,0));
 if exists(select 1 from public.familias where firma=v_firma and creado_en>clock_timestamp()-interval '10 minutes') then return '{"registrado":true}'::jsonb;end if;
 insert into public.familias(apellidos,representante,firma) values(v_apellidos,nullif(btrim(p_representante),''),v_firma) returning id into v_id;
 insert into public.hijos(familia_id,nombre,grado) select v_id,btrim(value->>'nombre'),nullif(btrim(value->>'grado'),'') from jsonb_array_elements(p_hijos);
 return '{"registrado":true}'::jsonb;
end $$;
revoke all on function velada_privada.registrar_familia(text,text,jsonb,text) from public;
grant execute on function velada_privada.registrar_familia(text,text,jsonb,text) to anon,authenticated;
create function public.registrar_familia(p_apellidos text,p_representante text,p_hijos jsonb,p_web text default '') returns jsonb language sql security invoker set search_path='' as $$select velada_privada.registrar_familia(p_apellidos,p_representante,p_hijos,p_web)$$;
revoke all on function public.registrar_familia(text,text,jsonb,text) from public;
grant execute on function public.registrar_familia(text,text,jsonb,text) to anon,authenticated;
-- Solo se activa el coordinador con este correo, después de verificarlo en Auth.
-- Cambiar el correo ANTES de aplicar en otra instalación. Nunca usar user_metadata.
create function velada_privada.activar_coordinador() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if lower(new.email)='25-0881@copphu.unphu.edu.do' and new.email_confirmed_at is not null then
  insert into velada_privada.coordinador(unico,usuario_id) values(true,new.id) on conflict(unico) do nothing;
 end if;
 return new;
end $$;
revoke all on function velada_privada.activar_coordinador() from public,anon,authenticated;
create trigger velada_coordinador_verificado after insert or update of email,email_confirmed_at on auth.users for each row execute function velada_privada.activar_coordinador();
insert into velada_privada.coordinador(unico,usuario_id) select true,id from auth.users where lower(email)='25-0881@copphu.unphu.edu.do' and email_confirmed_at is not null on conflict(unico) do nothing;
commit;
