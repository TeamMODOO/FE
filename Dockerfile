# 베이스 이미지로 Node.js 20.1 사용
FROM node:20.10-alpine AS runner
WORKDIR /app

# 실행에 필요한 환경변수 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 시스템 의존성 설치
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 로컬에서 빌드된 결과물 복사
# .next/standalone 디렉토리의 모든 파일을 현재 작업 디렉토리로 복사
COPY ./.next/standalone ./
# .next/static 파일들을 .next/static 디렉토리로 복사
COPY ./.next/static ./.next/static
# public 디렉토리 복사
COPY ./public ./public

# 사용자 권한 설정
RUN chown -R nextjs:nodejs /app

# nextjs 사용자로 전환
USER nextjs

# 포트 설정
EXPOSE 3000

# 환경변수 설정
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 서버 실행
CMD ["node", "server.js"]