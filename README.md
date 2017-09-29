npm install rnpm -g
brew install android-platform-tools

Upgrade React Native: npm install -g react-native-git-upgrade

# Android
- Change the following under `build.gradle` in `instabug-reactnative` package
`
compileSdkVersion 23
buildToolsVersion "23.0.1"
`

# Code Push
│ Name       │ Deployment Key                        │
├────────────┼───────────────────────────────────────┤
│ Production │ sgqmKeI1eTfG1ZrKseTEQdXMMAV14yAw9NvFM │
├────────────┼───────────────────────────────────────┤
│ Staging    │ OjPq8NnRCKjyNptaAKEm_WH5q6hv4yAw9NvFM │


- Push changes to Staging
`code-push release-react thesportspool ios -m --description ""`
- Releasing to Production
`code-push promote thesportspool Staging Production`
