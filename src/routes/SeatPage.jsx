import React from 'react';
import { Button, Modal } from 'antd';
import SeatSetModal from '../components/SeatCanvas';

class Home extends React.Component {
  state = {
    setModalVisbile: true,
  };

  showSeatSetModal = (e) => {
    e.preventDefault();
    this.setState({ setModalVisbile: true });
  };

  hideSeatSetModal = (e) => {
    e.preventDefault();
    this.setState({ setModalVisbile: false });
  };

  render() {
    const { setModalVisbile } = this.state;
    return (
      <div style={{ padding: 30 }}>
        <Button onClick={this.showSeatSetModal}>座位编辑</Button>
        <Modal
          title="Basic Modal"
          visible={setModalVisbile}
          onOk={e => this.hideSeatSetModal(e, false)}
          onCancel={e => this.hideSeatSetModal(e, false)}
          width={1200}
          style={{ top: 20, width: 800 }}
          bodyStyle={{ height: 800 }}
        >
          <SeatSetModal row={20} col={20} type="area" />
        </Modal>
      </div>
    );
  }
}

export default Home;
