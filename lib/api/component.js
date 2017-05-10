import { callHooks } from './hooks'

const Component = {
  init() {
    this._dynamicComponents = {}
  },
  state() {
    return {
      is: ''
    }
  },
  methods: {
    updateProps (component, props) {
      const combineProps = {}
      if (props) {
        for (let p in props) {
          if (props.hasOwnProperty(p)) {
            component.props[p] = props[p]
            if (/^:/.test(p)) {
              combineProps[p.slice(1)] = props[p]
            } else {
              combineProps[p] = String(props[p])
            }
          }
        }
      }
      for (let p in combineProps) {
        if (combineProps.hasOwnProperty(p)) {
          component.state[p] = combineProps[p]
        }
      }
    }
  },
  render(h) {
    let activeComponent = this._dynamicComponents[this.state.is]
    if (!activeComponent) {
      activeComponent = this.parent.components[this.state.is](this.props, [], null)
      this._dynamicComponents[this.state.is] = activeComponent
    } else {
      this.updateProps(activeComponent, this.props)
    }
    return activeComponent
  },
  hooks: {
    mounted() {
      this.parent.$routeView = this
      const currentView = this._dynamicComponents[this.state.is]
      console.log('ok')
      currentView.Req = this.parent.Req
      callHooks.call(currentView, 'mounted')
    },
    beforeDestroy() {
      const currentView = this._dynamicComponents[this.state.is]
      if (currentView) {
        currentView.$destroy()
      }
    }
  }
}

export default Component
