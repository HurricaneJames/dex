var React = require('react');

var RAILS_META_TAGS = /^(csrf-param|csrf-token)$/;

var RailsFormRequirements = React.createClass({
  displayName: "RailsFormRequirements",
  propTypes: {
    isCreateForm: React.PropTypes.bool
  },
  getMetaAttributes: function() {
    var metas = document.getElementsByTagName('meta')
      , railsMetas = {}
      , i, len, key;
    for(i=0,len=metas.length; i<len; i++) {
      key=metas[i].getAttribute('name')
      if(RAILS_META_TAGS.test(key)) {
        railsMetas[key] = metas[i].getAttribute('content');
      }
    }
    return railsMetas;
  },
  getFormRequirements: function(isCreateForm) {
    var metaTags = this.getMetaAttributes()
      , elements = [];
    elements.push(<input key='utf8'    type='hidden' name='utf8' value="&#x2713;" />);
    elements.push(<input key='_method' type='hidden' name='_method' value={isCreateForm ? "post" : "patch"} readOnly />);
    elements.push(<input key='csrf'    type='hidden' name={metaTags['csrf-param']} value={metaTags['csrf-token']} readOnly />);
    return elements;
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextProps.isCreateForm !== this.props.isCreateForm;
  },
  render: function() {
    return <div style={{display: 'none'}}>{this.getFormRequirements(this.props.isCreateForm)}</div>;
  }
});


module.exports = RailsFormRequirements;