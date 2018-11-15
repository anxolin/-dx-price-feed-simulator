import React, { Component } from 'react'
const AUCTIONS = 15

const REFERENCE_VALUES = {
  price: {
    low: 25,
    avg: 200,
    high: 1000
  },
  volume: {
    low: 1300,
    avg: 5000,
    high: 30000
  }
}
const PERCENTAGE_RANDOMNES = 20

class PriceSimulator extends Component {
  state = {
    auctions: []
  }

  componentDidMount () {
    const auctions = []
    for (let i =0; i < AUCTIONS; i++) {
      auctions.push({
        auctionIndex: 100 + AUCTIONS - i,
        volume: 0,
        price: 0
      })
    }

    this.setState({ auctions })
  }

  onChangePrice = (auctionIndex, newPrice) => {
    this.onChangeFloatProp(auctionIndex, newPrice, 'price')
  }

  onChangeVolume = (auctionIndex, newPrice) => {
    this.onChangeFloatProp(auctionIndex, newPrice, 'volume')
  }

  onChangeFloatProp = (auctionIndex, value, propName) => {
    this.setState(prevState => {
      const auctions = prevState.auctions
      const auction = auctions.find(auction => auction.auctionIndex === auctionIndex)
      auction[propName] = parseFloat(value)
      
      return {
        ...prevState,
        auctions
      }
    })
  }

  changeAll = (propName, type) => {
    const auctions = this.state.auctions.map(auction => {
      const randomValue = this.genetateRandomValue(propName, type)
      // console.log(`[${auction.auctionIndex}] Set ${prop} to ${randomValue}`)

      return {
        ...auction,
        [propName]: randomValue
      }
    })

    this.setState({ auctions })
  }

  changeSingleAuction = (auctionIndex, propName, type) => {
    const randomValue = this.genetateRandomValue(propName, type)
    this.onChangeFloatProp(auctionIndex, randomValue, propName)
  }

  genetateRandomValue (propName, type) {
    const referenceValues = REFERENCE_VALUES[propName]
    if (!referenceValues) {
      throw new Error('Unknown prop: ' + propName)
    }

    const referenceValue = referenceValues[type]
    if (!referenceValue) {
      throw new Error('Unknown type: ' + type)
    }

    const lowerLimit = Math.ceil(referenceValue * (100 - PERCENTAGE_RANDOMNES) / 100)
    const upperLimit = Math.ceil(referenceValue * (100 + PERCENTAGE_RANDOMNES) / 100)

    console.log(lowerLimit, upperLimit)

    return Math.ceil(getRandomArbitrary(lowerLimit, upperLimit))
  }

  render () {
    const rows = this.state.auctions.map(({
      auctionIndex,
      volume,
      price
    }) => {
      return (
        <tr key={ auctionIndex }>
          <th scope="row">{ auctionIndex }</th>
          <td>
            <input
              type="number"
              className="form-control-plaintext"
              value={ price }
              onChange={ event => this.onChangePrice(auctionIndex, event.target.value) }
            />
          </td>
          <td>
            <input
              type="number"
              className="form-control-plaintext"
              value={ volume }
              onChange={ event => this.onChangeVolume(auctionIndex, event.target.value) }
            />
          </td>
          <td className="actions">
            <i className="fas fa-arrow-circle-up" onClick={
              () => this.changeSingleAuction(auctionIndex, 'price', 'high')
            }></i>
            <i className="fas fa-equals" onClick={
              () => this.changeSingleAuction(auctionIndex, 'price', 'avg')
            }></i>
            <i className="fas fa-arrow-circle-down" onClick={
              () => this.changeSingleAuction(auctionIndex, 'price', 'low')
            }></i>
          </td>
        </tr>
      )
    })
    return (
     <form>
       <div className="price">
        13.29
       </div>
       <div className="controls">
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Price</label>
          <div className="col-sm-10 actions">
            <i className="fas fa-arrow-circle-up" onClick={ () => this.changeAll('price', 'high') }></i>
            <i className="fas fa-equals" onClick={ () => this.changeAll('price', 'avg') }></i>
            <i className="fas fa-arrow-circle-down" onClick={ () => this.changeAll('price', 'low') }></i>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Volume</label>
          <div className="col-sm-10 actions">
            <i className="fas fa-arrow-circle-up" onClick={ () => this.changeAll('volume', 'high') }></i>
            <i className="fas fa-equals" onClick={ () => this.changeAll('volume', 'avg') }></i>
            <i className="fas fa-arrow-circle-down" onClick={ () => this.changeAll('volume', 'low') }></i>
          </div>
        </div>
       </div>
       <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">Auction</th>
            <th scope="col">Price</th>
            <th scope="col">Volume</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          { rows }          
        </tbody>
      </table>
     </form> 
    )
  }
}

export default PriceSimulator

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}