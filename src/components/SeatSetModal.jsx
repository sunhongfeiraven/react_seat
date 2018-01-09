/* eslint-disable */
// todo 1. 鼠标移入显示坐标
// todo 2. 取消其他模式下的点击事件
import React from 'react';
import { Button, Row, Col, InputNumber, Input, Icon, Select } from 'antd';
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
          id: `seat-${i}-${j}`,
          x: i * seatWidth + i * INTERVAL,
          y: j * seatWidth + j * INTERVAL,
          color: 'gray',
        });
      }
    }
  }
  return data;
}

class SeatSetModal extends React.Component {
  state = {
    row: 10,
    col: 10,
    area: '',
    mode: 'del',
    color: '',
    datalist: [
      {
        id: '1',
        label: '区域1',
        color: '#194D33',
      },
      {
        id: '2',
        label: '区域2',
        color: '#926426',
      },
      {
        id: '3',
        label: '区域3',
        color: '#302692',
      },
    ],
  };
  componentDidMount() {
    const { row, col } = this.state;

    this.net = new G6.Net({
      id: 'seatSet', // 容器ID
      mode: 'drag', // 编辑模式
      modes: {
        default: ['clickBlankClearActive', 'multiSelect'],
        edit: ['clickBlankClearActive'],
        drag: ['dragCanvas', 'shortcut', 'wheelZoom'],
      },
      grid: null, // 是否显示网格
      fitView: 'tl',
      height: 400, // 画布高
    });

    this.net.node().tooltip(obj => {
      return [['Id是', obj.id]];
    });

    this.net.tooltip(true);

    this.net.source(getSeatData(row, col));

    this.handleNetItemClick();

    this.net.render();
  }

  // 绑定元素点击事件
  handleNetItemClick = () => {
    if (!this.net) return;
    this.net.off('itemactived', () => {});
    this.net.off('itemclick', () => {});
    this.net.on('itemactived', ev => {
      const item = ev.item;
      const type = item.get('model').type;
      if (type === 'seat') {
        const color = this.state.color;
        const area = this.state.area;
        this.net.update(item, { color, area });
        this.net.refresh();
      }
    });
    this.net.on('itemclick', ev => {
      const item = ev.item;
      const type = item.get('model').type;
      if (type === 'seat') {
        const color = this.state.color;
        const area = this.state.area;
        this.net.update(item, { color, area });
        this.net.refresh();
      }
    });
  };

  handleModeChange = (e, mode) => {
    this.net && this.net.changeMode(mode);
  };

  handleChangeComplete = color => {
    this.setState({ color: color.hex });
  };

  handleCreate = () => {
    const { row, col } = this.state;

    this.net && this.net.changeData(getSeatData(row, col));

    this.net.refresh();
  };

  handleRowChange = value => {
    this.setState({ row: value });
  };

  handleColChange = value => {
    this.setState({ col: value });
  };

  handleSave = () => {
    const saveData = this.net.save();
    const json = JSON.stringify(saveData, null, 2);
    console.log(saveData, json); // eslint-disable-line no-console
  };

  handleSelectChange = value => {
    const colorFilter = this.state.datalist.filter(item => {
      return item.id === value;
    });
    const color = colorFilter.length > 0 && colorFilter[0].color;
    this.setState({ color, area: value });
  };

  render() {
    const { visible, onOk, onCancel } = this.props;
    const { row, col, area, datalist } = this.state;

    const options = datalist.map(opt => (
      <Option key={opt.id} value={opt.id}>
        <span style={{ color: opt.color }}>{opt.label}</span>
      </Option>
    ));

    return (
      <div>
        <Row>
          <span>行:</span>
          <InputNumber
            style={{ margin: '0 8px' }}
            onChange={this.handleRowChange}
            value={row}
            min={1}
          />
          <span>列:</span>
          <InputNumber
            value={col}
            min={1}
            onChange={this.handleColChange}
            style={{ margin: '0 8px' }}
          />
          <Button onClick={this.handleCreate} type="primary">
            座位生成
          </Button>
        </Row>
        <Row>
          <span>区域选择:</span>
          <Select
            value={area}
            onChange={this.handleSelectChange}
            style={{ margin: '8px 8px', width: 120 }}
          >
            {options}
          </Select>
        </Row>
        <Row type="flex" justify="end">
          <ButtonGroup style={{ marginBottom: 16 }}>
            <Button onClick={e => this.handleModeChange(e, 'default')}>编辑模式</Button>
            <Button onClick={e => this.handleModeChange(e, 'drag')}>预览模式</Button>
            <Button onClick={this.handleSave} type="primary">
              保存
            </Button>
          </ButtonGroup>
        </Row>
        <div id="seatSet" style={{ border: '1px solid #333' }} />
      </div>
    );
  }
}

export default SeatSetModal;
