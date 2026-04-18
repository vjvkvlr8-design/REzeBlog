// API 응답속도 벤치마크 스크립트
// 작성일: 2026-04-18
// 사용법: node scripts/benchmark-api.js

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

// 테스트 엔드포인트 목록
const endpoints = [
  { path: '/api/game', method: 'GET', headers: { 'x-user-id': 'benchmark-test' } },
  { path: '/api/branches?id=intro', method: 'GET' },
  { path: '/api/branches', method: 'GET' },
];

// 응답 시간 측정 함수
function measureRequest(path, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          path,
          status: res.statusCode,
          duration,
          success: res.statusCode === 200
        });
      });
    });

    req.on('error', (err) => {
      reject({ path, error: err.message, duration: Date.now() - start });
    });

    req.end();
  });
}

// 반복 테스트
async function runBenchmark(iterations = 10) {
  console.log('=== API 응답속도 벤치마크 ===\n');
  console.log(`대상: http://${BASE_URL}:${PORT}`);
  console.log(`반복 횟수: ${iterations}회\n`);

  const results = {};

  for (const endpoint of endpoints) {
    const times = [];
    let successCount = 0;
    let failCount = 0;

    console.log(`테스트: ${endpoint.path}`);
    
    for (let i = 0; i < iterations; i++) {
      try {
        const result = await measureRequest(
          endpoint.path,
          endpoint.method,
          endpoint.headers || {}
        );
        times.push(result.duration);
        if (result.success) successCount++;
        else failCount++;
        process.stdout.write('.');
      } catch (err) {
        failCount++;
        times.push(9999); // 에러 시 페널티 값
        process.stdout.write('X');
      }
    }

    console.log('\n');

    // 통계 계산
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    results[endpoint.path] = {
      avg,
      min,
      max,
      p95,
      successCount,
      failCount,
      pass200ms: avg < 200
    };

    console.log(`  평균: ${avg.toFixed(2)}ms`);
    console.log(`  최소: ${min}ms`);
    console.log(`  최대: ${max}ms`);
    console.log(`  P95: ${p95}ms`);
    console.log(`  성공: ${successCount}/${iterations}`);
    console.log(`  200ms 기준: ${avg < 200 ? '✅ PASS' : '❌ FAIL'}\n`);
  }

  // 요약
  console.log('=== 요약 ===');
  const allPass = Object.values(results).every(r => r.pass200ms);
  console.log(`전체 200ms 기준: ${allPass ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!allPass) {
    console.log('\n⚠️ 200ms 기준 실패 엔드포인트:');
    Object.entries(results)
      .filter(([, r]) => !r.pass200ms)
      .forEach(([path, r]) => {
        console.log(`  - ${path}: ${r.avg.toFixed(2)}ms`);
      });
  }

  return results;
}

// 서버 실행 확인
async function checkServer() {
  try {
    await measureRequest('/');
    return true;
  } catch {
    console.error('❌ 서버가 실행되지 않았습니다.');
    console.log('먼저 npm run dev를 실행하세요.\n');
    return false;
  }
}

// 메인 실행
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  console.log('서버 연결 확인 ✅\n');
  
  const iterations = process.argv[2] ? parseInt(process.argv[2]) : 10;
  await runBenchmark(iterations);
}

main();
