const WEIGHED_VOLUME_CONSTANT = 100
const WEIGHED_TIME_CONSTANT = 2

function isReliablePrice ({
  auctions,
  numAuctionToUse = 2,
  highVolumeThreshold = 1000
}) {
  return true
}

function getPrice ({
  auctions,
  numAuctionToUse = 2,
  highVolumeThreshold = 1000,
  volumeConstant = WEIGHED_VOLUME_CONSTANT,
  timeConstant = WEIGHED_TIME_CONSTANT
}) {
  console.log({ numAuctionToUse, highVolumeThreshold, volumeConstant, timeConstant })

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

export default {
  getPrice,
  formatPrice,
  isReliablePrice
}