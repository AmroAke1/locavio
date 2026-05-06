import { useAuthStore } from '@/store/authStore'
import { googleLogin, appleLogin } from '@/services/authService'

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  const loginWithGoogle = async (googleToken) => {
    const data = await googleLogin(googleToken)
    login(data.user, data.access_token)
    return data
  }

  const loginWithApple = async (appleToken) => {
    const data = await appleLogin(appleToken)
    login(data.user, data.access_token)
    return data
  }

  return { user, isAuthenticated, loginWithGoogle, loginWithApple, logout }
}
