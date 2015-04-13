var React = require('react')
  , RailsFormRequirements = require('./RailsFormRequirements')
  , ArticleShow = require('./ArticleShow');

var NewImage = React.createClass({
  displayName: "NewImage",
  propTypes: {
    name: React.PropTypes.string,
    position: React.PropTypes.number,
    image: React.PropTypes.shape({
      link: React.PropTypes.string,
      slug: React.PropTypes.string
    }),
    onImageLinked: React.PropTypes.func,
    onImageSlugChange: React.PropTypes.func,
    onPositionChange: React.PropTypes.func
  },
  render: function() {
    return (
      <div>Upload
        <div><label>Image<input type="file" name={this.props.name + '[image_attributes][link]'} value={this.props.image.link} onChange={this.props.onImageLinked} /></label></div>
        <div><label>Slug<input type='text' name={this.props.name + '[image_attributes][slug]'} value={this.props.image.slug} onChange={this.props.onImageSlugChange} /></label></div>
        <div><label>Position<input type="text" name={this.props.name + '[position]'} value={this.props.position} onChange={this.props.onPositionChange} /></label></div>
      </div>
    );
  }
});

var ArticleImage = React.createClass({
  displayName: "ArticleImage",
  propTypes: {
    name: React.PropTypes.string,
    id: React.PropTypes.number,
    position: React.PropTypes.number,
    image: React.PropTypes.shape({
      id: React.PropTypes.number,
      link: React.PropTypes.shape({
        url: React.PropTypes.string.isRequired
      })
    }).isRequired,
    destroy: React.PropTypes.bool,
    onPositionChange: React.PropTypes.func,
    onToggleDestroy: React.PropTypes.func
  },
  render: function() {
    return (
      <div>
        <input type='hidden' name={this.props.name + '[id]'} value={this.props.id} readOnly />
        <input type='hidden' name={this.props.name + '[image_id]'} value={this.props.image.id} readOnly />
        <img src={this.props.image.link.url} width={64} />
        <label>
          Position
          <input type='text' name={this.props.name + '[position]'} value={this.props.position} onChange={this.props.onPositionChange} />
        </label>
        <span>
          <input type="hidden" name={this.props.name + '[_destroy]'} value="0" readOnly />
          <input type="checkbox" name={this.props.name + '[_destroy]'} value="1" onChange={this.props.onToggleDestroy} />
          Remove
        </span>
      </div>
    );
  }
});

var ArticleImageListItem = React.createClass({
  displayName: "ArticleImageListItem",
  propTypes: {
    name: React.PropTypes.string,
    id: React.PropTypes.number,
    position: React.PropTypes.number,
    image: React.PropTypes.shape({
      id: React.PropTypes.number,
      link: React.PropTypes.object
    }).isRequired,
    destroy: React.PropTypes.bool,
    onPositionChange: React.PropTypes.func,
    onToggleDestroy: React.PropTypes.func,
    onImageLinked: React.PropTypes.func,
    onImageSlugChange: React.PropTypes.func
  },
  render: function() {
    if(!this.props.image.link || typeof(this.props.image.link) === 'string') {
      return (
        <NewImage
          name={this.props.name}
          position={this.props.position}
          image={this.props.image}
          onImageLinked={this.props.onImageLinked}
          onImageSlugChange={this.props.onImageSlugChange}
          onPositionChange={this.props.onPositionChange}
        />
      );
    }
    return(
      <ArticleImage
        id={this.props.id}
        name={this.props.name}
        position={this.props.position}
        image={this.props.image}
        onPositionChange={this.props.onPositionChange}
        onToggleDestroy={this.props.onToggleDestroy}
      />
    );
  }
});

var ArticleImageList = React.createClass({
  displayName: "ArticleImageList",
  propTypes: {
    name: React.PropTypes.string,
    articleImageAssociations: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number,
      position: React.PropTypes.number,
      image: React.PropTypes.shape({
        id: React.PropTypes.number,
        link: React.PropTypes.object
      }),
      destroy: React.PropTypes.bool
    })),
    extraSlugs: React.PropTypes.arrayOf(React.PropTypes.string),
    onPositionChange: React.PropTypes.func,
    onToggleDestroy: React.PropTypes.func,
    onAddByUploadClicked: React.PropTypes.func,
    onAddBySlugClicked: React.PropTypes.func,
    onImageLinked: React.PropTypes.func,
    onImageSlugChange: React.PropTypes.func,
    onExtraSlugChange: React.PropTypes.func
  },
  render: function() {
    var images = this.props.articleImageAssociations.map(function(association, index) {
      return <ArticleImageListItem
        key={index}
        name={this.props.name + '[' + index + ']'}
        id={association.id}
        position={association.position}
        image={association.image}
        destroy={association.destroy}
        onPositionChange={this.props.onPositionChange.bind(null, index)}
        onToggleDestroy={this.props.onToggleDestroy.bind(null, index)}
        onImageLinked={this.props.onImageLinked.bind(null, index)}
        onImageSlugChange={this.props.onImageSlugChange.bind(null, index)}
      />;
    }, this);
    var extraSlugs = this.props.extraSlugs.map(function(slug, index) {
      return <input key={'slug_' + index} type='text' name={'add_slug[' + index + ']'} value={slug} onChange={this.props.onExtraSlugChange.bind(null, index)} />;
    }, this);
    return (
      <div>
        <div>
          <span onClick={this.props.onAddByUploadClicked}>Upload</span> | 
          <span onClick={this.props.onAddBySlugClicked}>Add By Slug</span>
        </div>
        {images}
        {extraSlugs}
      </div>
    );
  }
});

