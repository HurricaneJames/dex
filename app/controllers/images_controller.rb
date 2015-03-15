class ImagesController < ApplicationController
  def index
    @images = Image.all
  end

  def show
    @image = Image.find(params[:id])
  end

  def new
    @image = Image.new
    render action: :edit
  end

  def edit
    @image = Image.find params[:id]
  end

  def create
    @image = Image.new image_params
    if @image.save
      redirect_to edit_image_path @image
    else
      flash[:warning] = "Could not create image"
      render action: :edit
    end
  end

  def update
    @image = Image.find params[:id]
    if @image.update image_params
      redirect_to edit_image_path @image
    else
      flash[:warning] = "Error updating image."
      render action: :edit
    end
  end

  def destroy
    @image = Image.find params[:id]
    if(@image.destroy)
      redirect_to images_path
    else
      flash[:warning] = "Could not delete image."
      render action: :edit
    end
  end

  def image_params
    params.require(:image).permit(:slug, :link, :caption, :copyright, :owner)
  end
end
