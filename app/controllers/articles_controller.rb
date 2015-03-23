class ArticlesController < ApplicationController
  def index
    @articles = Article.where(state: 'live')
  end

  def show
    @article = Article.find params[:id]
    if(@article.blank? || @article.state != 'live')
      return redirect_to articles_path
    end
  end

  def new
    @article = Article.new
    respond_to do |format|
      format.html { render action: :edit }
      format.json { render json: @article }
    end
  end

  def edit
    @article = Article.find(params[:id])
    respond_to do |format|
      format.html { render :edit }
      format.json { render json: @article }
    end
  end

  def create
    @article = Article.new article_params
    if @article.save
      redirect_to edit_article_path @article
    else
      flash[:warning] = "Error creating article."
      render action: :edit
    end
  end

  def update
    @article = Article.find params[:id]
    slug_adds = params[:add_slug].collect { |slug| Image.where(slug: slug) } if params[:add_slug].present?
    if @article.update article_params
      @article.images << slug_adds if slug_adds.present?
      redirect_to edit_article_path @article
    else
      flash[:warning] = "Error updating article."
      render action: :edit
    end
  end

  def destroy
    @article = Article.find params[:id]
    if @article.destroy
      redirect_to articles_path
    else
      flash[:warning] = "Could not destory article"
      render action: :edit
    end
  end

  def article_params
    params.require(:article).permit(:slug, :headline, :subheadline, :contributors, :date, :body, :state,
      article_image_associations_attributes: [
        :id,
        :position,
        :_destroy,
        image_attributes: [
          :link,
          :slug
        ]
      ],
      images_attributes: [:id, :link, :slug] )
  end
end
