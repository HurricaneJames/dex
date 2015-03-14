Rails.application.routes.draw do
  get 'pages/index'
  get 'pages/dex'
  get 'pages/breaking_news'
  get 'pages/playbox'
  get 'pages/breaking'
  get 'pages/demo1'
  get 'pages/bluebird'
  root to: 'pages#index'
end
