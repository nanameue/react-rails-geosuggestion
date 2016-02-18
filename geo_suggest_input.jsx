var GeoSuggestInput = React.createClass({

  getDefaultProps: function() {
    return {
      className: '',
      value: '',
      onChange: function() {},
      onFocus: function() {},
      onBlur: function() {},
      onNext: function() {},
      onPrev: function() {},
      onSelect: function() {},
      onEscape: function() {}
    };
  },

  /**
   * When the input got changed
   */
  onChange: function() {
    var input = ReactDOM.findDOMNode(this.refs.input);
    this.props.onChange(input.value);
  },

  /**
   * When a key gets pressed in the input
   * @param  {Event} event The keypress event
   */
  onInputKeyDown: function(event) {
    switch (event.which) {
      case 40: // DOWN
        event.preventDefault();
        this.props.onNext();
        break;
      case 38: // UP
        event.preventDefault();
        this.props.onPrev();
        break;
      case 13: // ENTER
        event.preventDefault();
        this.props.onSelect();
        break;
      case 9: // TAB
        this.props.onSelect();
        break;
      case 27: // ESC
        this.props.onEscape();
        break;
      default:
        break;
    }
  },

  /**
   * Focus the input
   */
  focus: function() {
    // this.refs.input.focus();
    var input = ReactDOM.findDOMNode(this.refs.input);
    $(input).focus();
  },

  /**
   * Render the view
   * @return {Function} The React element to render
   */
  render: function() {
    var attributes = this.props;
    var classes = classNames(
      'geosuggest__input',
      this.props.className
    );

    return <input className={classes}
      ref='input'
      type='text'
      placeholder={this.props.placeholder}
      value={this.props.value}
      onKeyDown={this.onInputKeyDown}
      onChange={this.onChange}
      onFocus={this.props.onFocus}
      onBlur={this.props.onBlur} />;
  }
});

window.GeoSuggestInput = GeoSuggestInput;
