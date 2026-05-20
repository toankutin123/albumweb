import api from './api'
import authService from './authService'

export { authService }

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats')
}

export const albumService = {
  getAll: (params) => api.get('/albums', { params }),
  getById: (id) => api.get(`/albums/${id}`),
  create: (data) => api.post('/albums', data),
  update: (id, data) => api.put(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`),
  getMyAlbums: () => api.get('/albums/my/albums'),
  addImages: (albumId, imageUrls) => api.post(`/albums/${albumId}/images`, { imageUrls }),
  removeImage: (albumId, imageId) => api.delete(`/albums/${albumId}/images/${imageId}`),
  purchase: (id) => api.post(`/albums/${id}/purchase`),
  checkPurchased: (id) => api.get(`/albums/${id}/check-purchased`)
}

export const collectionService = albumService // Alias for backward compatibility

export const favoriteService = {
  getAll: () => api.get('/favorites'),
  add: (albumId) => api.post('/favorites', { album_id: albumId }),
  remove: (albumId) => api.delete(`/favorites/${albumId}`),
  check: (albumId) => api.get(`/favorites/check/${albumId}`)
}

export const paymentService = {
  getMy: () => api.get('/payment/my'),
  save: (data) => api.post('/payment/save', data)
}

export const depositService = {
  create: (data) => api.post('/deposit', data),
  getMy: () => api.get('/deposit'),
  getAllAdmin: () => api.get('/deposit/admin/all'),
  approve: (id) => api.post(`/deposit/${id}/approve`),
  reject: (id) => api.post(`/deposit/${id}/reject`)
}

export const withdrawalService = {
  create: (data) => api.post('/withdrawal', data),
  getMy: () => api.get('/withdrawal'),
  getAllAdmin: () => api.get('/withdrawal/admin/all'),
  approve: (id) => api.post(`/withdrawal/${id}/approve`),
  reject: (id, reason) => api.post(`/withdrawal/${id}/reject`, { reason })
}

export const otpService = {
  verify: (data) => api.post('/otp/verify', data),
  verifyForWithdraw: (data) => api.post('/otp/verify', data),
  getCurrent: () => api.get('/otp/current'),
  getByUserId: (userId) => api.get(`/otp/user/${userId}`),
  save: (otp_code) => api.post('/otp/save', { otp_code })
}
