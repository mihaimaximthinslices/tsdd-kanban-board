import axios from 'axios'
import { useState, useEffect } from 'react'

const useAxiosIntercept = (urlToTrack: string) => {
  const [isMakingRequest, setIsMakingRequest] = useState(false)

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (config.url === urlToTrack) {
          setIsMakingRequest(true)
        }
        return config
      },
      (error) => {
        if (error.config.url === urlToTrack) {
          setIsMakingRequest(false)
        }
        return Promise.reject(error)
      },
    )

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        if (response.config.url === urlToTrack) {
          setIsMakingRequest(false)
        }
        return response
      },
      (error) => {
        if (error.config.url === urlToTrack) {
          setIsMakingRequest(false)
        }
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [urlToTrack])

  return { isMakingRequest }
}

export default useAxiosIntercept
