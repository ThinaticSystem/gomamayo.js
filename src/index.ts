import * as MeCab from 'mecab-async'

export default async function (inputString: string): Promise<(string[] | string[][][])[] | null | void> {
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
            if (
              ((prev[6] === '*') ? kataToHira(prev[0]) : prev[6]).slice(-1)
              === ((now[6] === '*') ? kataToHira(now[0]) : now[6]).slice(0, 1)
            )
              gomamArray.push([prev, now])
          }
        }
        resolve(gomamArray)
      } else {
        reject(error)
      }

      function kataToHira(inStr: string) { // to be hoisted
        return inStr.replace(/[ァ-ン]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 0x60)
        })
      }
    })
  })

  try {
    return mecabPromise(sanitize(inputStr))
  } catch (error) { /*to be returned undefined*/console.error(error) }

  function sanitize(inputStr: string): string { // to be hoisted
    // node-mecab-asyncでshell-quote使ってるからだいじょぶそう
    return inputStr
  }
}
