class Image < ActiveRecord::Base
  mount_uploader :link, ImageUploader

  has_many :article_image_associations, dependent: :destroy
  has_many :articles, through: :article_image_associations

  # def link=(val)
  #   if !val.is_a?(String) && valid?
  #     image_will_change!
  #     super
  #   end
  # end
end
