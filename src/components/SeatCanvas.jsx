/* eslint-disable */
// todo 1. 鼠标移入显示坐标
// todo 2. 取消其他模式下的点击事件
import React from 'react';
import { Button, Row, Col, Icon, Select } from 'antd';
import PropTypes from 'prop-types';
import G6 from '@antv/g6';

const ButtonGroup = Button.Group;
const Option = Select.Option;

const seatWidth = 30; // 座位宽度
const INTERVAL = 10; // 边距

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
          stroke: '#fff',
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
          stroke: '#fff',
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

class SeatSetModal extends React.Component {
  state = {
    mode: 'default',
    color: '#979797',
    fill: '#EE5656',
  };

  componentDidMount() {
    this.renderSeat();
  }

  renderSeat = () => {
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
      height: 500, // 画布高
    });

    this.net.node().tooltip(obj => {
      return [['Id是', obj.id]];
    });

    this.net.tooltip(true);

    this.net.source(getSeatData(row, col));

    this.handleBindEvents();

    this.net.render();
  };

  // 绑定元素事件
  handleBindEvents = () => {
    if (!this.net) return;
    this.net.off('itemactived', () => {});
    this.net.off('itemclick', () => {});
    this.net.on('itemactived', ev => {
      const { color } = this.state;
      const item = ev.item;
      const type = item.get('model').type;
      if (type === 'seat') {
        this.net.update(item, { color });
        this.net.refresh();
      }
    });
    this.net.on('itemclick', ev => {
      const { color, mode, fill } = this.state;
      if (mode !== 'default') return; //只在编辑模式生效
      const item = ev.item;
      const type = item.get('model').type;
      if (type === 'seat') {
        console.log(item.get('model'), fill);
        this.net.update(item, { color, label: '#' });
        this.net.refresh();
      }
    });
  };

  handleModeChange = (e, mode) => {
    this.net && this.net.changeMode(mode);
    this.setState({ mode }, () => {
      this.handleBindEvents();
    });
  };

  handleColorChange = (e, color) => {
    this.setState({ color });
  };

  handleFillChange = (e, fill) => {
    this.setState({ fill }, () => {
      this.handleBindEvents();
    });
  };

  handleSave = () => {
    const saveData = this.net.save();
    const json = JSON.stringify(saveData, null, 2);
    console.log(saveData, json); // eslint-disable-line no-console
  };

  render() {
    const { type } = this.props;
    const btnTypes = () => {
      if (type === 'create') {
        return (
          <ButtonGroup style={{ marginBottom: 16, marginRight: 8 }}>
            <Button onClick={e => this.handleColorChange(e, '#979797')}>新增</Button>
            <Button onClick={e => this.handleColorChange(e, '#ffffff')}>删除</Button>
          </ButtonGroup>
        );
      } else if (type === 'area') {
        return (
          <ButtonGroup style={{ marginBottom: 16, marginRight: 8 }}>
            <Button onClick={e => this.handleFillChange(e, '#EE5656')}>预留</Button>
          </ButtonGroup>
        );
      }
    };

    return (
      <div>
        <Row type="flex" justify="end">
          {btnTypes()}
          <ButtonGroup style={{ marginBottom: 16 }}>
            <Button onClick={e => this.handleModeChange(e, 'default')}>编辑模式</Button>
            <Button onClick={e => this.handleModeChange(e, 'drag')}>预览模式</Button>
            <Button onClick={this.handleSave} type="primary">
              保存
            </Button>
          </ButtonGroup>
        </Row>
        <div id="seatSet" style={{ border: '1px solid #333', overflow: 'hidden' }} />
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
