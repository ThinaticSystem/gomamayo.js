import * as MeCab from 'mecab-async'
const vowel = require('../assets/vowel_define.json')

export async function find(inputString: string): Promise<[string[], [string[], string[]][]] | null | undefined> {
  const mecabRes = await analyseString(inputString)
  if (!mecabRes) {
    return /*めかぶエラー*/
  }
  if (mecabRes.length == 0) {
    return null /*ノーゴママヨ*/
  }
  const jointStrings: string[] = mecabRes.map(gomamayo => {
    return gomamayo.map(part => part[0]).join('')
  })
  return [jointStrings, mecabRes]
}

async function analyseString(inputStr: string): Promise<[string[], string[]][] | undefined> {
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

  async function analyse(input: string): Promise<[string[], string[]][]> {
    const result = await parseMecab(input)
    const gomamArray: [string[], string[]][] = []
    for (let i = 0; i < result.length - 1; i++) {
      const first = result[i]
      const second = result[i + 1]
      if (first[1] !== '名詞' || first[2] === '数詞' || second[1] !== first[1]) {
        continue
      }
      const firstYomi = prolongedSoundMarkVowelize((first[9] === '*' || first[9] === undefined) ? first[0] : first[9]) // 読み登録なし=>'*', unk=>undefined
      const secondYomi = hiraToKana((second[9] === '*' || second[9] === undefined) ? second[0] : second[9])
      if (firstYomi[firstYomi.length - 1] !== secondYomi[0]) {
        continue
      }
      gomamArray.push([first, second])
    }

    function hiraToKana(str: string) {
      return str.replace(/[ぁ-ゖ]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) + 0x60)
      })
    }

    function prolongedSoundMarkVowelize(str: string) { // 長音を母音に変換。副作用でカタカナになる
      let converted = hiraToKana(str[0])
      for (let i = 0; i < str.length - 1; i++) {
        const prev = str[i]
        const current = str[i + 1]
        converted += (current === 'ー') ? vowel[prev] : current
      }
      return converted
    }

    return gomamArray
  }

  try {
    return await analyse(sanitize(inputStr))
  } catch (error) {
    console.error(error)
    return /*to be returned undefined*/
  }

  function sanitize(inputStr: string): string {
    // node-mecab-asyncでshell-quote使ってるからだいじょぶそう
    return inputStr
  }
}
