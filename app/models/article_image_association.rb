class ArticleImageAssociation < ActiveRecord::Base
  belongs_to :article
  belongs_to :image
  accepts_nested_attributes_for :image
end
