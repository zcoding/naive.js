const RouteView = {
  state() {
    return {
      current: ''
    };
  },
  render(h) {
    const current = this.state.current;
    return h(current);
  }
};

export default RouteView;
