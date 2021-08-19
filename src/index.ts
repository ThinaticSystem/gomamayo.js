import * as MeCab from 'mecab-async'
const vowel = require('../assets/vowel_define.json')


module.exports.find = findGomamayo

async function findGomamayo(inputString: string): Promise<(string[] | string[][][])[] | null | void> {
  const mecabRes = await analyseString(inputString)
  if (mecabRes) {
    if (mecabRes.length) {
      const gomamayoStrArray: string[] = []
      mecabRes.forEach(gomamayo => {
        let mergedString: string = ''
        gomamayo.forEach(part => {
          mergedString += part[0]
        })
        gomamayoStrArray.push(mergedString)
      })
      return [gomamayoStrArray, mecabRes]
    } else {
      return null /*ノーゴママヨ*/
    }
  } else {
    /*めかぶエラー*/
  }
}

async function analyseString(inputStr: string): Promise<string[][][] | void> {
  const mecabPromise = (input: String): Promise<string[][][]> => new Promise((resolve, reject) => {
    MeCab.parse(input, function (error: Error, result: string[][]) {
      if (!error) {
        const gomamArray: string[][][] = []
        for (let i = 1; i < result.length; i++) {
          const prev = result[i - 1]
          const now = result[i];
          if (prev[1] === '名詞' && prev[2] !== '数詞' && now[1] === prev[1]) {
            const prevYomi = (prev[9] === '*' || prev[9] === undefined) ? prolongedSoundMarkVowelize(prev[0]) : prolongedSoundMarkVowelize(prev[9]) // 読み登録なし=>'*', unk=>undefined
            const nowYomi = (now[9] === '*' || now[9] === undefined) ? hiraToKana(now[0]) : hiraToKana(now[9])
            if (prevYomi.slice(-1) === nowYomi.slice(0, 1)) {
              gomamArray.push([prev, now])
            }
          }
        }
        resolve(gomamArray)
      } else {
        reject(error)
      }

      function hiraToKana(inStr: string) {
        return inStr.replace(/[ぁ-ゖ]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) + 0x60)
        })
      }

      function prolongedSoundMarkVowelize(string: string) { // 長音を母音に変換。副作用でカタカナになる
        let converted = hiraToKana(string[0])
        for (let i = 1; i < string.length; i++) {
          const key = string[i - 1]
          converted += (string[i] === 'ー') ? vowel[key] : string[i]
        }
        return converted
      }
    })
  })

  try {
    return mecabPromise(sanitize(inputStr))
  } catch (error) { /*to be returned undefined*/console.error(error) }

  function sanitize(inputStr: string): string {
    // node-mecab-asyncでshell-quote使ってるからだいじょぶそう
    return inputStr
  }
}
