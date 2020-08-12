/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
/** 洗牌 */
// function shuffle (array) {
//   let currentIndex = array.length
//   let temporaryValue
//   let randomIndex
//   while (currentIndex > 0) {
//     randomIndex = Math.floor(Math.random() * currentIndex)
//     currentIndex--

//     temporaryValue = array[currentIndex]
//     array[currentIndex] = array[randomIndex]
//     array[randomIndex] = temporaryValue
//   }
//   return array
// }
/* 获得介于两数之间的随机数字 */
function rnd (min, max) {
  if (min > max) {
    min = [max, (max = min)][0]
  }
  return Math.random() * (max - min) + min
}

// [{x0, x1}] 'x0' 'x1'
function rndAmong (itemList, isX) {
  let len = 0
  const { m, n } = isX ? { m: 'x0', n: 'x1' } : { m: 'y0', n: 'y1' }
  itemList.forEach(item => {
    if (isX) {
      if (item.y && item.y.length) {
        len = len + item[n] - item[m]
      }
    } else {
      len = len + item[n] - item[m]
    }
  })
  if (len === 0) return null
  len = rnd(0, len)
  let value
  let item
  for (let i = 0; i < itemList.length; i++) {
    const item_i = { ...itemList[i] }
    if (isX && !item_i.y.length) continue
    const delta = item_i[n] - item_i[m]
    if (delta >= len) {
      value = item_i[m] + len
      item = item_i
      break
    } else {
      len = len - delta
    }
  }
  return {
    value,
    item
  }
}
function getRangeRelationship (rangeA, rangeB) {
  switch (true) {
    case (rangeA[0] <= rangeB[0]) && rangeA[1] >= rangeB[1]: return 'contains'
    case (rangeB[0] <= rangeA[0]) && rangeB[1] >= rangeA[1]: return '_contains'
    case (rangeA[1] <= rangeB[0] || rangeA[0] >= rangeB[1]): return 'apart'
    case (rangeA[0] < rangeB[0] && rangeA[1] > rangeB[0]): return 'a^b'
    case (rangeB[0] < rangeA[0] && rangeB[1] > rangeA[0]): return 'b^a'
  }
}

// [{y0, y1}] [{y0, y1}]
// [{y0: 0, y1: 10}, {y0: 20, y1: 30}] [{y0: 0, y1: 100}]
// [{y0: 0, y1: 100}] [{y0: 0, y1: 10}, {y0: 20, y1: 30}]
// [{y0: 10, y1: 20}, {y1: 30, y1: 60}] [{y0: 5, y1: 12}, {y0: 13, y1: 18}, {y0: 35, y1: 65}]
function yMerge (yAs, yBs) {
  const result = []
  yAs.forEach((rangeA) => {
    let rangeB
    let relationship
    for (let i = 0; i < yBs.length; i++) {
      rangeB = yBs[i]
      relationship = getRangeRelationship([rangeA.y0, rangeA.y1], [rangeB.y0, rangeB.y1])
      if (relationship === 'contains') {
        result.push({ ...rangeB })
      } else if (relationship === '_contains') {
        result.push({ ...rangeA })
        break
      } else if (relationship === 'a^b') {
        result.push({ y0: rangeB.y0, y1: rangeA.y1 })
        break
      } else if (relationship === 'b^a') {
        result.push({ y0: rangeA.y0, y1: rangeB.y1 })
      }
    }
  })
  return result
}

// eslint-disable-next-line no-unused-vars
function isOverLap (ballA, ballB, radius) {
  const deltaX = ballA.x - ballB.x
  const deltaY = ballA.y - ballB.y
  return deltaX * deltaX + deltaY * deltaY < radius * radius * 4
}

export default class Drawer {
  constructor ({ radius, container }) {
    container = document.querySelector(container)
    const { width: cWidth, height: cHeight } = container.getBoundingClientRect()

    this.validAreas = {
      x: {
        min: radius,
        max: Math.floor(cWidth - radius)
      },
      y: {
        min: radius,
        max: Math.floor(cHeight - radius)
      }
    }
    this.freeAreas = [
      { x0: this.validAreas.x.min, x1: this.validAreas.x.max, y: [{ y0: this.validAreas.y.min, y1: this.validAreas.y.max, len: this.validAreas.y.max - this.validAreas.y.min }] }
    ]
    this.radius = radius
    this.ballList = []
    this.result = []
  }

