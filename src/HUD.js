import React from 'react'
import './HUD.css'

import waveform from './images/waveform.png'

const Card = ({ name, description, children }) => {
  return (
    <div className={`Card Card-${name}`}>
      <div className="Card-title">
        {name}
      </div>
      {
        !description ? '' :
        <div className="Card-description">{description}</div>
      }
      <div className="Card-content">
        {children}
      </div>
    </div>
  )
}

export default class HUD extends React.Component {

  render() {
    console.log(this.foo)
    const maxHullStrength = 100
    const hullStrength = 78
    return (
      <div className="HUD">
        <div className="HUD-inner">
          <Card name="Weapons" description="Weapons effective against these colors">
            Pretty picture
          </Card>
          <Card name="Shields" description="Shields effective against these colors"/>
          <Card wide name="Communication">
            <img src={waveform}/>
            <div className="HullStrength-label">HULL STRENGTH</div>
            <div className="HullStrength-bar">
              <div className="HullStrength-bar-label">
                {`${hullStrength}/${maxHullStrength}`}
              </div>
              <div className="HullStrength-bar-inner" style={{ width: `${hullStrength / maxHullStrength * 100}%` }}/>
            </div>

          </Card>
          <Card name="Propulsion"/>
          <Card name="Hull"></Card>
        </div>
      </div>
    )
  }
}
