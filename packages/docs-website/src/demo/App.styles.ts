import type { CSSProperties } from 'react';

export const styles = {
  label: {
    display: 'block',
    fontWeight: 'bold',
    margin: '1rem 0 0 0',
  },
  input: {
    display: 'block',
    fontSize: '1.5rem',
  },
  row: {
    padding: '1rem 0',
    margin: '0'
  },
  p: {
    padding: '0.5rem 0 0 0',
    margin: '0',
  },
} satisfies Record<string, CSSProperties>;
