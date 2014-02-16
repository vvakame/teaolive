rm -rf packages *.html *.css *.js *.map *.mustache
cd src
rake docs:build && pub build && cp -r build/* ../ && cd ../ && cp introduction.html index.html
