import React from 'react';
import { Button } from 'antd';
import SeatSetModal from '../components/SeatSetModal';

// import styles from './IndexPage.css';

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
        <SeatSetModal
          row={100}
          col={20}
          visible={setModalVisbile}
          onOk={this.hideSeatSetModal}
          onCancel={this.hideSeatSetModal}
        />
      </div>
    );
  }
}

export default Home;
