// BoxWithTexture.js
import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const BoxWithTexture = ({ url }) => {
  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

export default BoxWithTexture;


// RigidBoxWithTexture.js
// import React from 'react';
// import { useBox } from '@react-three/cannon';
// import { useLoader } from '@react-three/fiber';
// import * as THREE from 'three';

// const RigidBoxWithTexture = ({ url }) => {
//   const [ref] = useBox(() => ({ mass: 1 }));
//   const texture = useLoader(THREE.TextureLoader, url);

//   return (
//     <mesh ref={ref}>
//       <boxGeometry args={[2, 2, 2]} />
//       <meshStandardMaterial map={texture} />
//     </mesh>
//   );
// };

// export default RigidBoxWithTexture;