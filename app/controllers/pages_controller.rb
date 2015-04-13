
class PagesController < ApplicationController
  include ApplicationHelper

  def index
  end

  def breaking
  end

  def playbox
  end

  def dex
  end

  def demo1
    @disable_foundation = true
  end

  def bluebird
  end

  def breaking_news
    # headers['Last-Modified'] = Time.now.httpdate
    # render json: ApplicationHelper.getContentAPIData(params[:params])
  end
end
