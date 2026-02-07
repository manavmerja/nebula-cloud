# 1. Base Image
FROM node:20-alpine

# 2. Working Directory
WORKDIR /app

# 3. Install Dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 4. Copy Source
COPY . .

# 5. Build-Time Dummy Vars (Build paas karne ke liye)
ENV MONGODB_URI="mongodb://0.0.0.0"
ENV NEXTAUTH_SECRET="build-secret-key"
ENV NEXT_PUBLIC_API_URL="http://localhost:7860"

# 6. Build Project
RUN npm run build

# 7. Permissions
RUN chmod -R 777 /app

# 8. Set Port Env
ENV PORT=7860
EXPOSE 7860

# 9. 🛑 CRITICAL CHANGE: Force Next.js to use Port 7860
CMD ["npx", "next", "start", "-p", "7860"]