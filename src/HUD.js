import React from 'react'
import _ from 'lodash'
import './HUD.css'

import ColorChartNone from './images/attri_None.png'
import ColorChartR from './images/attri_R.png'
import ColorChartB from './images/attri_B.png'
import ColorChartY from './images/attri_Y.png'
import ColorChartBR from './images/attri_RB.png'
import ColorChartBY from './images/attri_BY.png'
import ColorChartRY from './images/attri_RY.png'
import ColorChartBRY from './images/attri_RYB.png'

import waveform from './images/waveform.png'

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

const colorChartMap = [
  {
    colors: [],
    chart: ColorChartNone,
  },
  {
    colors: ['blue'],
    chart: ColorChartB,
  },
  {
    colors: ['red'],
    chart: ColorChartR,
  },
  {
    colors: ['yellow'],
    chart: ColorChartY,
  },
  {
    colors: ['blue', 'yellow'],
    chart: ColorChartBY,
  },
  {
    colors: ['blue', 'red'],
    chart: ColorChartBR,
  },
  {
    colors: ['red', 'yellow'],
    chart: ColorChartRY,
  },
  {
    colors: ['blue', 'red', 'yellow'],
    chart: ColorChartBRY,
  },
]

const colorChartForColors = (colors) => {
  colors.sort()
  return colorChartMap.find(map => _.isEqual(map.colors, colors)).chart
}

const ColorChart = ({ colors }) => {
  return (
    <div className="ColorChart">
      <img src={colorChartForColors(colors)}/>
    </div>
  )
}

export default class HUD extends React.Component {

  render() {
    const hullBarWidth = 115
    const maxHullStrength = 100
    const hullStrength = this.props.hullStrength
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
                {`${hullStrength}/${maxHullStrength}`}
              </div>
              <div className="HullStrength-bar-inner" style={{ width: `${hullStrength / maxHullStrength * hullBarWidth}%` }}/>
            </div>

          </Panel>
          <Panel name="Propulsion">
            <h2>{`level: ${this.props.propulsion}`}</h2>
          </Panel>
          <Panel name="Repairs">
            <h2>{`level: ${this.props.repairs}`}</h2>
          </Panel>
        </div>
      </div>
    )
  }
}
