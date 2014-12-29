require File.expand_path('../boot', __FILE__)

require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "sprockets/railtie"

Bundler.require(*Rails.groups)

module Rex
  class Application < Rails::Application
    # configure the react sprockets plugin  
    config.react.variant      = :production
    config.react.addons       = true

    # browserify for CommonJS and JSX transform
    config.browserify_rails.commandline_options = "--transform reactify --extension=\".jsx\""
  end
end
