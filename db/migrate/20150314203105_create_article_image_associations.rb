class CreateArticleImageAssociations < ActiveRecord::Migration
  def change
    create_table :article_image_associations do |t|
      t.references :article, index: true
      t.references :image, index: true

      t.timestamps
    end
  end
end
