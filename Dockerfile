# 1. Node.js Base Image
FROM node:18-alpine

# 2. Working Directory
WORKDIR /app

# 3. Dependencies Copy & Install
COPY package.json package-lock.json* ./

# 🛑 FIX HERE: Add --legacy-peer-deps to ignore React 19 conflicts
RUN npm install --legacy-peer-deps

# 4. Copy Source Code
COPY . .

# 5. Build Next.js
RUN npm run build

# 6. Permissions (Hugging Face ke liye zaroori)
RUN chmod -R 777 /app

# 7. Port 7860 Expose karna
ENV PORT=7860
EXPOSE 7860

# 8. Start Server
CMD ["npm", "start"]