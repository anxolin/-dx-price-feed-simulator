import React, { Component } from 'react'
import priceUtils from './priceUtils'
const AUCTIONS = 15
const NUM_AUCTIONS_TO_USE_DEFAULT = 10
const HIGH_VOLUME_THRESHOLD_DEFAULT = 5000
const WEIGHED_VOLUME_CONSTANT = 100
const WEIGHED_TIME_CONSTANT = 100

const REFERENCE_VALUES = {
  price: {
    low: 25,
    avg: 200,
    high: 1000
  },
  volume: {
    low: 1300,
    avg: 10000,
    high: 50000
  }
}
const PERCENTAGE_RANDOMNES = 20

class PriceSimulator extends Component {
  state = {
    auctions: [],
    numAuctionToUse: NUM_AUCTIONS_TO_USE_DEFAULT,
    highVolumeThreshold: HIGH_VOLUME_THRESHOLD_DEFAULT,
    volumeConstant: WEIGHED_VOLUME_CONSTANT,
    timeConstant: WEIGHED_TIME_CONSTANT,
    visiblePriceFeed: false,
    visibleCheckReliability: false,
    visibleUpdateAll: false,
    visibleLoadAuctions: false
  }

  auctionsJsonRef = React.createRef()

  componentDidMount () {
    let state = localStorage.getItem('state')
    if (!state) {
      const auctions = []
      for (let i =0; i < AUCTIONS; i++) {
        auctions.push({
          auctionIndex: 100 + AUCTIONS - i,
          volume: this.genetateRandomValue('volume', 'avg'),
          price: this.genetateRandomValue('price', 'avg')
        })
      }
      state = {
        auctions
      }
    } else {
      state = JSON.parse(state)
    }

    this.setState(state, this.saveState)
  }

  onChangePrice = (auctionIndex, newPrice) => {
    this.onChangeFloatProp(auctionIndex, newPrice, 'price')
  }

  onChangeVolume = (auctionIndex, newPrice) => {
    this.onChangeFloatProp(auctionIndex, newPrice, 'volume')
  }

  saveState = () => {
    localStorage.setItem('state', JSON.stringify(this.state))
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

    // console.log(lowerLimit, upperLimit)

    return Math.ceil(getRandomArbitrary(lowerLimit, upperLimit))
  }

