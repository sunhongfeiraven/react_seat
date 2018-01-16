/* eslint-disable */
import React from 'react';
import { Radio, Row, Col, Icon, Select, Button } from 'antd';
import { SEATSISE, STATUS_MAP, SEAT_STATUS_MAP, INTERVAL } from './config';
import PropTypes from 'prop-types';
import G6 from '@antv/g6';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

// todo 返回编辑时 渲染颜色
function reBuildSeatData(source) {
  let data = source;
  let maxX = 0;
  let maxY = 0;

  source.forEach(item => {
    if (item.status !== '1') return;
    if (item.seatX > maxX) {
      maxX = item.seatX;
    }
    if (item.seatY > maxY) {
      maxY = item.seatY;
    }
  });

  // 先添加坐标
  data = data.filter(item => {
    return item.status === '1';
  });

  data = data.map(item => {
    return {
      ...item,
      x: item.seatX * SEATSISE + item.seatX * INTERVAL,
      y: item.seatY * SEATSISE + item.seatY * INTERVAL,
      color: STATUS_MAP[item.status],
      size: SEATSISE,
      label: SEAT_STATUS_MAP[item.seatStatus],
      shape: 'rect',
      type: 'seat',
    };
  });

  for (let i = 0; i < maxX + 1; i++) {
    for (let j = 0; j < maxY + 1; j++) {
      if (i === 0 && j <= maxY) {
        data.push({
          shape: 'text',
          size: 20,
          id: `label-${i}-${j}`,
          x: i * SEATSISE + i * INTERVAL,
          y: j * SEATSISE + j * INTERVAL,
          label: j,
          type: 'label',
        });
      } else if (j === 0 && i <= maxX) {
        data.push({
          shape: 'text',
          size: 20,
          id: `label-${i}-${j}`,
          x: i * SEATSISE + i * INTERVAL,
          y: j * SEATSISE + j * INTERVAL,
          label: i,
          type: 'label',
        });
      }
    }
  }

  return data;
}

class SeatSetModal extends React.Component {
  state = {
    status: '1', // 空座位及可用状态
    seatStatus: '0', // 表示可售状态
    area: false,
  };

  static defaultProps = {
    height: 500,
  };

  componentDidMount() {
    this.renderSeatByData();
  }

  renderSeatByData() {
    const { data } = this.props;
    this.net = new G6.Net({
      id: 'seatUpdate', // 容器ID
      mode: 'default', // 编辑模式
      modes: {
        default: ['clickBlankClearActive', 'multiSelect'],
        drag: ['dragCanvas', 'shortcut', 'wheelZoom', 'clickBlankClearActive'],
      },
      grid: null, // 是否显示网格
      fitView: 'tl',
      height: this.props.height, // 画布高
    });

    this.net.source(reBuildSeatData(data));

    this.net.node().tooltip(obj => {
      if (obj.type === 'seat' && obj.status === '1') {
        return [['排', obj.rowIndex], ['坐', obj.columnIndex]];
      }
    });

    this.net.tooltip(true);

    this.handleBindEvents();

    this.net.render();
  }

  bindEvents = item => {
    const { status, seatStatus, area } = this.state;
    const { performPackageId, color } = this.props;
    const currentType = item.get('model').type; // 座位type
    const currentStatus = item.get('model').status; // 座位status
    const currentPerformPackageId = item.get('model').performPackageId;
    if (currentType === 'seat') {
      if (currentStatus === '1') {
        let newColor = STATUS_MAP[1];
        if (area) {
          if (!currentPerformPackageId || currentPerformPackageId === performPackageId) {
            newColor = color;
          }
        }
        this.net.update(item, {
          color: newColor,
          performPackageId,
          label: SEAT_STATUS_MAP[seatStatus],
          seatStatus,
        });
      }
      this.net.refresh();
    }
  };

  // 绑定元素事件
  handleBindEvents = () => {
    if (!this.net) return;
    const self = this;

    this.net.on('itemactived', function(ev) {
      const item = ev.item;
      self.bindEvents(item);
    });

    this.net.on('itemclick', function(ev) {
      const { mode } = self.net._attrs;
      const item = ev.item;
      if (mode === 'default') {
        self.bindEvents(item);
      }
    });
  };

  handleModeChange = e => {
    const mode = e.target.value;
    this.net && this.net.changeMode(mode);
  };

  handleSeatStatusChange = e => {
    const seatStatus = e.target.value;
    this.setState({ seatStatus });
  };

  handleAreaChange = e => {
    const area = e.target.value;
    this.setState({ area: area === '1' ? true : false });
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
            style={{ marginBottom: 16, marginRight: 8 }}
            key="1"
            onChange={this.handleAreaChange}
          >
            <RadioButton value="1">区域选择</RadioButton>
            <RadioButton value="0">取消区域选择</RadioButton>
          </RadioGroup>
          <RadioGroup
            style={{ marginBottom: 16, marginRight: 8 }}
            key="2"
            onChange={this.handleSeatStatusChange}
          >
            <RadioButton value="0">可售</RadioButton>
            <RadioButton value="1">预留（留）</RadioButton>
            <RadioButton value="2">已售（售）</RadioButton>
            <RadioButton value="3">锁定（锁）</RadioButton>
          </RadioGroup>
          <RadioGroup style={{ marginBottom: 16, marginRight: 8 }} onChange={this.handleModeChange}>
            <RadioButton value="default">编辑模式</RadioButton>
            <RadioButton value="drag">预览模式</RadioButton>
          </RadioGroup>
          <Button onClick={this.handleSave} type="primary">
            保存
          </Button>
        </Row>
        <div
          id="seatUpdate"
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
  onSave: PropTypes.func.isRequired,
};

export default SeatSetModal;
