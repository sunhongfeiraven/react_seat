/* eslint-disable */
// todo 1. 鼠标移入显示坐标
// todo 2. 取消其他模式下的点击事件
import React from 'react';
import { Radio, Row, Col, Icon, Select, Button } from 'antd';
import PropTypes from 'prop-types';
import G6 from '@antv/g6';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const seatWidth = 30; // 座位宽度
const INTERVAL = 10; // 边距
const statusMap = {
  // 是否为座位状态
  '0': '#fff',
  '1': '#0EAB0F',
};
const seatStatusMap = {
  '0': '',
  '1': '#',
  '2': '@',
  '3': '$',
};

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
          x: i * seatWidth + i * INTERVAL,
          y: j * seatWidth + j * INTERVAL,
          label: j,
          type: 'label',
        });
      } else if (j === 0) {
        data.push({
          shape: 'text',
          size: 20,
          id: `label-${i}-${j}`,
          x: i * seatWidth + i * INTERVAL,
          y: j * seatWidth + j * INTERVAL,
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
          rowIndex: i,
          columnIndex: j,
          status: '1',
          id: `seat-${i}-${j}`,
          x: i * seatWidth + i * INTERVAL,
          y: j * seatWidth + j * INTERVAL,
          color: '#979797',
        });
      }
    }
  }
  return data;
}

// todo 返回编辑时 渲染颜色
function reBuildSeatData(source) {
  let data = source;
  let maxX = 0;
  let maxY = 0;
  source.forEach(item => {
    if (item.seatX > maxX) {
      maxX = item.seatX;
    }
    if (item.seatY > maxY) {
      maxY = item.seatY;
    }
  });

  // 先添加坐标
  data = data.map(item => {
    return {
      ...item,
      x: item.seatX * seatWidth + item.seatX * INTERVAL,
      y: item.seatY * seatWidth + item.seatY * INTERVAL,
      color: statusMap[item.status],
      size: seatWidth,
      shape: 'rect',
      type: 'seat',
    };
  });

  for (let i = 0; i < maxX + 1; i++) {
    for (let j = 0; j < maxY + 1; j++) {
      if (i === 0) {
        data.push({
          shape: 'text',
          size: 20,
          id: `label-${i}-${j}`,
          x: i * seatWidth + i * INTERVAL,
          y: j * seatWidth + j * INTERVAL,
          label: j,
          type: 'label',
        });
      } else if (j === 0) {
        data.push({
          shape: 'text',
          size: 20,
          id: `label-${i}-${j}`,
          x: i * seatWidth + i * INTERVAL,
          y: j * seatWidth + j * INTERVAL,
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
    mode: 'default',
    status: '1', // 空座位及可用状态
    seatStatus: '0', // 表示可售状态
    area: false,
  };

  static defaultProps = {
    height: 500,
  };

  componentDidMount() {
    if (this.props.type === 'create') {
      this.renderSeatCreate();
    } else if (this.props.type === 'area') {
      this.renderSeatByData();
    }
  }

  renderSeatByData() {
    const { data } = this.props;
    this.net = new G6.Net({
      id: 'seatSet', // 容器ID
      mode: 'default', // 编辑模式
      modes: {
        default: ['clickBlankClearActive', 'multiSelect'],
        drag: ['dragCanvas', 'shortcut', 'wheelZoom'],
      },
      grid: null, // 是否显示网格
      fitView: 'tl',
      height: this.props.height, // 画布高
    });

    this.net.source(reBuildSeatData(data));

    this.net.node().tooltip(obj => {
      if (obj.type === 'seat' && obj.status === '1') {
        return [['行', obj.seatX], ['列', obj.seatY]];
      }
    });

    this.net.tooltip(true);

    this.handleBindEvents();

    this.net.render();
  }

  renderSeatCreate = () => {
    const { row, col } = this.props;

    this.net = new G6.Net({
      id: 'seatSet', // 容器ID
      mode: 'default', // 编辑模式
      modes: {
        default: ['clickBlankClearActive', 'multiSelect'],
        drag: ['dragCanvas', 'shortcut', 'wheelZoom'],
      },
      grid: null, // 是否显示网格
      fitView: 'tl',
      height: this.props.height, // 画布高
    });

    this.net.source(getSeatData(row, col));

    this.net.node().tooltip(obj => {
      if (obj.type === 'seat' && obj.status === '1') {
        return [['行', obj.seatX], ['列', obj.seatY]];
      }
    });

    this.net.tooltip(true);

    this.handleBindEvents();

    this.net.render();
  };

  bindEvents = item => {
    const { status, mode, seatStatus, area } = this.state;
    const editType = this.props.type;
    const { performPackageId, color } = this.props;
    const type = item.get('model').type; // 座位type
    const currentStatus = item.get('model').status; // 座位status
    const currentPerformPackageId = item.get('model').performPackageId;
    if (type === 'seat') {
      if (editType === 'create') {
        this.net.update(item, { color: statusMap[status], status });
      } else if (editType === 'area') {
        if (currentStatus === '1') {
          let newColor = statusMap[1];
          if (area) {
            if (!currentPerformPackageId || currentPerformPackageId === performPackageId) {
              newColor = color;
            }
          }
          this.net.update(item, {
            color: newColor,
            performPackageId,
            label: seatStatusMap[seatStatus],
            seatStatus,
          });
        }
      }
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
    this.setState({ mode });
  };

  handleStatusChange = e => {
    const status = e.target.value;
    this.setState({ status }, () => {
      this.handleBindEvents();
    });
  };

  handleSeatStatusChange = e => {
    const seatStatus = e.target.value;
    this.setState({ seatStatus }, () => {
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
    const json = JSON.stringify(saveData, null, 2);
    console.log(saveData, json); // eslint-disable-line no-console
  };

  render() {
    const { type, height } = this.props;
    const btnTypes = () => {
      if (type === 'create') {
        return (
          <RadioGroup
            style={{ marginBottom: 16, marginRight: 8 }}
            onChange={this.handleStatusChange}
          >
            <RadioButton value="1">座位</RadioButton>
            <RadioButton value="0">非座位</RadioButton>
          </RadioGroup>
        );
      } else if (type === 'area') {
        return [
          <RadioGroup
            style={{ marginBottom: 16, marginRight: 8 }}
            key="1"
            onChange={this.handleAreaChange}
          >
            <RadioButton value="1">区域选择</RadioButton>
            <RadioButton value="0">取消区域选择</RadioButton>
          </RadioGroup>,
          <RadioGroup
            style={{ marginBottom: 16, marginRight: 8 }}
            key="2"
            onChange={this.handleSeatStatusChange}
          >
            <RadioButton value="0">可售</RadioButton>
            <RadioButton value="1">预留#</RadioButton>
            <RadioButton value="2">已售@</RadioButton>
            <RadioButton value="3">锁定$</RadioButton>
          </RadioGroup>,
        ];
      }
    };

    return (
      <div>
        <Row type="flex" justify="end">
          {btnTypes()}
          <RadioGroup style={{ marginBottom: 16, marginRight: 8 }} onChange={this.handleModeChange}>
            <RadioButton value="default">编辑模式</RadioButton>
            <RadioButton value="drag">预览模式</RadioButton>
          </RadioGroup>
          <Button onClick={this.handleSave} type="primary">
            保存
          </Button>
        </Row>
        <div
          id="seatSet"
          style={{ border: '1px solid #333', overflow: 'hidden', height: height }}
        />
      </div>
    );
  }
}

SeatSetModal.propTypes = {
  row: PropTypes.number,
  col: PropTypes.number,
  type: PropTypes.string.isRequired,
};

export default SeatSetModal;
