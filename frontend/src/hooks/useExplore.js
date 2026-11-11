import { useContext } from 'react';
import { ExploreContext } from '../context/ExploreContext';

export const useExplore = () => {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error('useExplore must be used within an ExploreProvider');
  }
  return context;
};

export default useExplore;
