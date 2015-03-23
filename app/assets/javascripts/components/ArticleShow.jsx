var React = require('react');

var MainImage = React.createClass({
  displayName: 'MainImage',
  propTypes: {
    image: React.PropTypes.shape({
      link: React.PropTypes.shape({
        url: React.PropTypes.string.isRequired
      }).isRequired,
      caption: React.PropTypes.string,
      owner: React.PropTypes.string
    })
  },
  render: function() {
    return (
      <div>
        <img src={this.props.image.link.url} width={400} />
        {
          this.props.caption &&
          <div>{this.props.caption}</div>
        }
        {
          this.props.owner &&
          <div>Copyright: {this.props.owner}</div>
        }
      </div>
    );
  }
});

var ImageFilledText = React.createClass({
  displayName: "ImageFilledText",
  propTypes: {
    text: React.PropTypes.string,
    images: React.PropTypes.arrayOf(React.PropTypes.shape({
      link: React.PropTypes.shape({
        url: React.PropTypes.string.isRequired
      })
    }))
  },
  render: function(){
    var _this = this
      , i=0
      , parsedBody = this.props.text.replace(/\n/g, "\n<br />\n").replace(/\[image\]/g, function(match) {
        return '<img src="' + _this.props.images[i++].link.url + '" width="230" />';
      });

    // this is stupid, we definitely sould not be using this here...
    return <div dangerouslySetInnerHTML={{__html: parsedBody}} />
  }
});

var Article = React.createClass({
  displayName: 'Article',
  propTypes: {
    headline: React.PropTypes.string.isRequired,
    subheadline: React.PropTypes.string,
    contributors: React.PropTypes.string,
    date: React.PropTypes.string,
    body: React.PropTypes.string.isRequired,
    images: React.PropTypes.array
  },
  render: function() {
    console.debug("Images: %o", this.props.images);
    return (
      <div>
        <h1>{this.props.headline}: </h1>
        <h2>{this.props.subheadline}</h2>
        <MainImage image={this.props.images[0]} />
        <h3>By: {this.props.contributors}</h3>
        <h3>Date: {this.props.date}</h3>
        <ImageFilledText text={this.props.body} images={this.props.images.slice(1)} />
      </div>
    );
  }

});

module.exports = Article;