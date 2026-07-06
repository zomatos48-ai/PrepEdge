import axiosInstance from './axiosInstance'
export const getSubjects = () => axiosInstance.get('/questions/subjects')
export const getTopics = (subjectId) => axiosInstance.get(`/questions/topics?subjectId=${subjectId}`)
export const getQuestionCount = (params) => {
  const p = new URLSearchParams()
  if (params.subjectId) p.append('subjectId', params.subjectId)
  if (params.topicId) p.append('topicId', params.topicId)
  if (params.difficulty) p.append('difficulty', params.difficulty)
  return axiosInstance.get(`/questions/count?${p.toString()}`)
}
export const startTest = (data) => axiosInstance.post('/tests/start', data)
export const submitTest = (id, data) => axiosInstance.post(`/tests/${id}/submit`, data)
export const getTestResult = (id) => axiosInstance.get(`/tests/${id}`)
export const getTestHistory = () => axiosInstance.get('/tests/history')