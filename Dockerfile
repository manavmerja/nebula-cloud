# 1. Base Image (Node 20 required for Next.js 16)
FROM node:20-alpine

# 2. Working Directory
WORKDIR /app

# 3. Dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# 4. Copy Source
COPY . .

# -------------------------------------------
# 🛑 FIX: Dummy Variables for Build Process
# (Ye sirf build pass karne ke liye hain, real keys HF Settings se ayengi)
# -------------------------------------------
ENV MONGODB_URI="mongodb://build-placeholder-value"
ENV NEXTAUTH_SECRET="super-secret-build-key"
ENV NEXT_PUBLIC_API_URL="http://localhost:3000"
# -------------------------------------------

# 5. Build Next.js
RUN npm run build

# 6. Permissions
RUN chmod -R 777 /app

# 7. Expose Port
ENV PORT=7860
EXPOSE 7860

# 8. Start
CMD ["npm", "start"]