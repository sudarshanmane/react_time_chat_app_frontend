import { useRef, useEffect } from "react";
import debounce from "lodash.debounce";

export default function useDebounce(fn, delay = 300) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debouncedRef = useRef(null);

  useEffect(() => {
    debouncedRef.current = debounce((...args) => fnRef.current(...args), delay);
    return () => {
      debouncedRef.current &&
        debouncedRef.current.cancel &&
        debouncedRef.current.cancel();
    };
  }, [delay]);

  return debouncedRef.current;
}
