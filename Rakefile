require 'rubygems'
require 'rdiscount'
require 'rocco/tasks'

namespace :docs do

    Rocco::make './', '*.dart', {:language => "dart", :comment_chars => "//", :template_file => "src/layout.mustache"}

    desc 'Build docs'
    task :build => :rocco

end
