class AddPositionToArticleImageAssociations < ActiveRecord::Migration
  def change
    add_column :article_image_associations, :position, :integer
  end
end
