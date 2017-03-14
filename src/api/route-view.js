const RouteView = {
  init() {
    this._views = {};
  },
  state() {
    return {
      view: ''
    };
  },
  methods: {
    updateProps (component, props) {
      const combineProps = {};
      if (props) {
        for (let p in props) {
          if (props.hasOwnProperty(p)) {
            component.props[p] = props[p];
            if (/^:/.test(p)) {
              combineProps[p.slice(1)] = props[p];
            } else {
              combineProps[p] = String(props[p]);
            }
          }
        }
      }
      for (let p in combineProps) {
        if (combineProps.hasOwnProperty(p)) {
          component.state[p] = combineProps[p];
        }
      }
    }
  },
  render(h) {
    let viewComponent = this._views[this.state.view];
    if (!viewComponent) {
      viewComponent = this.parent.components[this.state.view](this.props, [], null);
      this._views[this.state.view] = viewComponent;
    } else {
      this.updateProps(viewComponent, this.props);
    }
    return viewComponent;
  },
  hooks: {
    mounted() {
      const currentView = this._views[this.state.view];
      currentView._callHooks('mounted');
    }
  }
};

export default RouteView;
