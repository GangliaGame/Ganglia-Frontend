import React from 'react'
import _ from 'lodash'
import './HUD.css'
import ColorChart from './ColorChart'

import PropulsionOff from './images/propulsion-off.png'
import PropulsionSlow from './images/propulsion-slow.png'
import PropulsionFast from './images/propulsion-fast.png'

import waveform from './images/waveform.png'

const propulsionCharts = [
  PropulsionOff,
  PropulsionSlow,
  PropulsionFast,
]

const Panel = ({ name, description, children }) => {
  return (
    <div className={`Panel Panel-${name}`}>
      <div className="Panel-title">
        {name}
      </div>
      {
        !description ? '' :
        <div className="Panel-description">{description}</div>
      }
      <div className="Panel-content">
        {children}
      </div>
    </div>
  )
}


export default class HUD extends React.Component {

  render() {
    const hullBarWidth = 115
    const maxHullStrength = 100
    const hullStrength = Math.max(0, this.props.hullStrength)
    return (
      <div className="HUD">
        <div className="HUD-inner">
          <Panel name="Weapons" description="Weapons effective against these colors">
            <ColorChart colors={this.props.weapons}/>
          </Panel>
          <Panel name="Shields" description="Shields effective against these colors">
            <ColorChart colors={this.props.shields}/>
          </Panel>
          <Panel wide name="Communication">
            <img src={waveform}/>
            <div className="HullStrength-label">HEALTH</div>
            <div className="HullStrength-bar">
              <div className="HullStrength-bar-label">
                {`${hullStrength < (maxHullStrength / 4) ? hullStrength.toFixed(1) : hullStrength.toFixed(0)}/${maxHullStrength}`}
              </div>
              <div className="HullStrength-bar-inner" style={{ width: `${hullStrength / maxHullStrength * hullBarWidth}%` }}/>
            </div>

          </Panel>
          <Panel name="Propulsion">
            <img src={propulsionCharts[this.props.propulsion]}/>
          </Panel>
          <Panel name="Repairs">
            <h2>{`level: ${this.props.repairs}`}</h2>
          </Panel>
        </div>
      </div>
    )
  }
}
