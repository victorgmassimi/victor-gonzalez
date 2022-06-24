import './style.css'

import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import * as dat from 'dat.gui';

import gsap from 'gsap';

const PLANE_RGB = {
  r:0.1,
  g:0.1,
  b:0.30
}

const HOVER_RGB = {
  r:0,
  g:1,
  b:0.9
}

const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50
  },
  color:{
    r:HOVER_RGB.r,
    g:HOVER_RGB.g,
    b:HOVER_RGB.b
  }
}

function generatePlane(){
  plane.geometry.dispose()
  plane.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments,
    
  )

  // vertice position randomization
  const {array} = plane.geometry.attributes.position;
  const randomValues = []
  for (let i = 0; i < array.length; i++) {
    if(i % 3 === 0) {  
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3
      array[i + 1] = y + (Math.random() - 0.5) * 3
      array[i + 2] = z + (Math.random() - 0.5) * 3
    }
      
    randomValues.push((Math.random() -0.5) * 10) 
  }
  plane.geometry.attributes.position.originalPosition = array
  plane.geometry.attributes.position.randomValues = randomValues
    
  colorVertices()

}

//Add vertex color atribute to the plane
function colorVertices(){
  const color = []
  for (let i = 0; i < plane.geometry.attributes.position.count; i++) {
    color.push(PLANE_RGB.r, PLANE_RGB.g, PLANE_RGB.b)
    
  }

  plane.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(color),3))
}

function updateRGB() {
  HOVER_RGB.r = world.color.r
  HOVER_RGB.g = world.color.g
  HOVER_RGB.b = world.color.b
}
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane);
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane);
gui.add(world.plane, 'widthSegments', 10, 100).onChange(generatePlane);
gui.add(world.plane, 'heightSegments', 10, 100).onChange(generatePlane);
gui.add(world.color, 'r', 0, 1).onChange(updateRGB);
gui.add(world.color, 'g', 0, 1).onChange(updateRGB);
gui.add(world.color, 'b', 0, 1).onChange(updateRGB);



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const raycaster = new THREE.Raycaster()
const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector('#c'),

});
const controls = new OrbitControls(camera,renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize (window.innerWidth, window.innerHeight);
camera.position.set(0, -35, 90);

const width = world.plane.width;
const widthSegments = world.plane.widthSegments;
const height = world.plane.height;
const heightSegments = world.plane.heightSegments;
const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
const material = new THREE.MeshPhongMaterial({

  flatShading: THREE.FlatShading,
  vertexColors: true
});
const plane = new THREE.Mesh(geometry,material);
scene.add(plane);
generatePlane()






const light = new THREE.SpotLight(0xADD8E6, 1);
light.position.set(0,-200,200);
const lightHelper = new THREE.SpotLightHelper(light,0xff0000)
scene.add(light);






// animate function
let frame = 0
function animate () {
  requestAnimationFrame(animate);
  frame += 0.01
  controls.update();
  renderer.render(scene, camera);

  //Hover effect
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(plane)
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes
    const hoverColor ={
      r:HOVER_RGB.r,
      g:HOVER_RGB.g,
      b:HOVER_RGB.b
    }
    const initialColor = {
      r:PLANE_RGB.r,
      g:PLANE_RGB.g,
      b:PLANE_RGB.b
    }
    //vertice 1
    color.setX(intersects[0].face.a, hoverColor.r)
    color.setY(intersects[0].face.a, hoverColor.g)
    color.setZ(intersects[0].face.a, hoverColor.b)
    //vertice 2
    color.setX(intersects[0].face.b, hoverColor.r)
    color.setY(intersects[0].face.b, hoverColor.g)
    color.setZ(intersects[0].face.b, hoverColor.b)
    //vertice 3
    color.setX(intersects[0].face.c, hoverColor.r)
    color.setY(intersects[0].face.c, hoverColor.g)
    color.setZ(intersects[0].face.c, hoverColor.b)
    //update color
    intersects[0].object.geometry.attributes.color.needsUpdate = true

    
    gsap.to(hoverColor,{
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)
        color.setX(intersects[0].face.a, hoverColor.r)
        //vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)
        //vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
        color.needsUpdate = true
      }
    })
  }

  //animate vertices
  const {array, originalPosition,randomValues} = plane.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    // X
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.015
    // Y
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.015
  }
  plane.geometry.attributes.position.needsUpdate = true
}



//events
const mouse = {
  x: undefined,
  y: undefined
}
addEventListener('mousemove', (event) =>{
  mouse.x = (event.clientX / innerWidth) * 2 - 1 //Normalize coordenates to be 0,0 at the center.
  mouse.y = (event.clientY / innerHeight) * -2 +1

})

// animate function call
animate();