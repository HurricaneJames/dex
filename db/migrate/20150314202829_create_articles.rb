class CreateArticles < ActiveRecord::Migration
  def change
    create_table :articles do |t|
      t.string :slug
      t.string :headline
      t.string :subheadline
      t.text :contributors
      t.datetime :date
      t.text :body
      t.string :state

      t.timestamps
    end
  end
end