var ArticleForm = React.createClass({
  displayName: "ArticleForm",
  propTypes: {
    name: React.PropTypes.string,
    id: React.PropTypes.number,
    slug: React.PropTypes.string,
    headline: React.PropTypes.string,
    subheadline: React.PropTypes.string,
    contributors: React.PropTypes.string,
    date: React.PropTypes.string,
    body: React.PropTypes.string,
    state: React.PropTypes.string,
    articleImageAssociations: React.PropTypes.array,
    extraSlugs: React.PropTypes.arrayOf(React.PropTypes.string),
    stateOptions: React.PropTypes.array,
    onSlugChange: React.PropTypes.func,
    onHeadlineChange: React.PropTypes.func,
    onSubheadlineChange: React.PropTypes.func,
    onContributorsChange: React.PropTypes.func,
    onDateChange: React.PropTypes.func,
    onBodyChange: React.PropTypes.func,
    onStateChange: React.PropTypes.func,
    onImagePositionChange: React.PropTypes.func,
    onImageDestroy: React.PropTypes.func,
    onImageLinked: React.PropTypes.func,
    onAddByUploadClicked: React.PropTypes.func,
    onAddBySlugClicked: React.PropTypes.func,
    onImageSlugChange: React.PropTypes.func,
    onExtraSlugChange: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      stateOptions: [
        <option key='working' value="working">Working</option>,
        <option key='live'    value="live"   >Live</option>
      ]
    };
  },
  isFormUploadingFiles: function() {
    var i, len=this.props.articleImageAssociations.length;
    for(i=0; i<len; i++) {
      if(!this.props.articleImageAssociations[i].id) { return true; }
    }
    return false;
  },
  render: function() {
    var isCreateForm = !this.props.id
      , formPath = '/articles' + (isCreateForm ? '' : '/' + this.props.id);
    return (
      <form acceptCharset="UTF-8" action={formPath} method="post" encType={this.isFormUploadingFiles() ? "multipart/form-data" : "application/x-www-form-urlencoded"}>
        <RailsFormRequirements isCreateForm={isCreateForm} />
        <h1>Article</h1>
        <div><a href={"/articles/" + this.props.id}>View</a></div>
        <div><div><input type="hidden" name={this.props.name + '[id]'} value={this.props.id} readOnly /></div></div>
        <div><label>Slug<input type='text' name={this.props.name + '[slug]'} value={this.props.slug} onChange={this.props.onSlugChange} /></label></div>
        <div><label>Headline<input type='text' name={this.props.name + '[headline]'} value={this.props.headline} onChange={this.props.onHeadlineChange} /></label></div>
        <div><label>Subheadline<input type='text' name={this.props.name + '[subheadline]'} value={this.props.subheadline} onChange={this.props.onSubheadlineChange} /></label></div>
        <div><label>Contributors<textarea name={this.props.name + '[contributors]' } value={this.props.contributors} onChange={this.props.onContributorsChange} /></label></div>
        <div><label>Date<input type='text' name={this.props.name + '[date]'} value={this.props.date} onChange={this.props.onDateChange} /></label></div>
        <div><label>Body<textarea name={this.props.name + '[body]'} value={this.props.body} onChange={this.props.onBodyChange} rows={25} /></label></div>
        <div><label>State<select name={this.props.name + '[state]'} value={this.props.state} onChange={this.props.onStateChange}>{this.props.stateOptions}</select></label></div>
        <ArticleImageList
          name={this.props.name + '[article_image_associations_attributes]'}
          articleImageAssociations={this.props.articleImageAssociations}
          extraSlugs={this.props.extraSlugs}
          onPositionChange={this.props.onImagePositionChange}
          onToggleDestroy={this.props.onImageDestroy}
          onImageLinked={this.props.onImageLinked}
          onAddByUploadClicked={this.props.onAddByUploadClicked}
          onImageSlugChange={this.props.onImageSlugChange}
          onAddBySlugClicked={this.props.onAddBySlugClicked}
          onExtraSlugChange={this.props.onExtraSlugChange}
        />
        <input type="submit" name="commit" value={this.props.id ? "Update" : "Create"} />
      </form>
    );
  }
});

