// Google Service Account 인증 유틸리티
// GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 환경변수에서 서비스 계정 키 로드

export interface ServiceAccountKey {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
}

// Base64 디코딩하여 서비스 계정 키 가져오기
export function getServiceAccountKey(): ServiceAccountKey | null {
  const base64Key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
  if (!base64Key) {
    console.error('GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 not set')
    return null
  }

  try {
    const jsonString = Buffer.from(base64Key, 'base64').toString('utf-8')
    return JSON.parse(jsonString) as ServiceAccountKey
  } catch (error) {
    console.error('Failed to decode service account key:', error)
    return null
  }
}

// JWT 토큰 생성 (Google OAuth 2.0 for Service Accounts)
export async function getAccessToken(): Promise<string | null> {
  const key = getServiceAccountKey()
  if (!key) return null

  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600 // 1 hour

  // JWT Header
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: key.private_key_id,
  }

  // JWT Claim Set
  const claim = {
    iss: key.client_email,
    sub: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: key.token_uri,
    iat: now,
    exp: expiry,
  }

  // Base64URL encode
  const encodeBase64Url = (obj: object) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const headerB64 = encodeBase64Url(header)
  const claimB64 = encodeBase64Url(claim)
  const signatureInput = `${headerB64}.${claimB64}`

  // Sign with private key (Node.js crypto)
  const crypto = await import('crypto')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(signatureInput)
  const signature = sign.sign(key.private_key, 'base64')
  const signatureB64 = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const jwt = `${signatureInput}.${signatureB64}`

  // Exchange JWT for access token
  try {
    const response = await fetch(key.token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Token request failed:', error)
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Failed to get access token:', error)
    return null
  }
}
