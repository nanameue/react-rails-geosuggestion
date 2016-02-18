var clog = bows('SuggestList');

var GeoSuggestList = React.createClass({
  getDefaultProps: function() {
    return {
      isHidden: true,
      suggests: [],
      activeSuggest: null,
      onSuggestMouseDown: function() {},
      onSuggestMouseOut: function() {},
      onSuggestSelect: function() {}
    };
  },

  render: function() {

    var classes = classNames(
      'geosuggest__suggests',
      {'geosuggest__suggests--hidden': this.props.isHidden}
    );
    var that = this;

    var items = this.props.suggests.map(function(suggest) {
      var isActive = false;
      if (that.props.activeSuggest) {
        isActive = suggest.placeId === that.props.activeSuggest.placeId;
      }

      return (
        <GeoSuggestItem key={suggest.placeId}
          suggest={suggest}
          isActive={isActive}
          onMouseDown={that.props.onSuggestMouseDown}
          onMouseOut={that.props.onSuggestMouseOut}
          onSelect={function() { that.props.onSuggestSelect(suggest); } } />
      );
    });

    if (items.length > 0) {
      return (
        <ul className={classes}>
          {items}
        </ul>
      );
    }
    else {
      return null;
    }
  }

});

window.GeoSuggestList = GeoSuggestList;
