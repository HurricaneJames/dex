var React = require('react')
  , jQuery = require('jquery');

var styles = {
  image: {
    display: 'block',
    float: 'left',
    width: '45vw',
    height: '45vh',
    objectFit: 'cover'
  }
}

var PlayBox = React.createClass({
  getInitialState: function() { return { gifs: [] }; },
  parseGifs: function(data) {
    var urls = data.data.children
      .filter(function(post) { return !post.data.over_18; })
      .map(function(post) { return post.data.url.replace(/gifv$/, 'gif'); });
    this.setState({ gifs: this.state.gifs.concat(urls) });
  },
  load: function() {
    jQuery.get('http://www.reddit.com/r/perfectloops/top.json?sort=top&t=week').then(this.parseGifs);
  },
  componentDidMount: function() {
    this.load();
  },
  render: function() {
    var gifs = this.state.gifs.map(function(gif) { return <img src={gif} style={styles.image} />;});
    return (
      <div>
        {gifs}
      </div>
    );
  }

});

module.exports = PlayBox;