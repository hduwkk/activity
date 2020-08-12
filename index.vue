<template>
  <div class="antForest">
    <div class="activity-center">
      <transition-group name="list" class="coins-area" v-bind:css="false" v-on:leave="leave">
        <div class="coin" v-for="paopao in paopaoList" :key="paopao.id"
          :style="paopao | styleFormat" @click="paopaoClick(paopao, $event)">
          <div class="coin-ball">{{paopao.id}}</div>
        </div>
      </transition-group>
      <div class="bag-box">
        <div class="img-bag" ref="bag"></div>
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable camelcase */
import Drawer from './draw'
import Animes, { getCurrentPx } from './animate'

export default {
  data () {
    return {
      paopaoList: []
    }
  },
  filters: {
    styleFormat (item) {
      return `left: ${item.x}px; top: ${item.y}px;`
    }
  },
  mounted () {
    this.$nextTick(() => {
      const drawer = new Drawer({
        radius: getCurrentPx(50),
        container: '.coins-area'
      })
      drawer.init(20)
      console.log(`**** count: ${drawer.count} ****`)
      this.paopaoList = drawer.result
      this.$nextTick(() => {
        Animes.Coins()
      })
    })
  },
  methods: {
    leave (el, done) {
      const translateX = this.delta.x + getCurrentPx(140)
      const translateY = this.delta.y - getCurrentPx(70)
      Animes.anime({
        targets: el,
        easing: 'easeInQuad',
        translateX: {
          value: translateX,
          easing: 'linear'
        },
        translateY: {
          value: translateY
        },
        scale: {
          value: 0.5,
          delay: 300,
          duration: 200
        },
        opacity: {
          value: 0.6,
          easing: 'linear'
        },
        duration: 500,
        complete: () => {
          Animes.anime.remove(el)
          Animes.Bag()
          done()
        }
      })
    },
    async paopaoClick (item, e) {
      if (item.hidden) return
      item.hidden = true
      const { left: bX, top: bY } = this.$refs.bag.getBoundingClientRect()
      const { left: tX, top: tY } = e.currentTarget.getBoundingClientRect()

      let translateY = Animes.anime.get(e.currentTarget, 'translateY', 'px')
      translateY = translateY.replace('px', '')

      e.currentTarget.style.zIndex = '99'
      this.delta = {
        x: bX - tX,
        y: bY - tY + Number(translateY)
      }

      const i = this.paopaoList.indexOf(item)
      Animes.anime.remove(e.currentTarget)
      this.paopaoList.splice(i, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.antForest {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  overflow: hidden;
  /** 气泡区域 */
  .coins-area {
    position: absolute;
    left: 50px;
    right: 50px;
    top: 240px;
    height: 345px;
    background-color: rgba(255, 255, 255, 0.3);
  }
  .coin {
    list-style: none;
    position: absolute;
    z-index: 30;
    width: 100px;
    height: 100px;
    .coin-ball {
      position: relative;
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
      font-size: 30px;
      font-weight: 500;
      color: rgb(7, 6, 5);
      background: #fff;
      &::after {
        content: '';
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
        background-color: rgba(91, 223, 135, 0.3);
      }
    }
  }
}
.activity-center {
  position: relative;
  overflow: hidden;
  padding-top: 50px;
  height: 1160px;
  background: linear-gradient(to bottom, #45b0fe 0%, #fff 100%);
  /** 袋子 */
  .bag-box {
    margin-top: 605px;
    width: 100%;
  }
  .img-bag {
    width: 361px;
    height: 339px;
    border-radius: 50%;
    background-color: rgb(233, 238, 165);
    transform-origin: center bottom;
    margin: 0 auto;
  }
}
</style>
