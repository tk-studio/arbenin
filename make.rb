# ...

class Helpers
  def partial(template)
    ::Haml::Engine.new(File.read("app/haml/include/_#{template}.haml")).render(Helpers.new)
  end
end

engine = ::Haml::Engine.new(File.read('app/haml/index.haml'))
File.open("app/index.html", "w"){|f| f.write engine.render(Helpers.new)}