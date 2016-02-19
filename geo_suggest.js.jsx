
// Escapes special characters in user input for regex
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

var GeoSuggest = React.createClass({

  getDefaultProps: function() {
    return {
      fixtures: [],
      initialValue: '',
      placeholder: 'Search places',
      disabled: false,
      className: '',
      inputClassName: '',
      location: null,
      radius: null,
      bounds: null,
      country: null,
      types: null,
      googleMaps: null,
      onSuggestSelect: function() {},
      onFocus: function() {},
      onBlur: function() {},
      onChange: function() {},
      skipSuggest: function() {},
      getSuggestLabel: function(suggest) { return suggest.description; },
      autoActivateFirstSuggest: false
    };
  },

  getInitialState: function() {
    return {
      isMounted: false,
      isSuggestsHidden: true,
      userInput: this.props.initialValue,
      activeSuggest: null,
      suggests: []
    };
  },

  /**
   * Change inputValue if prop changes
   * @param {Object} props The new props
   */
  componentWillReceiveProps: function(props) {
    if (this.props.initialValue !== props.initialValue) {
      this.setState({userInput: this.props.initialValue});
    }
  },

  /**
   * Called on the client side after component is mounted.
   * Google api sdk object will be obtained and cached as a instance property.
   * Necessary objects of google api will also be determined and saved.
   */
  componentDidMount: function() {
    this.setState({userInput: this.props.initialValue});

    var googleMaps = this.props.googleMaps ||
      (window.google && // eslint-disable-line no-extra-parens
        window.google.maps) ||
      this.googleMaps;

    if (!googleMaps) {
      console.error('Google map api was not found in the page.');
      return;
    }
    this.googleMaps = googleMaps;

    this.autocompleteService = new googleMaps.places.AutocompleteService();
    this.geocoder = new googleMaps.Geocoder();

    this.setState({isMounted: true});
  },

  componentDidUpdate: function() {
    var selectedItem = $($('.geosuggest-item--active')[0]);
    if (selectedItem.length > 0) {
      scrollPosition = selectedItem.position().top;
      $('.geosuggest__suggests').scrollTop(scrollPosition)
    }
  },

  /**
   * When the component will unmount
   */
  componentWillUnmount: function() {
    this.setState({isMounted: false});
  },

  /**
   * When the input got changed
   * @param {String} userInput The input value of the user
   */
  onInputChange: function(userInput) {
    var that = this;
    this.setState({userInput: userInput, activeSuggest: null}, function() {
      that.showSuggests();
      that.props.onChange(userInput);
    });
  },

  /**
   * When the input gets focused
   */
  onInputFocus: function() {
    this.props.onFocus();
    this.showSuggests();
  },

  /**
   * When the input gets blurred
   */
  onInputBlur: function() {
    if (!this.state.ignoreBlur) {
      this.hideSuggests();
    }
  },

  /**
   * Focus the input
   */
  focus: function() {
    this.refs.input.focus();
    // var input = ReactDOM.findDOMNode(this.refs.input);
    // $(input).focus();
  },

  /**
   * Update the value of the user input
   * @param {String} userInput the new value of the user input
   */
  update: function(userInput) {
    this.setState({userInput: userInput});
    this.props.onChange(userInput);
  },

  /*
   * Clear the input and close the suggestion pane
   */
  clear: function() {
    this.setState({userInput: ''}, function() { this.hideSuggests(); });
  },

  /**
   * Search for new suggests
   */
  searchSuggests: function() {
    var that = this;
    if (!this.state.userInput) {
      this.updateSuggests();
      return;
    }

    var options = {
      input: this.state.userInput
    };

    ['location', 'radius', 'bounds', 'types'].forEach( function(option) {
      if (that.props[option]) {
        options[option] = that.props[option];
      }
    });

    if (this.props.country) {
      options.componentRestrictions = {
        country: this.props.country
      };
    }

    this.autocompleteService.getPlacePredictions(
      options,
      function(suggestsGoogle) {
        that.updateSuggests(suggestsGoogle || []); // can be null

        if (that.props.autoActivateFirstSuggest) {
          that.activateSuggest('next');
        }
      }
    );
  },

  /**
   * Update the suggests
   * @param  {Array} suggestsGoogle The new google suggests
   */
  updateSuggests: function(suggestsGoogle) {
    var that = this;
    if (!suggestsGoogle) {
      suggestsGoogle = [];
    }

    var suggests    = [];
    var regex       = new RegExp(escapeRegExp(this.state.userInput), 'gim');
    var skipSuggest = this.props.skipSuggest;

    this.props.fixtures.forEach(function(suggest) {
      if (!skipSuggest(suggest) && suggest.label.match(regex)) {
        suggest.placeId = suggest.label;
        suggests.push(suggest);
      }
    });

    suggestsGoogle.forEach(function(suggest) {
      if (!skipSuggest(suggest)) {
        suggests.push({
          label: that.props.getSuggestLabel(suggest),
          placeId: suggest.place_id
        });
      }
    });
    this.setState({ suggests: suggests });
  },

  /**
   * Show the suggestions
   */
  showSuggests: function() {
    this.searchSuggests();
    this.setState({isSuggestsHidden: false});
  },

  /**
   * Hide the suggestions
   */
  hideSuggests: function() {
    var that = this;
    this.props.onBlur();
    setTimeout(function() {
      if (that.state && that.state.isMounted) {
        that.setState({isSuggestsHidden: true});
      }
    }, 100);
  },

  /**
   * Activate a new suggest
   * @param {String} direction The direction in which to activate new suggest
   */
  activateSuggest: function(direction) { // eslint-disable-line complexity
    if (this.state.isSuggestsHidden) {
      this.showSuggests();
      return;
    }

    const suggestsCount = this.state.suggests.length - 1;
    var next = direction === 'next';
    var newActiveSuggest = null;
    var newIndex = 0;

    for (var i = 0; i <= suggestsCount; i++) {
      if (this.state.suggests[i] === this.state.activeSuggest) {
        newIndex = next ? i + 1 : i - 1;
      }
    }

    if (!this.state.activeSuggest) {
      newIndex = next ? 0 : suggestsCount;
    }

    if (newIndex >= 0 && newIndex <= suggestsCount) {
      newActiveSuggest = this.state.suggests[newIndex];
    }
    this.setState({activeSuggest: newActiveSuggest});
  },

  /**
   * When an item got selected
   * @param {GeosuggestItem} suggest The selected suggest item
   */
  selectSuggest: function(suggest) {
    if (!suggest) {
      suggest = {
        label: this.state.userInput
      };
    }
    this.setState({
      isSuggestsHidden: true,
      userInput: suggest.label
    });

    if (suggest.location) {
      this.setState({ignoreBlur: false});
      this.props.onSuggestSelect(suggest);
      return;
    }

    this.geocodeSuggest(suggest);
  },

  /**
   * Geocode a suggest
   * @param  {Object} suggest The suggest
   */
  geocodeSuggest: function(suggest) {

    var that = this;

    this.geocoder.geocode(
      suggest.placeId ? {placeId: suggest.placeId} : {address: suggest.label},
      (results, status) => {
        if (status !== that.googleMaps.GeocoderStatus.OK) {
          return;
        }

        var gmaps = results[0],
          location = gmaps.geometry.location;

        suggest.gmaps = gmaps;
        suggest.location = {
          lat: location.lat(),
          lng: location.lng()
        };

        that.props.onSuggestSelect(suggest);
      }
    );
  },

  /**
   * Render the view
   * @return {Function} The React element to render
   */
  render: function() {
    // const attributes = filterInputAttributes(this.props);
    var attributes = this.props;
    var classes = classNames(
      'geosuggest',
      this.props.className
    );

    var that = this;

    return (
      <div className={classes}>

        <GeoSuggestInput className={this.props.inputClassName}
          ref='input'
          value={this.state.userInput}
          {...attributes}
          onChange={this.onInputChange}
          onFocus={this.onInputFocus}
          onBlur={this.onInputBlur}
          onNext={function() { that.activateSuggest('next'); }}
          onPrev={function() { that.activateSuggest('prev'); }}
          onSelect={function() { that.selectSuggest(that.state.activeSuggest); }}
          onEscape={this.hideSuggests}
          />

        <GeoSuggestList
          isHidden={this.state.isSuggestsHidden}
          suggests={this.state.suggests}
          activeSuggest={this.state.activeSuggest}
          onSuggestMouseDown={function() { that.setState({ignoreBlur: true})}}
          onSuggestMouseOut={function(){ that.setState({ignoreBlur: false})}}
          placeholder={this.props.placeholder}
          onSuggestSelect={this.selectSuggest}/>

      </div>
    );
  }

});

window.GeoSuggest = GeoSuggest;
