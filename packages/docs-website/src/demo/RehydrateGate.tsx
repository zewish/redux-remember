import type { FC, PropsWithChildren } from 'react';
import { useAppSelector } from './store/index.ts';

const RehydrateGate: FC<PropsWithChildren> = ({ children }) => {
  const isRehydrated = useAppSelector((state) => state.reduxRemember.isRehydrated);
  return isRehydrated
    ? children
    : <div>Rehydrating, please wait...</div>;
};

export default RehydrateGate;
