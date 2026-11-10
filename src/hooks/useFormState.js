import { useCallback, useRef, useState } from 'react'

export function useFormState(initialValues) {
  const initialRef = useRef(initialValues)
  const [values, setValues] = useState(initialValues)

  const setField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
  }, [])

  const reset = useCallback((nextValues = initialRef.current) => {
    setValues(nextValues)
  }, [])

  return { values, setField, setValues, reset }
}
