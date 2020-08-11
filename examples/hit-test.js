// See also https://github.com/aframevr/aframe/pull/4356 still open as of 11.08.2020
AFRAME.registerComponent("hide-in-ar-mode", {
  // Set this object invisible while in AR mode.
  init: function () {
    this.el.sceneEl.addEventListener("enter-vr", (ev) => {
      this.wasVisible = this.el.getAttribute("visible");
      if (this.el.sceneEl.is("ar-mode")) {
        this.el.setAttribute("visible", false);
      }
    });
    this.el.sceneEl.addEventListener("exit-vr", (ev) => {
      if (this.wasVisible) this.el.setAttribute("visible", true);
    });
  },
});

AFRAME.registerComponent("ar-shadows", {
  // Swap an object's material to a transparent shadows-only material while
  // in AR mode. Intended for use with a ground plane. The object is also
  // set visible while in AR mode, this is useful if it's hidden in other
  // modes due to them using a 3D environment.
  schema: {
    opacity: { default: 0.3 },
  },
  init: function () {
    this.el.sceneEl.addEventListener("enter-vr", (ev) => {
      this.wasVisible = this.el.getAttribute("visible");
      if (this.el.sceneEl.is("ar-mode")) {
        this.savedMaterial = this.el.object3D.children[0].material;
        this.el.object3D.children[0].material = new THREE.ShadowMaterial();
        this.el.object3D.children[0].material.opacity = this.data.opacity;
        this.el.setAttribute("visible", true);
      }
    });
    this.el.sceneEl.addEventListener("exit-vr", (ev) => {
      if (this.savedMaterial) {
        this.el.object3D.children[0].material = this.savedMaterial;
        this.savedMaterial = null;
      }
      if (!this.wasVisible) this.el.setAttribute("visible", false);
    });
  },
});

AFRAME.registerComponent("ar-hit-test", {
  init: function () {
    this.xrHitTestSource = null;
    this.viewerSpace = null;
    this.refSpace = null;

    this.el.sceneEl.renderer.xr.addEventListener("sessionend", (ev) => {
      this.viewerSpace = null;
      this.refSpace = null;
      this.xrHitTestSource = null;
    });
    this.el.sceneEl.renderer.xr.addEventListener("sessionstart", (ev) => {
      let session = this.el.sceneEl.renderer.xr.getSession();

      let element = this.el;
      session.addEventListener("select", function () {
        let position = element.getAttribute("position");

        document.getElementById("bench").setAttribute("position", {
          x: position.x,
          y: position.y - 2,
          z: position.z
        });
        document.getElementById("light").setAttribute("position", {
          x: position.x - 2,
          y: position.y + 4,
          z: position.z + 2,
        });
      });

      session.requestReferenceSpace("viewer").then((space) => {
        this.viewerSpace = space;
        session
          .requestHitTestSource({ space: this.viewerSpace })
          .then((hitTestSource) => {
            this.xrHitTestSource = hitTestSource;
          });
      });

      session.requestReferenceSpace("local-floor").then((space) => {
        this.refSpace = space;
      });
    });
  },
  tick: function () {
    if (this.el.sceneEl.is("ar-mode")) {
      if (!this.viewerSpace) return;

      let frame = this.el.sceneEl.frame;
      let xrViewerPose = frame.getViewerPose(this.refSpace);

      if (this.xrHitTestSource && xrViewerPose) {
        let hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
        if (hitTestResults.length > 0) {
          let pose = hitTestResults[0].getPose(this.refSpace);

          let inputMat = new THREE.Matrix4();
          inputMat.fromArray(pose.transform.matrix);

          let position = new THREE.Vector3();
          position.setFromMatrixPosition(inputMat);
          this.el.setAttribute("position", position);
        }
      }
    }
  },
});
