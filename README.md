# gomamayo.js
1. [Install MeCab](https://taku910.github.io/mecab/) in your OS
1. run: `npm install gomamayo-js`
1. やっていってください
## Example
```
import findGomamayo from 'gomamayo-js';

(async function () {
  const result = await findGomamayo('コンセントとうもろこし')
  if (result) { // gomamayo detected
    console.log('ゴママヨやね: ')
    console.log(result[0]) // string[] of gomamayo will be printed
    console.log(result[1]) // string[][][] of raw information parsed by MeCab will be printed
  } else if (result === null) {
    console.log('未検出') // no gomamayo detected
  }
})
```
## License
This software is released under the MIT License.
