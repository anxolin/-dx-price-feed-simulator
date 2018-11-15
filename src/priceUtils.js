const WEIGHED_VOLUME_CONSTANT = 10
const WEIGHED_TIME_CONSTANT = 10000000

function getPrice ({
  auctions,
  numAuctionToUse = 10,
  highVolumeThreshold = 1000
}) {
  let numerator = 0
  let denominator = 0
  auctions.forEach(({ auctionIndex, price, volume }, index) => {
    if (volume > highVolumeThreshold) {
      const weight = volume * (
        WEIGHED_VOLUME_CONSTANT * Math.pow(numAuctionToUse, 2) +
        WEIGHED_TIME_CONSTANT + Math.pow(numAuctionToUse - index, 2)
      )
      // console.log('weight: ', weight)
      numerator += price * weight
      denominator += weight
    }
  })

  // console.log(numerator, denominator)

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
  formatPrice
}