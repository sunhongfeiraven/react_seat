import React from 'react';
import SeatSetModal from '../components/SeatCanvas';

class Home extends React.Component {
  state = {
    setModalVisbile: true,
  };

  render() {
    const { setModalVisbile } = this.state;
    return (
      <div style={{ padding: 30 }}>
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
