
//-------------------------------------------------//

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.min.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.min.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.min.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.min.js';
import { MaskPass, ClearMaskPass } from 'three/addons/postprocessing/MaskPass.min.js';

//set size
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  
};

//create scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000); //can see everything
camera.position.z = 30;

const canvas = document.querySelector("#solar");
const render = new THREE.WebGLRenderer({
 canvas, antialias: true});
render.setPixelRatio(window.devicePixelRatio);
render.setSize(sizes.width, sizes.height);
render.autoClear = false;

// camera.position.setZ(30);
// render.render(scene, camera);

const Bloom_Layer = 1;

const bloomComposer = new EffectComposer(render);
bloomComposer.setSize(sizes.width, sizes.height);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.25;
bloomPass.radius = 1.5;

bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

//sun mesh with bloom
const geo_sun = new THREE.SphereGeometry( 3, 64, 32 );

//sun texture
const sunTexture = new THREE.TextureLoader().load('https://pbs.twimg.com/media/EkzcC0-VkAACqhz?format=jpg&name=medium');

var material_sun = new THREE.MeshStandardMaterial( { color: 0xF6F1D5, emissive: new THREE.Color( 0xff1d02 ), map: sunTexture});

material_sun.emissiveIntensity = 1.2;

// material.blending = THREE.AdditiveBlending;
// material.transparent = true; //makes the shadow behind
// material.opacity = 1.0;

const mesh_sun = new THREE.Mesh( geo_sun, material_sun );
//mesh_sun.castShadow = true;
mesh_sun.layers.enable( Bloom_Layer );

scene.add( mesh_sun );

//moon mesh
const geo_moon = new THREE.SphereGeometry( 1.95, 64, 32 );

//moon texture
const moonTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg');

var material_moon = new THREE.MeshBasicMaterial({ color: 0x22222, map: moonTexture});

const mesh_moon = new THREE.Mesh( geo_moon, material_moon );
mesh_moon.position.set( 4, 0, 10 );
mesh_moon.layers.enable( Bloom_Layer );

mesh_sun.add( mesh_moon );

//add light
const light = new THREE.DirectionalLight( 0xffffff, 2 ); //hex code
light.position.copy( mesh_sun.position.clone() );
const ambient = new THREE.AmbientLight( 0x101010, 4.8 );
ambient.intensity = 10;
ambient.position.copy( mesh_moon.position );
// light.position.set( 3, 3, 23 );
light.position.set( 7, 15, 8 );
light.castShadow = true;
scene.add( light, ambient );
light.shadow.camera.near = 0.5;

// orbit controls
const controls1 = new OrbitControls( camera, canvas );
controls1.enableDamping = true;
controls1.enablePan = false;
controls1.enableZoom = false;
controls1.autoRotate = true;
controls1.autoRotateSpeed = -0.105;

const controls = new OrbitControls( camera, render.domElement );
controls.target.z = 10;
const par = new THREE.Object3D();

function addStars() {
  const color = 0xffffff;
  const geo = new THREE.SphereGeometry( 0.09, 32, 32 );
  const mat = new THREE.MeshBasicMaterial( { color: color } )
  
  for( var i = 0; i< 200; i++ ){
     const star = new THREE.Mesh( geo, mat );
     star.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
    star.position.multiplyScalar( 90 + ( Math.random() * 40 ));
    //star.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
    star.layers.enable( Bloom_Layer );
    par.add( star );
  }
 
  scene.add( par );
}

Array( 20 ).fill().forEach( addStars );
//mesh of geo and material
//then add to scene and render
//hence use a func loop to keep calling the renderer


window.addEventListener( "resize", function() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width/sizes.height;
  camera.updateProjectionMatrix();
  render.setSize( sizes.width, sizes.height );
  bloomComposer.setSize( sizes.width, sizes.height );
});



//renderbloom

function renderBloomLayer(){
  camera.layers.set( Bloom_Layer );
  bloomComposer.render();
  camera.layers.set( 0 );
}

function animate(){
  controls.update();
  controls1.update();

  mesh_sun.rotation.y -= .00025;
  mesh_moon.rotation.y += .0025;
  //par.rotation.y -= .000005;
  
  // render.clear();
  render.clear();
  camera.layers.set( 0 );
  //render.render( scene, camera );

  //render bloom
  camera.layers.set( 1 );
  bloomComposer.render();

  requestAnimationFrame( animate );


}

animate(); 