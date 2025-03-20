import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
import { Easing, Tween, update as updateTween } from 'tween';

const images = [
  'socrates.jpg',
  'stars.jpg',
  'wave.jpg',
  'spring.jpg',
  'mountain.jpg',
  'sunday.jpg'
];

const titles = [
  'The Death of Socrates',
  'Starry Night',
  'The Great Wave off Kanagawa',
  'Effect of Spring, Giverny',
  'Mount Corcoran',
  'A Sunday on La Grande Jatte'
];

const artists = [
  'Jacques-Louis David',
  'Vincent Van Gogh',
  'Katsushika Hokusai',
  'Claude Monet',
  'Albert Bierstadt',
  'George Seurat'
];

const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const rootNode =new THREE.Object3D()
scene.add(rootNode)

const leftArrowTexture = textureLoader.load(`left.png`);
const rightArrowTexture = textureLoader.load(`right.png`);



let count=6;
for(let i=0;i<count;i++)
{
  const texture = textureLoader.load(images[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  const baseNode = new THREE.Object3D();
  baseNode.rotation.y = i * (2*Math.PI / count);//same as 360/6 in radians 60*PI/180=PI/3; Pi =180 deg
  rootNode.add(baseNode)
  
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2,2.2,0.09),
    new THREE.MeshStandardMaterial({ color: 0x202020})
  )
  border.position.z =-4;
  baseNode.add(border);

  const artwork = new THREE.Mesh(
    new THREE.BoxGeometry(3,2,0.1),
    new THREE.MeshStandardMaterial({map: texture})
  );
  artwork.name = `Art_${i}`;
  artwork.position.z = -4;
  baseNode.add(artwork);

  const left = new THREE.Mesh(
    new THREE.BoxGeometry(0.3,0.3,0.01),
    new THREE.MeshStandardMaterial({map : leftArrowTexture , transparent:true})
  );
  left.name = `LeftArrow_${i}`
  left.userData = (i === count-1)? 0: (i+1);
  left.position.set(-1.8,0,-4);
  baseNode.add(left)

  const right = new THREE.Mesh(
    new THREE.BoxGeometry(0.3,0.3,0.01),
    new THREE.MeshStandardMaterial({map : rightArrowTexture , transparent:true})
  );
  right.name = `RightArrow_${i}`
  right.userData = (i === 0)?count-1:i-1;
  right.position.set(+1.8,0,-4);
  baseNode.add(right)
}


const spotlight = new THREE.SpotLight(0xffffff, 100.0, 10, 0.65, 1);
spotlight.position.set(0, 5, 0);
spotlight.target.position.set(0, 1, -5);
scene.add(spotlight);
scene.add(spotlight.target);

const mirror = new Reflector(
  new THREE.CircleGeometry(40, 64),
  {
    color: 0x505050,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,

  }
);

mirror.position.set(0, -1.1, 0);
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

scene.add(mirror);

function animate() {
  updateTween();
	renderer.render( scene, camera );

}

window.addEventListener('resize',()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  mirror.getRenderTarget().setSize(
    window.innerWidth,
    window.innerHeight
  );
});

function rotateGallery(direction, newIndex) {
  const deltaY = (direction * (2 * Math.PI / count));
  new Tween(rootNode.rotation)
  .to({y:rootNode.rotation.y + deltaY})
  .easing(Easing.Quadratic.InOut)
  .start()
  .onStart(()=>{
    document.getElementById('title').style.opacity =0;
    document.getElementById('artist').style.opacity = 0;
  })
  .onComplete(()=>{
    document.getElementById('title').innerText = titles[newIndex];
    document.getElementById('artist').innerText = artists[newIndex];
    document.getElementById('title').style.opacity =1;
    document.getElementById('artist').style.opacity = 1;
  })
}

window.addEventListener('click',(ev)=>{
  const raycaster = new THREE.Raycaster();

  const mouseNDC = new THREE.Vector2(
    (ev.clientX / window.innerWidth)*2 -1,
    -(ev.clientY / window.innerHeight)*2 +1,
  );

  raycaster.setFromCamera(mouseNDC, camera);

  const intersection = raycaster.intersectObject(rootNode,true);

  if(intersection.length>0)
  {
    const obj = intersection[0].object;
    const newIndex = obj.userData;
    if(intersection[0].object.name.startsWith('LeftArrow_')){
      rotateGallery(-1,newIndex);
    }
    if(intersection[0].object.name.startsWith('RightArrow_')){
      rotateGallery(1,newIndex)
    }
  }
});
document.getElementById('title').innerText = titles[0];
document.getElementById('artist').innerText = artists[0];