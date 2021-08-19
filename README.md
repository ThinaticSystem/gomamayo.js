# go**mama**yo.js
1. [Install MeCab](https://taku910.github.io/mecab/) in your OS
1. run: `npm install gomamayo-js`
1. やっていってください
## Example
```
const gomamayo = require('gomamayo-js');

(async function () { // Because top-level async function won't be executed
  const result = await gomamayo.find('コンセントとうもろこし')
  if (result) { // gomamayo detected
    console.log('ゴママヨやね: ')
    console.log(result[0]) // string[] of gomamayo will be printed
    console.log(result[1]) // string[][][] of raw information parsed by MeCab will be printed
  } else if (result === null) {
    console.log('未検出') // no gomamayo detected
  }
})
```
## List o**f f**unctions
* find
* findSync (wip)
## CLI Tool
run `honi@honi-machine:/gomamayo.js_installed_directory$ npm run cli ごまマヨネーズ`
```

> gomamayo-js@0.1.2 cli
> node ./built/cli.js "ごまマヨネーズ"

入力文字列　　　: ごまマヨネーズ

解析結果:
[ 'ごまマヨネーズ' ]

解析内容:
[
  [
    [
      'ごま',
      '名詞',
      '普通名詞',
      '*',
      '*',
      'ごま',
      'ごま',
      '代表表記:胡麻/ごま カテゴリ:植物;人工物-食べ物 ドメイン:料理・食事'
    ],
    [
      'マヨネーズ',
      '名詞',
      '普通名詞',
      '*',
      '*',
      'マヨネーズ',
      'まよねーず',
      '代表表記:マヨネーズ/まよねーず カテゴリ:人工物-食べ物 ドメイン:料理・食事'
    ]
  ]
]
```
## License
This software is released under the MIT License.
