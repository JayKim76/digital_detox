require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'DetoxMonitor'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = 'MIT'
  s.author         = 'digital-detox-game'
  s.homepage       = 'https://github.com/JayKim76/digital_detox'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => 'https://github.com/JayKim76/digital_detox.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
