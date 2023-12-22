import { useEffect, DependencyList } from 'react';


function useEffectX(callback: () => void,
dependencies?: DependencyList) {
 // Call the callback immediately
 callback();

 // Then call it again whenever any dependency changes
 useEffect(() => {
   callback();
 }, dependencies);
}

export default useEffectX;
