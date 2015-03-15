class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.string :slug
      t.text :caption
      t.text :copyright
      t.string :owner
      t.string :link

      t.timestamps
    end
  end
end
