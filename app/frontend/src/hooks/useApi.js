import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi(fetcher, deps = [], options = {}) {
  const { immediate = true, defaultValue = null } = options
  const [data, setData] = useState(defaultValue)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetcher(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

// For paginated data
export function usePaginatedApi(fetcher, initialParams = {}) {
  const [params, setParams] = useState(initialParams)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetcher(params)
      .then(result => { if (!cancelled) { setData(result); setLoading(false) } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false) } })

    return () => { cancelled = true }
  }, [JSON.stringify(params)])

  return { data, loading, error, params, setParams }
}
