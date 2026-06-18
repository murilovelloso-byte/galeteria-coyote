# Galeteria Coyote — Pesquisa de Satisfação

## Setup rápido

### 1. Banco de dados

Configure o `.env` com sua URL do PostgreSQL:

```
DATABASE_URL="postgresql://user:senha@host:5432/galeteria_coyote"
ADMIN_PASSWORD="sua-senha-aqui"
SESSION_SECRET="string-aleatoria-longa"
```

### 2. Criar as tabelas

```bash
npx prisma migrate dev --name init
```

### 3. Rodar localmente

```bash
npm run dev
```

### 4. Deploy no VPS (Ubuntu)

```bash
npm run build
npm start
# ou com PM2:
pm2 start npm --name "coyote-survey" -- start
```

---

## URLs

| Rota | Descrição |
|------|-----------|
| `/` | Tela inicial da pesquisa |
| `/pesquisa?origem=mesa-1` | Pesquisa (aceita parâmetro origem) |
| `/obrigado` | Tela de agradecimento |
| `/admin/login` | Login do painel |
| `/admin` | Dashboard administrativo |

## Parâmetro `origem`

Use QR codes diferentes para rastrear de onde vêm as respostas:
- Mesa: `/?origem=mesa-1`
- Delivery: `/?origem=delivery`
- Instagram: `/?origem=instagram`

## Senha padrão admin

`coyote@admin2024` (altere no `.env` antes de ir ao ar)
