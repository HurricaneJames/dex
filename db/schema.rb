# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150314225053) do

  create_table "article_image_associations", force: true do |t|
    t.integer  "article_id"
    t.integer  "image_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "position"
  end

  add_index "article_image_associations", ["article_id"], name: "index_article_image_associations_on_article_id"
  add_index "article_image_associations", ["image_id"], name: "index_article_image_associations_on_image_id"

  create_table "articles", force: true do |t|
    t.string   "slug"
    t.string   "headline"
    t.string   "subheadline"
    t.text     "contributors"
    t.datetime "date"
    t.text     "body"
    t.string   "state"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "images", force: true do |t|
    t.string   "slug"
    t.text     "caption"
    t.text     "copyright"
    t.string   "owner"
    t.string   "link"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
