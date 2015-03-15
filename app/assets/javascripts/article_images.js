var $ = jQuery;

function addImageUpload() {
  var nameBase = 'article[images_attributes][' + Date.now() + ']'
    , linkName = nameBase + '[link]'
    , slugName = nameBase + '[slug]';
  $('#added-stuff').append("<div><input type='file' name='" + linkName + "' /><input type='text' name='" + slugName + "' /></div>");
}

function addBySlug() {
  $('#add-by-slug').append("<input type='text' name='add_slug[" + Date.now() + "]' />");
}

$(document).ready(function() {
  $('#article-image-add .upload').on('click', function(e) { addImageUpload(); });
  $('#article-image-add .addBySlug').on('click', function(e) { addBySlug(); });
});