import anime from 'animejs'
export function getCurrentPx (px) {
  let size = document.documentElement.style.fontSize
  size = size.replace(/px/i, '')
  return px / 75 * size
}
export default {
  anime,
  Coins: function coins () {
    anime({
      targets: '.coins-area .coin',
      translateY: [0, parseInt(getCurrentPx(20))],
      delay: function () { return anime.random(0, 600) },
      duration: 1000,
      direction: 'alternate',
      easing: 'linear',
      loop: true
    })
  },
  Bag: function bag () {
    if (bag.running) return
    bag.running = true
    anime({
      targets: '.activity-center .img-bag',
      easing: 'cubicBezier(.215,.61,.355,1)',
      duration: 1000,
      keyframes: [
        { scaleY: 0.93 },
        { scaleY: 1.06 },
        { scaleY: 0.96 },
        { scaleY: 1.02 },
        { scaleY: 0.98 },
        { scaleY: 1 }
      ],
      complete: function () {
        bag.running = false
      }
    })
  }
}
