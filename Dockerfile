# Fase de build
FROM node:18 AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e o package-lock.json (se existir)
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código do projeto para o contêiner
COPY . .

# Constrói o projeto Next.js
RUN npm run build

# Remove as dependências de desenvolvimento após a build
RUN npm prune --production

# Fase de produção
FROM node:18-alpine AS runner

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Define a variável de ambiente para rodar em produção
ENV NODE_ENV=production

# Expõe a porta onde o Next.js será servido
EXPOSE 3000

# Comando para rodar a aplicação Next.js
CMD ["npm", "run", "start"]
