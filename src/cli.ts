import findGomamayo from './index'

(async function () {
  const inString: string = process.argv[2]
  console.log(`入力文字列　　　: ${inString}`)
  const res = await findGomamayo(inString)

  console.log('\n解析結果:')
  if (res) {
    console.log(res[0])
    console.log('\n解析内容:')
    console.log(res[1])
  } else if (res === null) {
    console.log('未検出')
  } else /*undefined*/ {
    console.log('エラー\nMeCabがインストールされてないかもです')
  }
}()
);
