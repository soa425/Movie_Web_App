import { createClient } from '@supabase/supabase-js'

// 1. 환경 변수 로드 (변수명이 정확한지 확인하세요: VITE_SUPABASE_URL 인지 PROJECT_URL 인지)
const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. URL이나 키가 없을 경우를 대비한 방어 코드 (디버깅용)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다. .env 파일을 확인해주세요.')
}

// 3. 싱글톤 인스턴스 생성
// 파일을 import하는 시점에 단 한 번만 실행되므로 globalThis 없이도 중복 생성이 방지됩니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'movie-app-auth' // 저장 키를 명시적으로 지정하여 인스턴스 간 충돌 방지
  }
})