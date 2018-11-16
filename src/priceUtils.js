const WEIGHED_VOLUME_CONSTANT = 100
const WEIGHED_TIME_CONSTANT = 2

// ALSO, the other problem to solve is. How to decide if we trust a price. I was thinking in using:
// - At least M high volume auctions in last N auctions
// - typical deviation small for N auctions
// - The “Trusted price” differ less than XX% from the last price

function isReliablePrice ({
  auctions,
  numAuctionToUse = 2,
  minNumOfHighVolumeAuctions = 1,
  highVolumeThreshold = 1000
}) {
  console.log('isReliablePrice', { numAuctionToUse, minNumOfHighVolumeAuctions, highVolumeThreshold })
  const usedAuctions = auctions.slice(0, numAuctionToUse)
  const numOfHighVolumeAuctions = usedAuctions.reduce((count, { auctionIndex, price, volume }, index) => {
    if (volume > highVolumeThreshold) {
      return count + 1
    } else {
      return count
    }
  }, 0)

  const isReliable = numOfHighVolumeAuctions >= minNumOfHighVolumeAuctions
  console.log('numOfHighVolumeAuctions: %s - Reliable: %s', numOfHighVolumeAuctions, isReliable)

  return isReliable
}

function isReliablePriceMock () {
  return true
}

function getPrice ({
  auctions,
  numAuctionToUse = 2,
  highVolumeThreshold = 1000,
  volumeConstant = WEIGHED_VOLUME_CONSTANT,
  timeConstant = WEIGHED_TIME_CONSTANT
}) {
  console.log('getPrice', { numAuctionToUse, highVolumeThreshold, volumeConstant, timeConstant })

  let numerator = 0
  let denominator = 0
  const usedAuctions = auctions.slice(0, numAuctionToUse)

  usedAuctions.forEach(({ auctionIndex, price, volume }, index) => {
    if (volume > highVolumeThreshold) {
      const weight = volume * (
        Math.pow(volumeConstant, numAuctionToUse) +
        timeConstant * Math.pow(timeConstant, numAuctionToUse - index)
      )
      console.log('[%d] %d - weight: %s, price: %s', auctionIndex, numAuctionToUse - index, weight, price)
      numerator += price * weight
      denominator += weight
    }
  })

  console.log(numerator, denominator)

  return {
    numerator,
    denominator
  }
}


function formatPrice ({
  numerator,
  denominator
}) {
  if (denominator === 0) {
    return 0
  } else {
    return (numerator / denominator).toFixed(2)
  }
}

function getPriceMock () {
  return {
    numerator: 1340,
    denominator: 5
  }
}

export default {
  // Price functions
  getPrice,
  getPriceMock,

  // Is reliable price functions
  isReliablePrice,
  isReliablePriceMock,

  // Formatter
  formatPrice
}