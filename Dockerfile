# 베이스 이미지로 Node.js 20.1 사용
FROM node:20.1-alpine AS base

# 1. 의존성 설치 단계
FROM base AS deps
WORKDIR /app

# 알파인 리눅스 필수 패키지 설치
RUN apk add --no-cache libc6-compat

# package.json과 yarn.lock 복사 (혹은 package-lock.json)
COPY package.json yarn.lock* package-lock.json* ./

# 프로덕션 의존성만 설치
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 2. 빌드 단계
FROM base AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 환경변수 설정 (필요한 경우 .env.production 파일 생성 필요)
# ENV NEXT_TELEMETRY_DISABLED 1

# 프로덕션 빌드 실행
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  fi

# 3. 프로덕션 단계
FROM base AS runner
WORKDIR /app

# 실행에 필요한 환경변수 설정
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 시스템 의존성 설치
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js 실행에 필요한 파일들만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 폰트 파일 복사 (SpoqaHanSansNeo 폰트 사용 확인)
COPY --from=builder /app/public/fonts ./public/fonts

# 사용자 권한 설정
RUN chown -R nextjs:nodejs /app

# nextjs 사용자로 전환
USER nextjs

# 포트 설정
EXPOSE 3000

# 환경변수 설정 - hostname 0.0.0.0으로 설정하여 컨테이너 외부에서 접근 가능하도록 함
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 서버 실행
CMD ["yarn", "start"] 