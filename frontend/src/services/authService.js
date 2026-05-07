import api from './api'

export const googleLogin = (token) =>
  api.post('/auth/google', { token }).then((r) => r.data)

export const appleLogin = (token) =>
  api.post('/auth/apple', { token }).then((r) => r.data)

export const emailLogin = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const emailRegister = (email, password, name) =>
  api.post('/auth/register', { email, password, name }).then((r) => r.data)

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data)

export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data).then((r) => r.data)

export const deleteUser = (id) =>
  api.delete(`/users/${id}`)