var ArticleEdit = React.createClass({
  displayName: "ArticleEdit",
  propTypes: {
    id: React.PropTypes.number,
    slug: React.PropTypes.string,
    headline: React.PropTypes.string,
    subheadline: React.PropTypes.string,
    contributors: React.PropTypes.string,
    date: React.PropTypes.string,
    body: React.PropTypes.string,
    state: React.PropTypes.string,
    article_image_associations: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.number,
      position: React.PropTypes.number,
      image: React.PropTypes.shape({
        id: React.PropTypes.number,
        link: React.PropTypes.shape({
          url: React.PropTypes.string.isRequired
        })
      }),
      destroy: React.PropTypes.bool
    }))
  },
  getInitialState: function() {
    return {
      id: this.props.id,
      slug: this.props.slug,
      headline: this.props.headline,
      subheadline: this.props.subheadline,
      contributors: this.props.contributors,
      date: this.props.date,
      body: this.props.body,
      state: this.props.state,
      articleImageAssociations: this.props.article_image_associations,
      extraSlugs: []
    };
  },
  getNextImagePosition: function(articleImageAssociations) {
    var i, len, current, biggest=1;
    for(i=0,len=articleImageAssociations.length; i<len; i++) {
      current = articleImageAssociations[i].position;
      if(current >= biggest) {
        biggest = current + 1;
      }
    }
    return biggest;
  },
  onChange: function(property, event) {
    var newState = {};
    newState[property] = event.target.value;
    this.setState(newState);
  },
  onImagePositionChange: function(associationIndex, e) {
    var articleImageAssociations = this.state.articleImageAssociations;
    articleImageAssociations[associationIndex].position = parseInt(e.target.value);
    this.setState({articleImageAssociations: articleImageAssociations});
  },
  onImageLinked: function(associationIndex, e) {
    var articleImageAssociations = this.state.articleImageAssociations;
    articleImageAssociations[associationIndex].image.link = e.target.value;
    this.setState({articleImageAssociations: articleImageAssociations});
  },
  onImageDestroy: function(associationIndex, e) {
    var articleImageAssociations = this.state.articleImageAssociations;
    articleImageAssociations[associationIndex].destroy = !articleImageAssociations[associationIndex].destroy;
    this.setState({articleImageAssociations: articleImageAssociations});
  },
  onImageSlugChange: function(associationIndex, e) {
    var articleImageAssociations = this.state.articleImageAssociations;
    articleImageAssociations[associationIndex].image.slug = e.target.value;
    this.setState({articleImageAssociations: articleImageAssociations});    
  },
  onAddImageUpload: function() {
    var articleImageAssociations = this.state.articleImageAssociations;
    articleImageAssociations.push({
      position: this.getNextImagePosition(articleImageAssociations),
      image: {},
      destroy: false
    });
    this.setState({articleImageAssociations: articleImageAssociations});
  },
  onAddImageBySlug: function() {
    var extraSlugs = this.state.extraSlugs;
    extraSlugs.push('');
    this.setState({extraSlugs: extraSlugs});
  },
  onExtraSlugChange: function(slugIndex, e) {
    var extraSlugs = this.state.extraSlugs;
    extraSlugs[slugIndex] = e.target.value;
    this.setState({extraSlugs: extraSlugs});
  },
  getImages: function() {
    var associations = this.state.articleImageAssociations
      , i, len=associations.length
      , images=[];
    for(i=0; i<len; i++) {
      images.push(associations[i].image);
    }
    return images;
  },
  render: function() {
    return (
      <div>
        <div style={{width: '30%', display: 'inline-block', verticalAlign: 'top', paddingRight: 10}}>
          <ArticleForm
            name='article'
            id={this.state.id}
            slug={this.state.slug}
            headline={this.state.headline}
            subheadline={this.state.subheadline}
            contributors={this.state.contributors}
            date={this.state.date}
            body={this.state.body}
            state={this.state.state}
            articleImageAssociations={this.state.articleImageAssociations}
            extraSlugs={this.state.extraSlugs}
            onSlugChange={this.onChange.bind(null, 'slug')}
            onHeadlineChange={this.onChange.bind(null, 'headline')}
            onSubheadlineChange={this.onChange.bind(null, 'subheadline')}
            onContributorsChange={this.onChange.bind(null, 'contributors')}
            onDateChange={this.onChange.bind(null, 'date')}
            onBodyChange={this.onChange.bind(null, 'body')}
            onStateChange={this.onChange.bind(null, 'state')}
            onImagePositionChange={this.onImagePositionChange}
            onImageDestroy={this.onImageDestroy}
            onImageLinked={this.onImageLinked}
            onAddByUploadClicked={this.onAddImageUpload}
            onImageSlugChange={this.onImageSlugChange}
            onAddBySlugClicked={this.onAddImageBySlug}
            onExtraSlugChange={this.onExtraSlugChange}
          />
        </div>
        <div style={{width: '66%', display: 'inline-block', borderLeft: '1px solid black', paddingLeft: 10}}>
          <ArticleShow
            slug={this.props.slug}
            headline={this.props.headline}
            subheadline={this.props.contributors}
            contributors={this.state.contributors}
            date={this.props.date}
            body={this.state.body}
            images={this.getImages()}
          />
        </div>
      </div>
    );
  }
});

module.exports = ArticleEdit;