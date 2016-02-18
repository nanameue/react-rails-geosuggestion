var GeoSuggestItem = React.createClass({
  getDefaultProps: function() {
    return {
      isActive: false,
      className: '',
      suggest: {},
      onMouseDown: function() {},
      onMouseOut: function() {},
      onSelect: function() {}
    };
  },

  render: function() {
    var that = this;
    var classes = classNames(
      'geosuggest-item',
      classNames,
      {'geosuggest-item--active': this.props.isActive}
    );

    return (
      <li className={classes}
        onMouseDown={this.props.onMouseDown}
        onMouseOut={this.props.onMouseOut}
        onClick={function(event) {
          console.log('funccckckckckc');
          event.preventDefault();
          that.props.onSelect();
        }} >
          {this.props.suggest.label}
      </li>
    );
  }

});

window.GeoSuggestItem = GeoSuggestItem;
