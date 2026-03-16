import { useState, useEffect } from 'react';

/**
 * A custom hook that returns a debounced version of the provided value.
 * @param {any} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds (default: 500ms).
 * @returns {any} - The debounced value.
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
