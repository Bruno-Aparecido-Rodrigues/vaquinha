| Pasta | O que é | Porta |
|---|---|---|
| `front/` | Site em Expo (React Native Web) | 3000 |
| `gateway/` | | 8080 |
| `login/` | Login/cadastro com cookie HttpOnly| 8081 |
| *(próximo)* `campanha/` | CRUD de vaquinhas | 8082 |
| *(próximo)* `doacao/` | Doações (concorrência + transação) | 8083 |
| *(próximo)* `relatorio/` | Ouve todos os eventos do RabbitMQ; tela do admin | 8084 |

---

## Como rodar

**Pré-requisitos:** Java 17+, Node 20+, IntelliJ IDEA, MongoDB Community Server e MongoDB Compass.

### 1. MongoDB local (uma vez só)

1. Instale o **MongoDB Community Server** (https://www.mongodb.com/try/download/community → Windows → msi). Na instalação escolha **Complete** e deixe marcado **"Install MongoD as a Service"**: assim o Mongo liga sozinho com o Windows.
2. **Ligue o replica set**, obrigatório para usar transações (Campanha e Doação vão precisar):
   - Abra o Bloco de Notas **como administrador** e abra `C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg` (troque `8.0` pela sua versão).
   - Troque a linha `#replication:` por (sem `#`, com **2 espaços** antes de `replSetName`):
     ```yaml
     replication:
       replSetName: rs0
     ```
   - No **PowerShell como administrador**: `Restart-Service MongoDB`
3. No **Compass**, conecte em:
   ```
   mongodb://localhost:27017/?directConnection=true
   ```
   Abra o shell na parte de baixo (*>_MONGOSH*) e rode **uma única vez**:
   ```js
   rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })
   ```
   Deve responder `ok: 1`. Para conferir: `rs.status().members[0].stateStr` → `'PRIMARY'`.

Cada microsserviço usa o **seu próprio banco** dentro desse Mongo: `vaquinha-login`, `vaquinha-campanha`, `vaquinha-doacao` e `vaquinha-relatorio`. Um banco só aparece no Compass depois que o serviço dele grava algo pela primeira vez.

### 2. Login (porta 8081)

1. No IntelliJ: **File → Open** → pasta **`login`** (a que tem o `pom.xml` principal) → *Open as Project* → *Trust Project*. Espere baixar as dependências.
2. Confira o Java em **File → Project Structure → SDK** (17 ou mais).
3. Abra `spring/src/main/java/io/github/fatec/LoginApplication.java` e clique no **▶**.
   - Se reclamar do módulo `domain`: aba **Maven** (direita) → **login → Lifecycle → install**, e rode de novo.

No console deve aparecer **"Usuário ADMIN padrão criado: admin@muuv.com"**. Atualize o Compass: o banco `vaquinha-login` aparece, com o admin na coleção `usuario`.

ADMIN padrão: `admin@muuv.com` / `admin123` (dá para mudar em `application.yml`, seção `app.admin`). O site só cria contas CLIENTE.

### 3. Gateway (porta 8080)

**File → Open** → pasta **`gateway`** → *New Window* (para não fechar o Login). Abra `src/main/java/io/github/fatec/GatewayApplication.java` e clique no **▶**. Deve aparecer **"Started GatewayApplication"**.

### 4. Front (porta 3000)
```bash 
# abrir a pasta vaquinha pelo visual code e rodar no terminal
cd front
npm install
npx expo install --fix     # alinha as versões dos pacotes com o Expo SDK 54
npm run dev                # ou npm run web, é o mesmo comando
```
Abra **http://localhost:3000**.

### 5. Testar no Postman (sempre pela porta 8080)

| # | Requisição | Corpo (raw → JSON) | Esperado |
|---|---|---|---|
| 1 | `POST http://localhost:8080/login/auth` | `{ "email": "admin@muuv.com", "senha": "admin123", "lembrar": true }` | **200** + cookie `access_token` |
| 2 | `GET http://localhost:8080/login/v1/me` | — | **200** (o gateway leu o cookie) |
| 3 | `POST http://localhost:8080/login/v1/create` | `{ "nome": "Maria", "email": "maria@email.com", "senha": "123456" }` | **201**, `roles: ["CLIENTE"]` (aparece no Compass) |
| 4 | Repetir o 3 | mesmo corpo | **409** "E-mail já cadastrado" |
| 5 | `POST http://localhost:8080/login/auth` | `{ "email": "maria@email.com", "senha": "errada" }` | **401** |
| 6 | `POST http://localhost:8080/login/v1/logout` | — | **204**, o cookie some |
| 7 | `GET http://localhost:8080/login/v1/me` | — | **401** |

### Problemas comuns
| Sintoma | Causa provável |
|---|---|
| Compass não conecta / Login não sobe (`MongoSocketOpenException`) | Serviço do Mongo parado: `Get-Service MongoDB` e `Start-Service MongoDB` (PowerShell admin). Se não ligar, confira a indentação do `mongod.cfg` |
| Compass fica em *timeout* sem `directConnection` | O `rs.initiate` ainda não foi rodado |
| Erro de **CORS** no navegador | Site aberto por `127.0.0.1` ou porta diferente de 3000 |
| **401** em tudo, mesmo logado | `jwt.secret` diferente entre Login e Gateway |
| "Port 8080 already in use" | Outro programa na porta: mude `server.port` do gateway e o `EXPO_PUBLIC_API_URL` em `front/.env` |

## Telas do front

| Rota | Tela | Quem acessa |
|---|---|---|
| `/` | Login / Criar conta | público |
| `/explorar` | Busca + cards (foto, título, meta, barra, Apoiar) | logado |
| `/campanha/[id]` | Foto, descrição, doações + modal de doação | logado |
| `/minhas-vaquinhas` | Minhas campanhas: editar, encerrar, excluir | logado |
| `/vaquinha/nova` e `/vaquinha/[id]/editar` | Formulário: título, descrição, meta, data limite, link da foto | logado |
| `/painel` | Monitor de operações (relatório) | ADMIN |