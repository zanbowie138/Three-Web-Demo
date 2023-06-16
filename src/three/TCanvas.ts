import * as THREE from 'three'
import {gl} from './WebGL'
import * as CANNON from 'cannon-es'
import Stats from 'three/examples/jsm/libs/stats.module'


export class TCanvas {
    private world: CANNON.World

    private meshes: Array<THREE.Mesh>
    private bodies: Array<CANNON.Body>

    private raycaster: THREE.Raycaster
    private pointer: THREE.Vector2

    private stats: Stats

    private frame: number

    constructor(private container: HTMLElement) {
        this.initCanvas();
        this.createObjects();
        gl.requestAnimationFrame(this.anim)
    }

    private initCanvas() {
        gl.setup(this.container)
        gl.camera.position.z = 5.5;
        this.frame = 0;
    }

    private createObjects() {    
      this.meshes = new Array<THREE.Mesh>()
      this.bodies = new Array<CANNON.Body>()

      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)

      // Setup our physics world
      this.world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
      })

      this.world.broadphase = new CANNON.SAPBroadphase(this.world);
      (this.world.broadphase as CANNON.SAPBroadphase).axisIndex = 2

      // Create a static plane for the ground
      const plane_size = 5;
      const plane_depth = 10;
      const groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC, // can also be achieved by setting the mass to 0
        shape: new CANNON.Box(new CANNON.Vec3(plane_size/2, plane_size/2, plane_depth)),
      })
      groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
      groundBody.position.set(0,-1-(plane_depth),0)
      this.world.addBody(groundBody)

      // Walls
      // const pos_x = new CANNON.Body({
      //   type: CANNON.Body.STATIC, 
      //   shape: new CANNON.Plane(),
      // })
      // pos_x.position.set(wall_dist, 0, 0)
      // pos_x.quaternion.setFromEuler(0, -Math.PI / 2, 0) // make it face up
      // this.world.addBody(pos_x)


      // const neg_x = new CANNON.Body({
      //   type: CANNON.Body.STATIC, 
      //   shape: new CANNON.Plane(),
      // })
      // neg_x.position.set(-wall_dist, 0, 0)
      // neg_x.quaternion.setFromEuler(0, Math.PI / 2, 0) // make it face up
      // this.world.addBody(neg_x)

      // const pos_z = new CANNON.Body({
      //   type: CANNON.Body.STATIC, 
      //   shape: new CANNON.Plane(),
      // })
      // pos_z.position.set(0, 0, wall_dist)
      // pos_z.quaternion.setFromEuler(0, Math.PI, 0) // make it face up
      // this.world.addBody(pos_z)

      // const neg_z = new CANNON.Body({
      //   type: CANNON.Body.STATIC, 
      //   shape: new CANNON.Plane(),
      // })
      // neg_z.position.set(0, 0, -wall_dist)
      // neg_z.quaternion.setFromEuler(0, 0, 0) // make it face up
      // this.world.addBody(neg_z)

      
      const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 1);
      const planeHelper = new THREE.PlaneHelper( plane, plane_size, 0xe38a20 );
      gl.scene.add(planeHelper);

      // Raycaster for mouse interaction
      this.raycaster = new THREE.Raycaster()
      this.pointer = new THREE.Vector2()
      window.addEventListener('mousemove', (event) => {
        this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      })
    }

    private addSphere() {
      const radius = 0.1
      const geometry = new THREE.SphereGeometry(radius)
      const material = new THREE.MeshNormalMaterial()

      // Create a sphere body
      const sphereBody = new CANNON.Body({
        mass: 5, // kg
        shape: new CANNON.Sphere(radius),
      })
      sphereBody.position.set(THREE.MathUtils.randFloatSpread(2), 10 + THREE.MathUtils.randFloatSpread(5), THREE.MathUtils.randFloatSpread(2)) // m
      this.world.addBody(sphereBody)
      this.bodies.push(sphereBody);

      const sphereMesh = new THREE.Mesh(geometry, material)
      sphereMesh.name = this.meshes.length
      this.meshes.push(sphereMesh);
      gl.scene.add(sphereMesh);
    }
  
    // ----------------------------------
    // animation
    private anim = () => {
      this.world.step(1/60, gl.time.delta, 10);

      if (gl.time.elapsed > this.bodies.length * 0.01 && this.bodies.length < 100) {
        this.addSphere()
      }

      for (var index in this.bodies) {
        if (this.meshes[index].position.y < -4) {
          this.bodies[index].position.set(THREE.MathUtils.randFloatSpread(2), 10 + THREE.MathUtils.randFloatSpread(5), THREE.MathUtils.randFloatSpread(2))
          this.bodies[index].velocity.setZero()
        }

        this.meshes[index].position.copy(this.bodies[index].position);
        this.meshes[index].quaternion.copy(this.bodies[index].quaternion);
      }

      // update the picking ray with the camera and pointer position
      this.raycaster.setFromCamera(this.pointer, gl.camera );

      // Cast a ray from where the mouse is pointing and
      // see if we hit something
      const intersects = this.raycaster.intersectObjects( this.meshes, false );

      // Return if no object was hit
      for (var i in intersects)
      {
        this.bodies[intersects[i].object.name].applyForce(this.raycaster.ray.direction.normalize().multiplyScalar(3000), intersects[0].point)
      }

      this.frame++;

      this.stats.update()

      gl.render()
    }
  
    // ----------------------------------
    // dispose
    dispose() {
      gl.dispose()
    }
}