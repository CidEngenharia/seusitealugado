# Tutorial: Configurar Domínio Personalizado para Clientes

## Visão Geral

Quando um cliente registrar um domínio pago (ex: no Registro.br), você pode apontar
esse domínio para o site dele dentro do SeuSiteAlugado, sem precisar de subdomínio.

**Antes:**
```
seusitealugado.vercel.app/jkaturismo
```

**Depois (com domínio próprio):**
```
jkaturismo.com.br
```

---

## Passo 1 — Registrar o Domínio no Registro.br

1. Acesse: https://registro.br
2. Faça login ou crie uma conta
3. Pesquise e registre o domínio desejado (ex: `jkaturismo.com.br`)
4. Conclua o pagamento

---

## Passo 2 — Configurar o DNS no Registro.br

Após o registro, acesse o painel do domínio e crie os seguintes registros DNS:

### Se o projeto estiver na Vercel (recomendado):

| Tipo  | Nome | Valor                  | TTL  |
|-------|------|------------------------|------|
| CNAME | www  | cname.vercel-dns.com   | 3600 |
| A     | @    | 76.76.21.21            | 3600 |

> O registro tipo `A` com `@` aponta o domínio raiz (sem www).
> O `CNAME` com `www` aponta a versão com www.

### Se usar outro servidor (VPS/DigitalOcean etc.):

| Tipo | Nome | Valor         | TTL  |
|------|------|---------------|------|
| A    | @    | IP_DO_SERVIDOR| 3600 |
| A    | www  | IP_DO_SERVIDOR| 3600 |

---

## Passo 3 — Adicionar o Domínio na Vercel

1. Acesse: https://vercel.com → seu projeto
2. Vá em **Settings → Domains**
3. Clique em **Add Domain**
4. Digite o domínio do cliente: `jkaturismo.com.br`
5. A Vercel verificará o DNS automaticamente (pode demorar até 48h)
6. O certificado SSL será emitido gratuitamente e de forma automática ✅

---

## Passo 4 — Configurar no Painel Admin do SeuSiteAlugado

1. Acesse o **Painel Administrativo Global**
2. Na tabela de **Controle de Contas**, localize o cliente
3. Clique na linha do cliente para expandir os **Detalhes do Cliente**
4. No campo **Domínio Personalizado**, digite o domínio registrado:
   ```
   jkaturismo.com.br
   ```
5. Clique em **Salvar Domínio**
6. O sistema passará a reconhecer acessos vindos desse domínio e carregará o site correto automaticamente

---

## Como Funciona Internamente

```
Usuário acessa jkaturismo.com.br
        ↓
Registro.br redireciona para Vercel (via CNAME/A)
        ↓
Vercel reconhece o domínio cadastrado no projeto
        ↓
App detecta o hostname: window.location.hostname === "jkaturismo.com.br"
        ↓
Sistema busca o tenant com customDomain === "jkaturismo.com.br"
        ↓
Site do cliente é carregado automaticamente (sem /slug na URL)
```

---

## Dicas Importantes

- ⏱️ **Propagação de DNS**: pode levar de 30 minutos a 48 horas para propagar globalmente.
- 🔒 **SSL automático**: a Vercel emite o certificado HTTPS gratuito via Let's Encrypt.
- ✅ **Teste**: após a propagação, acesse o domínio no navegador em modo anônimo para confirmar.
- 🔁 **Atualizar domínio**: se o cliente mudar de domínio, basta editar o campo no painel e repetir os passos 2 e 3.
- ❌ **Remover domínio**: apague o campo no painel e remova o domínio no painel da Vercel.

---

## Suporte

Em caso de dúvidas sobre configuração de DNS, consulte:
- Suporte Registro.br: https://registro.br/ajuda
- Documentação Vercel Domains: https://vercel.com/docs/projects/domains

---

*Arquivo gerado em: julho/2026 — SeuSiteAlugado Admin*
