// 게임은 더 이상 별도 페이지가 아닌 플로팅 위젯으로 이동
// 이 페이지는 홈으로 리다이렉트
import { redirect } from 'next/navigation'

export default function GamePage() {
  redirect('/')
}
