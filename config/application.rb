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
    config.autoload_paths += %W(#{config.root}/app/uploaders)

    # configure generators
    config.generators.assets = false
    config.generators.helper = false
    config.generators.test_framework = nil
    config.generators.stylesheets = false


    # configure the react sprockets plugin  
    config.react.variant      = :production
    config.react.addons       = true

    # browserify for CommonJS and JSX transform
    config.browserify_rails.commandline_options = "--transform reactify --extension=\".jsx\""
  end
end
