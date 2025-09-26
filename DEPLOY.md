# 🚀 DEPLOY - Duas URLs Separadas

## 📋 Opções para URLs Separadas

### Opção 1: Subdomínios (Recomendado)
Configure no seu provedor de hospedagem:

```
site.mapahistorico.com → aponta para o servidor na porta 3000
admin.mapahistorico.com → aponta para o mesmo servidor na porta 3000
```

O servidor detectará automaticamente baseado na URL:
- `site.mapahistorico.com/` → Site principal
- `admin.mapahistorico.com/admin` → Painel admin

### Opção 2: Portas Diferentes
```
site.mapahistorico.com:3000 → Site principal
admin.mapahistorico.com:3001 → Painel admin (servidor separado)
```

### Opção 3: Proxy Reverso (Nginx)
```nginx
server {
    listen 80;
    server_name site.mapahistorico.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name admin.mapahistorico.com;

    location / {
        proxy_pass http://localhost:3000/admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛠️ Como Fazer Deploy

### 1. Servidores de Hospedagem Recomendados
- **Railway** (Fácil, gratuito para começar)
- **Render** (Bom para Node.js)
- **Vercel** (Rápido, mas precisa adaptar)
- **Heroku** (Clássico, mas pago)
- **DigitalOcean** (VPS completo)

### 2. Deploy no Railway (Exemplo)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Criar projeto
railway init

# Deploy
railway up
```

### 3. Configurar Domínios
Após deploy, configure os domínios/subdomínios no painel do Railway.

## 🔧 Configuração do Servidor

O servidor está configurado para:
- **Porta 3000** (padrão)
- **CORS habilitado** para todas as origens
- **API REST** em `/api/survey`
- **Site principal** em `/`
- **Painel admin** em `/admin`

## 📊 URLs de Acesso

Após deploy:
- **Site Principal**: `https://seudominio.com/`
- **Painel Admin**: `https://seudominio.com/admin`
- **API**: `https://seudominio.com/api/survey`

Para URLs completamente separadas, use subdomínios no seu provedor de hospedagem.