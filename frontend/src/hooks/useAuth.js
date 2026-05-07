import { useAuthStore } from '@/store/authStore'
import { googleLogin, emailLogin, emailRegister } from '@/services/authService'

export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore()

  const loginWithGoogle = async (googleToken) => {
    const data = await googleLogin(googleToken)
    login(data.user, data.access_token)
    return data
  }

  const loginWithEmail = async (email, password) => {
    const data = await emailLogin(email, password)
    login(data.user, data.access_token)
    return data
  }

  const registerWithEmail = async (email, password, name) => {
    const data = await emailRegister(email, password, name)
    login(data.user, data.access_token)
    return data
  }

  return { user, isAuthenticated, loginWithGoogle, loginWithEmail, registerWithEmail, logout }
}
