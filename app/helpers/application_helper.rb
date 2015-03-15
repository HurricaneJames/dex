module ApplicationHelper

  def parse_body(body, images)
    ret_body = body.gsub(/\r/, '').gsub(/\n/, '<br />')
    index = 0
    ret_body.gsub('[image]') { |match| images[index=index+1] ? image_tag(images[index].try(:link), width: '230') : '' }.html_safe
  end

  def state_options
    [["Working", 'working'], ["Live", 'live']]
  end
end
