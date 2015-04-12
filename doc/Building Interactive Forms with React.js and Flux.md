Building Interactive Forms with React.js and Reflux
===================================================

React is a great view library. If used just right, even makes an alright controller. However, sometimes you need something more. That is where Flux can be handy.

Flux is the Facebook solution to keep the MVC paradigm from becoming unmanagable. If you are wondering if Flux is right for your project, Dan Abramov made ["The Case for Flux"](https://medium.com/@dan_abramov/the-case-for-flux-379b7d1982c6) a few weeks ago. I cannot recommend his article enough. To summarize, Dan points out that Flux is great if:

* "your data changes over time" and you "care about immediately reflecting those changes in the UI"
* "you want to cache data in memory, but it can change while cached"
* "your data is relational and models include and depend on each other"
* "the same data is assembled from different sources and can be rendered in several places throughout the UI"

If none of that sounds important, you probably do not need Flux. Let's assume it does sound important though. What next?


The Assignment
--------------

Our client has a very basic content managmenet system. It has basic articles and images, and a ton of pre-existing content. However, it was originally written as part of a guide on how to do something else. It never worked very well and it a major pain for the content producers. It is our job to fix it and add a bunch of new features.

The List
* have a live view of the article as it is being written
* drag the images around instead of using position fields
* fix the image upload system
* "add by slug" needs to provide suggestions

Based on this list, it is pretty obvious that we meet several of Dan's reasons. Could we do this with backbone, sure, but it would be a pain. We are going to use React.js and Reflux.js instead.

Flux
----

    ╔═════════╗     ╔════════════╗     ╔════════╗     ╔═════════════════╗
    ║ Actions ║────>║ Dispatcher ║────>║ Stores ║────>║ View Components ║
    ╚═════════╝     ╚════════════╝     ╚════════╝     ╚═════════════════╝
         ^                                                    │
         └────────────────────────────────────────────────────┘


Flux is a version of the Model View Controller paradigm that focuses on unidirectional dataflow. It specifies a dispatcher, some stores, some views, and some actions. Actions trigger the dispatcher. The dispatcher routes actions to interested stores. The stores update based on the action, and then notify the views to rerender. Then, the cycle starts all over again.

There is a lot more detail, but this is where I'm going to stop. Instead, we are going to use Reflux.


Reflux
------

    ╔═════════╗       ╔════════╗       ╔═════════════════╗
    ║ Actions ║──────>║ Stores ║──────>║ View Components ║
    ╚═════════╝       ╚════════╝       ╚═════════════════╝
         ^                                      │
         └──────────────────────────────────────┘

[Reflux](https://github.com/spoike/refluxjs) is an implemention of the basic concepts of Flux by Mikael Brassman. It greatly simplifies Flux by removing the dispatcher. Rather than actions flowing through a dispatcher, actions flow directly to the stores.

It is still possible to do everything with Reflux that can be done with Flux because stores can listen to other stores. However, in practice, I have yet to find that useful. Mostly, it just leads to overly complex code.


Getting Started
---------------

The examples in this article are based on the [Dex](https://github.com/HurricaneJames/dex) code base. Dex is based on Rails and Browserify. However, the concepts in this article should be easily transferrable. We will be working on the BlueBird component, located in `app/assets/javascripts/components/BlueBird.jsx`. BlueBird is put in the global scope in `components.js` and loaded onto the page by `react_component` from the [react-rails](https://github.com/reactjs/react-rails) package.

If you want to follow along and write code as we go grab [Dex v3.0](https://github.com/HurricaneJames/dex/tree/v3.0).

    git clone https://github.com/HurricaneJames/dex/tree/v3.0
    cd dex
    bundle install
    npm install
    rails s

If you just want to jump to the end, grab [Dex v3.1](https://github.com/HurricaneJames/dex/tree/v3.1). All of the code from this article will be available there.

    git clone https://github.com/HurricaneJames/dex/tree/v3.1
    cd dex
    bundle install
    npm install
    rails s
    # open a browser and point it to http://localhost:3000/pages/index


Articles
--------

Looking at the requirements list, we decide that we will replace the `show` view with a React component. This way we can both show the article to front end users as well as in the back end edit page.

Create a file, `app/assets/javascripts/components/ArticleShow.jsx`.

    var React = require('react');

    var ArticleShow = React.createClass({
      displayName: 'ArticleShow',
      propTypes: {
        headline: React.PropTypes.string.isRequired,
        subheadline: React.PropTypes.string,
        contributors: React.PropTypes.string,
        date: React.PropTypes.string,
        body: React.PropTypes.string.isRequired,
        images: React.PropTypes.array
      },
      render: function() {
        return (
          <div>
            <h1>{this.props.headline}: </h1>
            <h2>{this.props.subheadline}</h2>
            <MainImage image={this.props.image[0]} />
            <h3>By: {this.props.contributors}</h3>
            <h3>Date: {this.props.date}</h3>
            <ImageFilledText text={this.props.body} images={this.props.images.slice(1)} />
          </div>
        );
      }
    });

    module.exports = ArticleShow;

This is a fairly straight forward re-implementation of `app/views/articles/show.html.erb`. If you are already comfortable with React.js, there is nothing special to see here. We do use a couple of extra composite components though.

`MainImage` is fairly simple, a div with an image and two optional divs as children. It is also unlikely to be used outside of the ArticleShow component, so we are going to stick it in `ArticleShow.jsx`. It might be worth noting the `propTypes`, as it demonstrates the `shape` propType, which I see far too infrequently.

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

The `ImageFilledText` component is a little more "interesting." `ImageFilledText` is supposed to replicate the behavior of `parse_body` from the Rails application helper.

    def parse_body(body, images)
      ret_body = body.gsub(/\r/, '').gsub(/\n/, '<br />')
      index = 0
      ret_body.gsub('[image]') { |match| images[index=index+1] ? image_tag(images[index].try(:link), width: '230') : '' }.html_safe
    end

The `parse_body` function does a couple things, it replaces `\n` with `<br />`, and it replaces `[image]` with an `<img />` tag. That is easy enough to code up.

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

However, not the *huge* potential security hole identified by `dangerouslySetInnerHTML`. Sadly, the original code requires `dangerouslySetInnerHTML` because it used `html_safe` with the possibility of other html tags in the body. There are no other protections on that field in code base, but we can pretend there are and address the security hole at a later date/article.

To render the React.js version of the article, we can use the React-Rails `render_component` method. Add `ArticleShow.jsx` to the `app/assets/javascript/components.js` file and replace everything in `app/views/article/show.html.erb` a single call.

    <%= react_component 'Article', @article.to_json(root: false, include: [images: { root: false }]) %>

At this point the user will see the same articles as before.


Edit Form
---------

Now we can turn our attention to our real task, the content management system. First, create an `ArticleEdit.jsx` file. Then, add `ArticleEdit = require('./components/ArticleEdit');` to `components.js` like we did for `ArticleShow` in the last section. Next, we will replace the form in `app/views/articles/edit.html.erb` with a single call to `react_component`.

    <%= react_component 'ArticleEdit',
        @article.to_json(
          root: false,
          include: [
            article_image_associations: {
              root: false,
              include: [:image]
            }
          ]
        )
    %>

This call serializes the article to JSON, including article_image_associations and their images. There are better ways to serialize the data and get it to react, but those are the subject of a different article. We are going to keep it simple and just focus on the form for now. In the end, the JSON will parse to match the `propTypes` for our `ArticleEdit` component below.

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
        article_image_associations: React.PropTypes.array(React.PropTypes.shape({
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
      render: function() {}
    };
    module.exports = ArticleEdit;

It is a huge anti-pattern to convert props to state. However, since this component is acting as a store which needs to mutate the props, it is a necessary evil. Also, we know the ArticleEdit is only ever injected by react_ujs, so it will not be receiving new props.

### TODO - add link to container components here

A useful pattern is the [container component](). A container component handles the mutable aspects and calls a view component which does not keep state. We will call our view component `ArticleForm`, and call it as the lone component in `ArticleEdit#render`.

    render: function() {
      return (
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
      );

Wow, that is a lot of props, and it only gets worse as the form grows. Flux will help with this later, but we will live for it in this section.

### ArticleForm

Huge propTypes section aside, `ArticleForm` is mostly a fairly standard React form.

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

            <div>
              <div>
                <input type="hidden" name={this.props.name + '[id]'} value={this.props.id} readOnly />
              </div>
            </div>
            <div>
              <label>
                Slug
                <input type='text' name={this.props.name + '[slug]'} value={this.props.slug} onChange={this.props.onSlugChange} />
              </label>
            </div>
            <div>
              <label>
                Headline
                <input type='text' name={this.props.name + '[headline]'} value={this.props.headline} onChange={this.props.onHeadlineChange} />
              </label>
            </div>
            <div>
              <label>
                Subheadline
                <input type='text' name={this.props.name + '[subheadline]'} value={this.props.subheadline} onChange={this.props.onSubheadlineChange} />
              </label>
            </div>
            <div>
              <label>
                Contributors
                <textarea name={this.props.name + '[contributors]' } value={this.props.contributors} onChange={this.props.onContributorsChange} />
              </label>
            </div>
            <div>
              <label>
                Date
                <input type='text' name={this.props.name + '[date]'} value={this.props.date} onChange={this.props.onDateChange} />
              </label>
            </div>
            <div>
              <label>
                Body
                <textarea name={this.props.name + '[body]'} value={this.props.body} onChange={this.props.onBodyChange} />
              </label>
            </div>
            <div>
              <label>
                State
                <select name={this.props.name + '[state]'} value={this.props.state} onChange={this.props.onStateChange}>{this.props.stateOptions}</select>
              </label>
            </div>
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

There are some interesting things happening here though.

First, notice the `RailsFormRequirements` component that helps when submitting forms to a Rails backend. If you are not using Rails as your backend, ignore it. If you are, this little component is a good friend that handles some of the magic that Rails gave you with form builders. It handles the `_method` input element that Rails needs for routing. It also adds a field with the info provided by `csrf_meta_tags`. Form builder normally does this for us, but React does not.

Second, notice that we are wrapping the inputs inside the labels. We could add the `htmlFor` tag to our label like Rails does, but that would mean control element ids. Also, there seems to be an emerging pattern to embed control elements in the label for accessbility purposes.

Third, if you are new building forms in react, notice the form elements. They all take a name property similar to `name={this.props.name + '[attribute]'}`. This is because we are using an actual form submission to Rails as the backend. It would not be overly difficult to update this as a json call, but the backend does not currently support that, so neither do we... yet.

Finally, the `ArticleImageList` component handles the images.

### ArticleImageList

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

Things to note:
1. `propTypes.articleImageAssociations` was expanded with information that this component actually uses. In `ArticleForm` is was just an array since that is all `ArticleForm` cared about.
2. We push the images down into another composite component, `ArticleImageListItem`.
3. `extraSlugs` is mapped to `input` elements, instead of appending them with jQuery the way it was before.
4. By this point it should be pretty obvious that we are just passing the event handlers up to the container component, though here we use a trick, `.bind(null, index)` creates a function with the index property so we do not need to pass that prop down to the `ArticleImageListItem` or add refs to figure map changes from the added slugs.

### ArticleImageListItem

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

`ArticleImageListItem` is really simple. Ignoring the large block of `propTypes`, and this function just returns either a `NewImage` or `ArticleImage` component depending on whether the image link.

### NewImage

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
            <div>
              <label>
                Image
                <input type="file" name={this.props.name + '[image_attributes][link]'} value={this.props.image.link} onChange={this.props.onImageLinked} />
              </label>
            </div>
            <div>
              <label>
                Slug
                <input type='text' name={this.props.name + '[image_attributes][slug]'} value={this.props.image.slug} onChange={this.props.onImageSlugChange} />
              </label>
            </div>
            <div>
              <label>
                Position
                <input type="text" name={this.props.name + '[position]'} value={this.props.position} onChange={this.props.onPositionChange} />
              </label>
            </div>
          </div>
        );
      }
    });

A `NewImage` component adds three fields to the form, iamge, slug, and position. Notice that we have finally hit the bottom for our callbacks.

### ArticleImage

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

ArticleImage adds hidden inputs for our the association id and the image id, shows the image, has a position field, and remove checkbox. Finally, we reach the bottom of the render tree.

### Conversion Recap

Our conversion from Rails views to React.js components is done. Note that we did not need to use Flux at all. In fact, React.js worked perfectly fine as a controller for us in this case. However, this form starts to show some of the limitations of a React.js only system.

However, that is just annoying at this point. Let's see how far we can get with our requirements.

Live Preview
------------

Our client's very first request was "have a live view of the article as it is being written." Previously, that would have been difficult bordering on impossible. Now, however, it is almost trivial.

First, add `ArticleShow` to `ArticleEdit.jsx`.

    var ArticleShow = require('./ArticleShow');

Second, update the `ArticleEdit` component's `render` function to display the `ArticleShow` view based on the same data as `ArticleForm`.

    render: function() {
      var formStyle = {
        width: '30%',
        display: 'inline-block',
        verticalAlign: 'top',
        paddingRight: 10
      }, showStyle = {
        width: '66%',
        display: 'inline-block',
        borderLeft: '1px solid black',
        paddingLeft: 10
      };
      return (
        <div>
          <div style={formStyle}>
            <ArticleForm ... />
          </div>
          <div style={showStyle}>
            <ArticleShow
              slug={this.props.slug}
              headline={this.props.headline}
              subheadline={this.props.contributors}
              date={this.props.date}
              body={this.state.body}
              images={this.getImages()}
            />
          </div>
        </div>
      );
    }

We wrap `ArticleForm` and `ArticleShow` in divs that we style to make them look "passable." Then, we wrap the whole thing in a `div` because return can only send back a single value. Boom! It works. The only quirk was the `images` prop, which edit has via articleImageAssociations

    getImages: function() {
      var associations = this.state.articleImageAssociations
        , i, len=associations.length
        , images=[];
      for(i=0; i<len; i++) {
        images.push(associations[i].image);
      }
      return images;
    }


Adding Reflux to Our Project
----------------------------

The first thing we will need to do is add Reflux to our project. Since we are using browserify, we can add to the `package.json` dependencies.

    "reflux": "^0.2.7"

Alternatively, you can install it from the command line.

    npm install --save reflux

Then we need to add reflux to our component, `BlueBird.jsx`.

    var Reflux = require('reflux');


Creating a Store
----------------

Next we need to create a store. We will call this `BlueBirdStore.js`. Some people like to create separate folders for stores and actions, but we will keep them in the main `components` folder for now since we only have a few components.




why: because most of us are working with legacy systems





