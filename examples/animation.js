/* global AFRAME, THREE */

/**
 * Player for animation clips. Intended to be compatible with any model format that supports
 * skeletal or morph animations.
 */
AFRAME.registerComponent('animation-control', {
  schema: {
    target: { type: 'string' },
    clip: { type: 'string' },

  },
  init: function () {
    let data = this.data;
    console.log(data);
    let el = this.el;
    let target = null;

    if (data.target) {
      target = document.querySelector(data.target);
      el.addEventListener('click', function () {
        target.setAttribute("animation-mixer", data);
      });
    }
  }
});