import axiosInstance from './axiosInstance'

export const getCompanies = () => axiosInstance.get('/mock-tests/companies')

export const getMockTests = (companyId) =>
  axiosInstance.get('/mock-tests' + (companyId ? `?companyId=${companyId}` : ''))

export const startMockTest = (id) => axiosInstance.post(`/mock-tests/${id}/start`)

export const submitMockTest = (attemptId, data) =>
  axiosInstance.post(`/mock-tests/attempts/${attemptId}/submit`, data)

export const getMockTestResult = (attemptId) =>
  axiosInstance.get(`/mock-tests/attempts/${attemptId}/result`)

export const getMockTestHistory = () =>
  axiosInstance.get('/mock-tests/history')