import { FC, PropsWithChildren } from 'react';
import { useAppSelector } from './store';

const RehydrateGate: FC<PropsWithChildren> = ({ children }) => {
  const isRehydrated = useAppSelector((state) => state.reduxRemember.isRehyrdated);
  return isRehydrated
    ? children
    : <div>Rehydrating, please wait...</div>;
};

export default RehydrateGate;
