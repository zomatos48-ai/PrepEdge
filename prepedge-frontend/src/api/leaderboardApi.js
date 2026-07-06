import axiosInstance from './axiosInstance'
export const getLeaderboard = (college) =>
  axiosInstance.get('/leaderboard' + (college ? `?college=${college}` : ''))