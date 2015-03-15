class Article < ActiveRecord::Base
  has_many :article_image_associations, -> { order(position: :asc) }, dependent: :destroy
  has_many :images, through: :article_image_associations
  accepts_nested_attributes_for :article_image_associations, allow_destroy: true
  accepts_nested_attributes_for :images
end
