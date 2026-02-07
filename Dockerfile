# 1. Update Base Image to Node 20 (Next.js 16 ke liye zaroori hai)
FROM node:20-alpine

# 2. Working Directory
WORKDIR /app

# 3. Dependencies Copy & Install
COPY package.json package-lock.json* ./

# 4. Install Dependencies (Legacy peer deps zaroori hai React conflict ke liye)
RUN npm install --legacy-peer-deps

# 5. Copy Source Code
COPY . .

# 6. Build Next.js
RUN npm run build

# 7. Set Permissions (Hugging Face specific)
RUN chmod -R 777 /app

# 8. Expose Port 7860
ENV PORT=7860
EXPOSE 7860

# 9. Start Server
CMD ["npm", "start"]