  init (n) {
    this.count = 0
    // const dd = [{ x: 230, y: 191 }, { x: 265, y: 82 }, {}, {}]
    while (this.ballList.length < n) {
      if (this.count >= 1000 || this.fullfilled) break
      this.createABall()
      this.count += 1
    }
    this.getResult()
  }

  getResult () {
    this.ballList.forEach((ball) => {
      this.result.push({
        ...ball,
        x: ball.x - this.radius,
        y: ball.y - this.radius
      })
    })
  }

  createXY () {
    const xobj = rndAmong(this.freeAreas, true)
    if (xobj === null) {
      this.fullfilled = true
      console.log(this.count, 'fullfilled..........................')
      return { x: null, y: null }
    }
    const yobj = rndAmong(xobj.item.y, false)
    return {
      x: xobj.value,
      y: yobj.value
    }
  }

  createABall () {
    const { x, y } = this.createXY()
    if (x === null) return
    // const isOk = this.ballList.every(ball => {
    //   return !isOverLap({ x, y }, ball, this.radius)
    // })
    const isOk = true
    if (isOk) {
      this.ballList.push({ x, y, id: this.ballList.length })
      const d = this.radius * 2 * 1
      this.changeFreeAreas({ x0: x - d, x1: x + d, y0: y - d, y1: y + d })
    }
  }

  changeFreeAreas ({ x0, x1, y0, y1 }) {
    const { min: xMin, max: xMax } = this.validAreas.x
    const { min: yMin, max: yMax } = this.validAreas.y
    const y = []
    x0 = x0 < xMin ? xMin : x0
    x1 = x1 > xMax ? xMax : x1
    if (y0 > yMin) {
      y.push({ y0: yMin, y1: y0, len: y0 - yMin })
    }
    if (y1 < yMax) {
      y.push({ y0: y1, y1: yMax, len: yMax - y1 })
    }
    const result = []
    let areaA
    const areaB = { x0, x1, y: y }
    let xIndex = -Infinity
    let relationship
    for (let i = 0; i < this.freeAreas.length; i++) {
      areaA = this.freeAreas[i]
      if (xIndex > areaB.x1) {
        result.push(areaA)
        xIndex = areaA.x1
        continue
      }
      relationship = getRangeRelationship([areaA.x0, areaA.x1], [areaB.x0, areaB.x1])
      if (relationship === 'contains') {
        areaB.x0 > areaA.x0 && result.push({ x0: areaA.x0, x1: areaB.x0, y: areaA.y })
        areaB.x1 > areaB.x0 && result.push({ x0: areaB.x0, x1: areaB.x1, y: yMerge(areaA.y, areaB.y) })
        areaA.x1 > areaB.x1 && result.push({ x0: areaB.x1, x1: areaA.x1, y: areaA.y })
        console.log('*** contains ***')
      } else if (relationship === '_contains') {
        // 不会出现的情况
        console.log('### _contains ###')
        if (areaB.x0 > xIndex && areaA.x0 > areaB.x0) {
          result.push({ x0: areaB.x0, x1: areaA.x0, y: areaB.y })
        }
        result.push({ x0: areaA.x0, x1: areaA.x1, y: yMerge(areaA.y, areaB.y) })
      } else if (relationship === 'a^b') {
        console.log('*** a交b ***')
        result.push({ x0: areaA.x0, x1: areaB.x0, y: areaA.y })
        result.push({ x0: areaB.x0, x1: areaA.x1, y: yMerge(areaA.y, areaB.y) })
        // result.push({ x0: areaA.x1, x1: areaB.x1, y: areaB.y })
      } else if (relationship === 'b^a') {
        console.log('*** b交a ***')

        areaB.x0 > xIndex && result.push({ x0: areaB.x0, x1: areaA.x0, y: areaB.y })
        result.push({ x0: areaA.x0, x1: areaB.x1, y: yMerge(areaA.y, areaB.y) })
        result.push({ x0: areaB.x1, x1: areaA.x1, y: areaA.y })
      } else if (relationship === 'apart') {
        result.push(areaA)
      }
      xIndex = areaA.x1
    }
    console.log([...result])
    result.sort((a, b) => a.x0 - b.x0)
    this.freeAreas = result
  }
}
