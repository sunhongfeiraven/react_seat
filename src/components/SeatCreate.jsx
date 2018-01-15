/* eslint-disable */
import React from 'react';
import { Radio, Row, Col, Icon, Select, Button } from 'antd';
import PropTypes from 'prop-types';
import { SEATSISE, STATUS_MAP, INTERVAL } from './config';
import G6 from '@antv/g6';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function getSeatData(row, col) {
  let data = [];
  // 初始化渲染座位 第一排及第一列为label 显示坐标
  for (let i = 0; i < row + 1; i++) {
    for (let j = 0; j < col + 1; j++) {
      if (i === 0) {
        // 纵向坐标
        data.push({
          shape: 'text',
          size: 20,
          id: `label-${i}-${j}`,
          x: i * SEATSISE + i * INTERVAL,
          y: j * SEATSISE + j * INTERVAL,
          label: j,
          type: 'label',
        });
      } else if (j === 0) {
        data.push({
          shape: 'text',
          size: 20,
          id: `label-${i}-${j}`,
          x: i * SEATSISE + i * INTERVAL,
          y: j * SEATSISE + j * INTERVAL,
          label: i,
          type: 'label',
        });
      } else {
        data.push({
          shape: 'rect',
          size: 30,
          type: 'seat',
          seatX: i,
          seatY: j,
          rowIndex: j,
          columnIndex: i,
          status: '1',
          id: `seat-${i}-${j}`,
          x: i * SEATSISE + i * INTERVAL,
          y: j * SEATSISE + j * INTERVAL,
          color: STATUS_MAP[1],
        });
      }
    }
  }
  return data;
}

class SeatSetModal extends React.Component {
  state = {
    mode: 'default',
    status: '0', // 空座位及可用状态
  };

  static defaultProps = {
    height: 500,
  };

  componentDidMount() {
    this.renderSeatCreate();
  }

  renderSeatCreate = () => {
    const { row, col } = this.props;

    this.net = new G6.Net({
      id: 'seatCreate', // 容器ID
      mode: 'default', // 编辑模式
      modes: {
        default: ['clickBlankClearActive', 'multiSelect'],
        drag: ['dragCanvas', 'shortcut', 'wheelZoom', 'clickBlankClearActive'],
      },
      grid: null, // 是否显示网格
      fitView: 'tl',
      height: this.props.height, // 画布高
    });

    this.net.source(getSeatData(row, col));

    this.net.node().tooltip(obj => {
      if (obj.type === 'seat' && obj.status === '1') {
        return [['排', obj.seatY], ['列', obj.seatX]];
      }
    });

    this.net.tooltip(true);

    this.handleBindEvents();

    this.net.render();
  };

  bindEvents = item => {
    const { status, mode, seatStatus, area } = this.state;
    const editType = this.props.type;
    const currentType = item.get('model').type; // 座位type
    if (currentType === 'seat') {
      this.net.update(item, { color: STATUS_MAP[status], status });
      this.net.refresh();
    }
  };

  // 绑定元素事件
  handleBindEvents = () => {
    if (!this.net) return;
    const { mode } = this.state;
    this.net.off('itemactived', () => {});
    this.net.off('itemclick', () => {});

    this.net.on('itemactived', ev => {
      const item = ev.item;
      this.bindEvents(item);
    });

    this.net.on('itemclick', ev => {
      if (mode !== 'default') return; //只在编辑模式生效
      const item = ev.item;
      this.bindEvents(item);
    });
  };

  handleModeChange = e => {
    const mode = e.target.value;
    this.net && this.net.changeMode(mode);
    this.setState({ mode }, () => {
      this.handleBindEvents();
    });
  };

  handleStatusChange = e => {
    const status = e.target.value;
    this.setState({ status }, () => {
      this.handleBindEvents();
    });
  };

  handleAreaChange = e => {
    const area = e.target.value;
    this.setState({ area: area === '1' ? true : false }, () => {
      this.handleBindEvents();
    });
  };

  handleSave = () => {
    const saveData = this.net.save();
    let nodes = saveData.source.nodes;
    nodes = nodes.filter(item => {
      return item.type === 'seat';
    });
    nodes = nodes.map(item => {
      let data = item;
      delete data.color;
      delete data.x;
      delete data.y;
      delete data.shape;
      delete data.type;
      delete data.size;
      delete data.id;
      return data;
    });

    this.props.onSave(nodes);
  };

  render() {
    const { type, height } = this.props;

    return (
      <div>
        <Row type="flex" justify="end">
          <RadioGroup
            defaultValue="0"
            style={{ marginBottom: 16, marginRight: 8 }}
            onChange={this.handleStatusChange}
          >
            <RadioButton value="1">座位</RadioButton>
            <RadioButton value="0">非座位</RadioButton>
          </RadioGroup>
          <RadioGroup
            defaultValue="default"
            style={{ marginBottom: 16, marginRight: 8 }}
            onChange={this.handleModeChange}
          >
            <RadioButton value="default">编辑模式</RadioButton>
            <RadioButton value="drag">预览模式</RadioButton>
          </RadioGroup>
          <Button onClick={this.handleSave} type="primary">
            保存
          </Button>
        </Row>
        <div
          id="seatCreate"
          style={{
            border: '1px solid #D8D8D8',
            borderRadius: '4px',
            overflow: 'hidden',
            height: height,
          }}
        />
      </div>
    );
  }
}

SeatSetModal.propTypes = {
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default SeatSetModal;
