/* eslint-disable */
import React from 'react';
import { Modal, Button, Row, Col } from 'antd';
import G6 from '@antv/g6';
import { GithubPicker } from 'react-color';
import reactCSS from 'reactcss';

const ButtonGroup = Button.Group;

const seatWidth = 30; // 座位宽度

export default class SeatSetModal extends React.Component {
  state = {
    mode: 'del',
    color: '#fff',
  };
  componentDidMount() {
    const { row, col } = this.props;
    const INTERVAL = 10; // 边距
    this.net = new G6.Net({
      id: 'seatSet', // 容器ID
      mode: 'default', // 编辑模式
      modes: {
        default: ['clickBlankClearActive', 'wheelZoom', 'multiSelect'],
        edit: ['clickBlankClearActive', 'shortcut', 'wheelZoom'],
        drag: ['dragCanvas', 'shortcut', 'wheelZoom'],
      },
      grid: null, // 是否显示网格
      fitView: 'cc',
      height: 400, // 画布高
    });

    const data = {
      nodes: [],
    };

    // 初始化渲染座位 第一排及第一列为label 显示坐标
    for (let i = 0; i < row + 1; i++) {
      for (let j = 0; j < col + 1; j++) {
        if (i === 0) {
          // 纵向坐标
          data.nodes.push({
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
          data.nodes.push({
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
          data.nodes.push({
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

    this.net.source(data.nodes);

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
      let color = null;
      if (type === 'seat') {
        color = this.state.color;
        this.net.update(item, { color });
        this.net.refresh();
      }
    });
    this.net.on('itemclick', ev => {
      const item = ev.item;
      const type = item.get('model').type;
      let color = null;
      if (type === 'seat') {
        color = this.state.color;
        this.net.update(item, { color });
        this.net.refresh();
      }
    });
  };

  handleModeChange = (e, mode) => {
    this.net && this.net.changeMode(mode);
    // this.setState({ mode }, () => {
    // this.handleNetItemClick();
    // });
  };

  handleChangeComplete = color => {
    this.setState({ color: color.hex });
  };

  render() {
    const { visible, onOk, onCancel } = this.props;
    const styles = reactCSS({
      default: {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `${this.state.color}`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });
    return (
      <Modal
        title="座位选择"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{
          width: 752,
        }}
      >
        <div>
          <Row>
            <ButtonGroup style={{ marginBottom: 16 }}>
              <Button onClick={e => this.handleModeChange(e, 'default')}>编辑模式</Button>
              <Button onClick={e => this.handleModeChange(e, 'drag')}>预览模式</Button>
            </ButtonGroup>
            <div onClick={this.handleClick}>
              <div style={styles.color} />
            </div>
            <GithubPicker color={this.state.color} onChangeComplete={this.handleChangeComplete} />
          </Row>
        </div>
        <div id="seatSet" />
      </Modal>
    );
  }
}
