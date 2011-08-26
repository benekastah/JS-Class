desc "does a full build and `git commit`s repository"
task :commit => [:build] do |msg|
  puts command = "git add build"
  puts `#{command}`
  puts command = "git commit -am '#{msg}'"
  puts `#{command}`
end

desc "Builds javascript and documentation files, and runs unit tests"
task :build => [:build_js, :build_docs, :run_tests] do
end

desc "Builds javascript"
task :build_js do
  puts "Compressing Javascript to build/class.js..."
  `uglifyjs --lift-vars -o build/class.js src/class.js`
end

desc "Builds documentation"
task :build_docs do
  puts "Building documentation files to docs/..."
  `bin/docco src/*`
end

desc "Runs tests"
task :run_tests do
  puts "Running unit tests...\n\n"
  puts `bin/jasmine test`
end