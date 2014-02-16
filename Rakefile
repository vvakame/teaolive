require 'rubygems'
require 'rdiscount'
require 'rocco/tasks'

namespace :docs do

    Rocco::make './web', '*.dart', {:language => "dart", :comment_chars => "//", :template_file => "web/layout.mustache"}

    desc 'Build docs'
    task :build => :rocco

end
