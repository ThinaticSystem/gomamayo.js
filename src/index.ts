import * as MeCab from 'mecab-async'
const vowel = require('../assets/vowel_define.json')

export async function find(inputString: string): Promise<(string[] | string[][][])[] | null | void> {
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
  function parseMecab(input: string): Promise<string[][]> {
    return new Promise((resolve, reject) => {
      MeCab.parse(input, (error: Error, result: string[][]) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  async function analyse(input: string): Promise<string[][][]> {
    const result = await parseMecab(input)
    const gomamArray: string[][][] = []
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1]
      const now = result[i]
      if (prev[1] === '名詞' && prev[2] !== '数詞' && now[1] === prev[1]) {
        const prevYomi = prolongedSoundMarkVowelize((prev[9] === '*' || prev[9] === undefined) ? prev[0] : prev[9]) // 読み登録なし=>'*', unk=>undefined
        const nowYomi = hiraToKana((now[9] === '*' || now[9] === undefined) ? now[0] : now[9])
        if (prevYomi.slice(-1) === nowYomi.slice(0, 1)) {
          gomamArray.push([prev, now])
        }
      }
    }

    function hiraToKana(str: string) {
      return str.replace(/[ぁ-ゖ]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) + 0x60)
      })
    }

    function prolongedSoundMarkVowelize(str: string) { // 長音を母音に変換。副作用でカタカナになる
      let converted = hiraToKana(str[0])
      for (let i = 1; i < str.length; i++) {
        const key = str[i - 1]
        converted += (str[i] === 'ー') ? vowel[key] : str[i]
      }
      return converted
    }

    return gomamArray
  }

  try {
    return await analyse(sanitize(inputStr))
  } catch (error) { /*to be returned undefined*/console.error(error) }

  function sanitize(inputStr: string): string {
    // node-mecab-asyncでshell-quote使ってるからだいじょぶそう
    return inputStr
  }
}
