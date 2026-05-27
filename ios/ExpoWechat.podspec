require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoWechat'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.swift_version  = '5.4'
  s.source         = { git: 'https://github.com/likeSo/expo-wechat' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  if ENV['EXPO_WECHAT_ENABLE_PAY'] == '1'
    s.dependency 'WechatOpenSDK-XCFramework', '~> 2.0.5'
  
    swift_conditions = '$(inherited) EXPO_WECHAT_ENABLE_PAY'
  else
    s.dependency 'OpenWeChatSDKNoPay', '~> 2.0.5'
  
    swift_conditions = '$(inherited)'
  end
  
  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => swift_conditions
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
