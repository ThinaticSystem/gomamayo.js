import * as MeCab from 'mecab-async'
const vowel = require('../assets/vowel_define.json')

export type MecabToken = [string, string, string, string, string, string, string, string, string, string]

export type Word = MecabToken

export type WordPair = [Word, Word]

function parseMecab(input: string): Promise<MecabToken[]> {
  return new Promise((resolve, reject) => {
    MeCab.parse(input, (error: Error, result: MecabToken[]) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
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

function analyse(tokens: MecabToken[]): WordPair[] {
  const gomamArray: WordPair[] = []
  for (let i = 0; i < tokens.length - 1; i++) {
    const first = tokens[i]
    const second = tokens[i + 1]
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
  return gomamArray
}

function sanitize(inputStr: string): string {
  // node-mecab-asyncでshell-quote使ってるからだいじょぶそう
  return inputStr
}

export async function find(inputString: string): Promise<[string[], WordPair[]] | null | undefined> {
  let tokens: MecabToken[]
  try {
    tokens = await parseMecab(sanitize(inputString))
  } catch (error) {
    console.error(error)
    return /*めかぶエラー*/
  }
  const gomamayoDetail = analyse(tokens)
  if (gomamayoDetail.length == 0) {
    return null /*ノーゴママヨ*/
  }
  const gomamayoArray: string[] = gomamayoDetail.map(gomamayo => {
    return gomamayo[0][0] + gomamayo[1][0]
  })
  return [gomamayoArray, gomamayoDetail]
}
