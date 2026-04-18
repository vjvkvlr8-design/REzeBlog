# Docker Desktop for Windows 설치 가이드
# 작성일: 2026-04-18
# 목적: 벤치마크/API 테스트 실행을 위한 Docker 환경 구축

## 설치 전 확인사항

### 시스템 요구사항
- Windows 10 64bit: Pro, Enterprise, 또는 Education (Build 19041 이상)
- Windows 11 64bit: 모든 에디션
- BIOS에서 가상화 활성화 (Intel VT-x / AMD-V)
- WSL2 (Windows Subsystem for Linux 2) 지원

### 가상화 확인
```powershell
# 관리자 PowerShell에서 실행
systeminfo | findstr /B /C:"Hyper-V Requirements"
# 또는
wmic cpu get VirtualizationFirmwareEnabled
```

**출력 예시:**
```
Hyper-V Requirements:      VM Monitor Mode Extensions: Yes
                           Virtualization Enabled In Firmware: Yes
                           Second Level Address Translation: Yes
                           Data Execution Prevention Available: Yes
```

## 설치 단계

### 1단계: WSL2 설치 (Windows 10/11)

**자동 설치 (권장):**
```powershell
# 관리자 PowerShell에서 실행
wsl --install
```

**수동 설치 (자동 실패 시):**
```powershell
# 1. WSL 활성화
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 2. 가상 머신 플랫폼 활성화
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 3. WSL2 기본 버전 설정
wsl --set-default-version 2

# 4. Linux 커널 업데이트 패키지 다운로드
# https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
# 다운로드 후 실행

# 5. 재부팅
Restart-Computer
```

### 2단계: Docker Desktop 다운로드

**공식 다운로드:**
1. https://www.docker.com/products/docker-desktop/ 접속
2. "Docker Desktop for Windows" 다운로드
3. 설치 파일 실행 (Docker Desktop Installer.exe)

**Chocolatey 사용 (선택):**
```powershell
# Chocolatey 미설치 시 먼저 설치
# https://chocolatey.org/install

# Docker Desktop 설치
choco install docker-desktop
```

### 3단계: Docker Desktop 설치

1. **설치 파일 실행**
   - 다운로드한 `Docker Desktop Installer.exe` 더블클릭

2. **설치 옵션**
   - ✅ "Use WSL 2 instead of Hyper-V" (권장)
   - ✅ "Add shortcut to desktop"
   - [OK] 클릭

3. **설치 완료 대기**
   - 약 5-10분 소요
   - "Installation succeeded" 메시지 확인
   - [Close] 클릭

4. **재부팅**
   - Docker Desktop 실행 전 반드시 재부팅

### 4단계: Docker Desktop 실행 및 설정

1. **Docker Desktop 실행**
   - 시작 메뉴 → Docker Desktop
   - 또는 바탕화면 아이콘 더블클릭

2. **라이선스 동의**
   - Docker Subscription Service Agreement 동의
   - [Accept] 클릭

3. **Docker Engine 시작 대기**
   - "Docker Desktop is running" 메시지 확인
   - 트레이 아이콘이 정지 표시에서 실행 표시로 변경

4. **설정 확인**
   - Settings (톱니바퀴 아이콘) → General
   - ✅ "Use the WSL 2 based engine" (확인)
   - Resources → WSL Integration
   - ✅ Ubuntu (또는 설치된 WSL2 배포판)

### 5단계: Docker 명령어 테스트

```powershell
# PowerShell 또는 CMD에서 실행

# Docker 버전 확인
docker --version
# 예상 출력: Docker version 24.0.x, build xxxxx

# Docker Compose 버전 확인
docker-compose --version
# 예상 출력: Docker Compose version v2.x.x

# Docker Compose V2 확인
docker compose version
# 예상 출력: Docker Compose version v2.x.x

# 테스트 컨테이너 실행
docker run hello-world
# 예상 출력: "Hello from Docker!" 메시지
```

## REzeBlog Docker 환경 실행

### 1단계: 프로젝트 디렉토리 이동
```powershell
cd C:\REzeBlog\Main
```

### 2단계: 환경 변수 설정
```powershell
# .env 파일 생성 (또는 .env.local 복사)
Copy-Item ..\REzeBlogFront\.env.local .\REzeBlogFront\.env.local
```

### 3단계: Docker Compose 실행
```powershell
# 전체 인프라 시작 (PostgreSQL + Next.js + Redis)
docker-compose up -d

# 또는 Makefile 사용
make up
```

### 4단계: 상태 확인
```powershell
# 실행 중인 컨테이너 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 또는 Makefile 사용
make status
make logs
```

### 5단계: 서비스 접속 테스트
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 6단계: API 벤치마크 실행
```powershell
# 벤치마크 실행 (컨테이너 내부)
docker-compose exec frontend npm run benchmark

# 또는 Makefile 사용
make benchmark
```

## 문제 해결

### Hyper-V 충돌 (Windows 10 Home)
```powershell
# Windows 10 Home은 Hyper-V 미지원
# WSL2 백엔드 사용 (자동 설정됨)

# WSL2 강제 설정
& "C:\Program Files\Docker\Docker\DockerCli.exe" -SwitchDaemon
```

### WSL2 연결 실패
```powershell
# WSL2 상태 확인
wsl --list --verbose

# WSL2 재시작
wsl --shutdown

# Docker Desktop 재시작
```

### 포트 충돌 (5432, 3000, 6379)
```powershell
# 포트 사용 확인
netstat -ano | findstr 5432

# 프로세스 종료
# taskkill /PID <PID> /F

# 또는 docker-compose.yml 포트 변경
# "5433:5432" 등으로 수정
```

### 메모리 부족
```powershell
# Docker Desktop 설정
Settings → Resources → Memory
- 최소 4GB 권장
- 8GB 이상 권장 (PostgreSQL + Next.js + Redis)
```

### 방화벽 차단
```powershell
# Docker 관련 방화벽 규칙 확인
# Windows Defender Firewall → Allow an app
# Docker Desktop 체크
```

## 설치 확인 체크리스트

- [ ] Windows 버전 확인 (10/11, 64bit)
- [ ] BIOS 가상화 활성화 확인
- [ ] WSL2 설치 완료
- [ ] Docker Desktop 설치 완료
- [ ] Docker Desktop 실행 중
- [ ] `docker --version` 명령 성공
- [ ] `docker run hello-world` 성공
- [ ] `docker-compose up -d` 성공
- [ ] http://localhost:3000 접속 성공
- [ ] `make benchmark` 실행 성공

## 다음 단계

Docker 설치 완료 후:
1. `make up`으로 인프라 구동
2. `make benchmark`로 API 응답속도 테스트
3. `make test`로 전체 테스트 실행
4. GitHub Actions CI/CD 연동

## 참고 자료

- Docker 공식 문서: https://docs.docker.com/desktop/install/windows-install/
- WSL2 설치 가이드: https://docs.microsoft.com/ko-kr/windows/wsl/install
- Docker Hub: https://hub.docker.com/
