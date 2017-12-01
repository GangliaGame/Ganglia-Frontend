import React from 'react'
import _ from 'lodash'
import './HUD.css'
import ColorChart from './ColorChart'

import PropulsionOff from './images/propulsion-off.png'
import PropulsionSlow from './images/propulsion-slow.png'
import PropulsionFast from './images/propulsion-fast.png'

import RepairOff from './images/repair-off.png'
import RepairSlow from './images/repair-slow.png'
import RepairMed from './images/repair-med.png'
import RepairFast from './images/repair-fast.png'

import waveform from './images/waveform.png'

const propulsionCharts = [
  PropulsionOff,
  PropulsionSlow,
  PropulsionFast,
]

const repairCharts = [
  RepairOff,
  RepairSlow,
  RepairMed,
  RepairFast,
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
    const hullStrength = Math.max(0, this.props.hullStrength / maxHullStrength) * 100
    return (
      <div className="HUD">
        <div className="HUD-inner">
          <Panel name="Weapons" description="Effective against">
            <ColorChart colors={this.props.weapons}/>
          </Panel>
          <Panel name="Shields" description="Protected from">
            <ColorChart colors={this.props.shields}/>
          </Panel>
          <Panel wide name="Communication">
            <img src={waveform}/>
            <div className="HullStrength-label">HEALTH</div>
            <div className="HullStrength-bar">
              <div className="HullStrength-bar-label">
                {`${hullStrength < (maxHullStrength / 4) ? hullStrength.toFixed(1) : hullStrength.toFixed(0)}%`}
              </div>
              <div className="HullStrength-bar-inner" style={{ width: `${hullStrength / maxHullStrength * hullBarWidth}%` }}/>
            </div>

          </Panel>
          <Panel name="Propulsion">
            <img src={propulsionCharts[this.props.propulsion]}/>
          </Panel>
          <Panel name="Repairs">
            <img src={repairCharts[this.props.repairs]}/>
          </Panel>
        </div>
      </div>
    )
  }
}