  render () {
    const rows = this.state.auctions.map(({
      auctionIndex,
      volume,
      price
    }, index) => {
      return (
        <tr key={ auctionIndex } className={ (index > this.state.numAuctionToUse -1) ? 'unused' : '' }>
          <th scope="row">{ auctionIndex }</th>
          <td>
            <input
              type="number"
              className="form-control-plaintext"
              value={ price }
              onChange={ event => this.onChangePrice(auctionIndex, event.target.value) }
            />
          </td>
          <td className={ (volume > this.state.highVolumeThreshold && index <= this.state.numAuctionToUse -1) ? 'high-value' : ''  }>
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
          <td className="actions">
            <i className="fas fa-arrow-circle-up" onClick={
              () => this.changeSingleAuction(auctionIndex, 'volume', 'high')
            }></i>
            <i className="fas fa-equals" onClick={
              () => this.changeSingleAuction(auctionIndex, 'volume', 'avg')
            }></i>
            <i className="fas fa-arrow-circle-down" onClick={
              () => this.changeSingleAuction(auctionIndex, 'volume', 'low')
            }></i>
          </td>
        </tr>
      )
    })
    return (
     <form className="price-simulator">
       <div className="price">
        {
          priceUtils.formatPrice(priceUtils.getPrice({
            auctions: this.state.auctions,
            numAuctionToUse: this.state.numAuctionToUse,
            highVolumeThreshold: this.state.highVolumeThreshold,
            volumeConstant: this.state.volumeConstant,
            timeConstant: this.state.timeConstant
          }))
        }
       </div>
       <div className="controls">
        <div className="card">
          <h5 
            className="card-header"
            onClick={ () => this.setState({ visiblePriceFeed: !this.state.visiblePriceFeed }) }>
            Price Feed
          </h5>
          <div className="card-body" style={{ display: (this.state.visiblePriceFeed ? 'block' : 'none') }}>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Price feed:</label>
              <div className="col-sm-9 actions">
                <select className="form-control" id="priceFeed">
                  <option>Weighed value and time, discard low volume auctions</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
            <label htmlFor="numAuctionToUse" className="col-sm-3 col-form-label">
              Number of auctions to use:
            </label>
            <div className="col-sm-2 actions">
              <input 
                type="number"
                className="form-control-plaintext"
                id="numAuctionToUse"
                value={ this.state.numAuctionToUse }
                onChange={ event => this.setState({ numAuctionToUse: parseInt(event.target.value) }) }
              />
            </div>

            <label htmlFor="highVolumeThreshold" className="col-sm-3 col-form-label">
              High volume threshold:
            </label>
            <div className="col-sm-2 actions">
              <input 
                type="number"
                className="form-control-plaintext"
                id="highVolumeThreshold"
                value={ this.state.highVolumeThreshold }
                onChange={ event => this.setState({ highVolumeThreshold: parseInt(event.target.value) }) }
              />
            </div>

            <label htmlFor="volumeConstant" className="col-sm-3 col-form-label">
              Volume constant:
            </label>
            <div className="col-sm-2 actions">
              <input 
                type="number"
                className="form-control-plaintext"
                id="volumeConstant"
                value={ this.state.volumeConstant }
                onChange={ event => this.setState({ volumeConstant: parseInt(event.target.value) }) }
              />
            </div>
            <label htmlFor="timeConstant" className="col-sm-3 col-form-label">
              Time constant:
            </label>
            <div className="col-sm-2 actions">
              <input 
                type="number"
                className="form-control-plaintext"
                id="timeConstant"
                value={ this.state.timeConstant }
                onChange={ event => this.setState({ timeConstant: parseInt(event.target.value) }) }
              />
            </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h5
            className="card-header"
            onClick={ () => this.setState({ visibleCheckReliability: !this.state.visibleCheckReliability }) }>
            Check reliability
          </h5>
          <div className="card-body" style={{ display: this.state.visibleCheckReliability ? 'block' : 'none' }}>
            <p>
              TODO: Check if the price is trusted
            </p>
          </div>
        </div>

        <div className="card">
          <h5
            className="card-header"
            onClick={ () => this.setState({ visibleUpdateAll: !this.state.visibleUpdateAll }) }>
            Update the price and volume</h5>
          <div className="card-body" style={{ display: this.state.visibleUpdateAll ? 'block' : 'none' }}>
            <p>Set random high/average/low values for:</p>
            <div className="form-group row">
              <label className="col-sm-3 col-form-label">Price:</label>
              <div className="col-sm-3 actions">
                <i className="fas fa-arrow-circle-up" onClick={ () => this.changeAll('price', 'high') }></i>
                <i className="fas fa-equals" onClick={ () => this.changeAll('price', 'avg') }></i>
                <i className="fas fa-arrow-circle-down" onClick={ () => this.changeAll('price', 'low') }></i>
              </div>
              <label className="col-sm-3 col-form-label">Volume:</label>
              <div className="col-sm-3 actions">
                <i className="fas fa-arrow-circle-up" onClick={ () => this.changeAll('volume', 'high') }></i>
                <i className="fas fa-equals" onClick={ () => this.changeAll('volume', 'avg') }></i>
                <i className="fas fa-arrow-circle-down" onClick={ () => this.changeAll('volume', 'low') }></i>
              </div>       
            </div>
          </div>
        </div>

        <div className="card">
          <h5
            className="card-header"
            onClick={ () => this.setState({ visibleLoadAuctions: !this.state.visibleLoadAuctions }) }>
            Load auctions</h5>
          <div className="card-body" style={{ display: this.state.visibleLoadAuctions ? 'block' : 'none' }}>
            <p>Load auctions from JSON:</p>

            <div className="form-group">
              <label htmlFor="auctionsJson">Auctions</label>
              <textarea
                className="form-control"
                id="auctionsJson"
                rows="5" 
                readOnly
                value={ JSON.stringify(this.state.auctions) }          
              />
              <textarea
                ref={this.auctionsJsonRef}
                className="form-control"
                id="auctionsJsonInput"
                rows="5"
              />
            </div>
            <div className="buttons">
              <button
                onClick={ () => this.setState({
                  auctions: JSON.parse(this.auctionsJsonRef.current.value)
                }, this.saveState) }
                type="button"
                className="btn btn-primary">
                  Load auctions
              </button>
            </div>
          </div>
        </div>

       </div>
      <div className="buttons">
        <button
          onClick={ this.saveState }
          type="button"
          className="btn btn-primary">
            Save state
        </button>
      </div>
       <table className="table">
        <thead className="thead-dark">
          <tr>
            <th scope="col">Auction</th>
            <th scope="col">Price</th>
            <th scope="col">Volume</th>
            <th scope="col">Change price</th>
            <th scope="col">Change volume</th>
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